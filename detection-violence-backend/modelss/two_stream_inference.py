#models/two_stream_inference.py
import os
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.metrics import Precision, Recall

# ========== Constantes ==========
FRAME_SIZE   = (224, 224)
MAX_FRAMES   = 30
THRESHOLD    = 0.467
MODEL_FILE   = os.path.join(os.path.dirname(__file__), "two_stream_i3d_model.keras")
ANNOTATED_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), os.pardir, "annotated_videos")
)

# Forcer float32 (désactive mixed precision)
tf.keras.mixed_precision.set_global_policy('float32')
tf.keras.config.enable_unsafe_deserialization()

# ========== Chargement du modèle ==========
_MODEL = load_model(
    MODEL_FILE,
    custom_objects={"Precision": Precision, "Recall": Recall}
)

# ========== Utilitaires ==========
def _get_intervals(duration, full_video):
    if full_video or duration <= 5:
        return [(0.0, duration)]
    intervals, seg, start = [], 5.0, 0.0
    while start < duration:
        end = min(start + seg, duration)
        intervals.append((start, end))
        start = end
    return intervals


def _preprocess_segment(path, s, e):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    sf, ef = int(s * fps), min(int(e * fps), total - 1)
    idxs = np.linspace(sf, ef, num=MAX_FRAMES, dtype=int)

    rgbs, flows = [], []
    prev_gray = None
    for idx in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            rgb = np.zeros((*FRAME_SIZE, 3), np.float32)
            gray = np.zeros(FRAME_SIZE, np.uint8)
        else:
            rgb = cv2.resize(frame, FRAME_SIZE)
            rgb = cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB) / 255.0
            gray = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
        rgbs.append(rgb.astype(np.float32))

        if prev_gray is None:
            flows.append(np.zeros((FRAME_SIZE[1], FRAME_SIZE[0], 2), np.float32))
        else:
            fl = cv2.calcOpticalFlowFarneback(
                prev_gray, gray, None,
                pyr_scale=0.5, levels=3, winsize=15,
                iterations=3, poly_n=5, poly_sigma=1.2, flags=0
            )
            flows.append(fl.astype(np.float32))
        prev_gray = gray

    cap.release()
    return np.stack(rgbs), np.stack(flows)


# ========== Génération de la vidéo annotée ==========
def generate_annotated_video(video_path, intervals_violent):
    os.makedirs(ANNOTATED_DIR, exist_ok=True)
    base = os.path.splitext(os.path.basename(video_path))[0]
    out_path = os.path.join(ANNOTATED_DIR, f"{base}_annotated.mp4")

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(out_path, fourcc, fps, (w, h))

    # Lecture de la première frame
    ret, prev = cap.read()
    if not ret:
        cap.release()
        out.release()
        return out_path

    idx = 1
    # Boucle de traitement
    while True:
        ret, curr = cap.read()
        if not ret:
            # écrire la dernière frame s'il y en a
            out.write(prev)
            break

        t = idx / fps
        frame_to_write = curr.copy()

        # Si intervalle violent, on dessine le rectangle
        if any(s <= t <= e for (s, e) in intervals_violent):
            prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
            curr_gray = cv2.cvtColor(curr, cv2.COLOR_BGR2GRAY)

            flow = cv2.calcOpticalFlowFarneback(
                prev_gray, curr_gray, None,
                pyr_scale=0.5, levels=3, winsize=13,
                iterations=3, poly_n=5, poly_sigma=1.2, flags=0
            )

            mag = np.sqrt(flow[..., 0]**2 + flow[..., 1]**2)
            thr = max(np.mean(mag) + 1.75 * np.std(mag), 2.5)
            mask = (mag > thr).astype(np.uint8)

            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                largest = max(contours, key=cv2.contourArea)
                if cv2.contourArea(largest) > 800:
                    M = cv2.moments(largest)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        size = int(min(w, h) * 0.15)
                        x1 = max(cx - size, 0)
                        y1 = max(cy - size, 0)
                        x2 = min(cx + size, w)
                        y2 = min(cy + size, h)
                        cv2.rectangle(frame_to_write, (x1, y1), (x2, y2), (0, 0, 255), 3)

        out.write(frame_to_write)
        prev = curr.copy()
        idx += 1

    cap.release()
    out.release()
    return out_path


# ========== Fonction principale ==========
def predict_two_stream(video_path: str, full_video: bool = True) -> dict:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total / fps if fps > 0 else 0
    cap.release()

    intervals = _get_intervals(duration, full_video)
    preds, probs = [], []

    for s, e in intervals:
        rgb, flow = _preprocess_segment(video_path, s, e)
        inp_rgb = rgb[None].astype(np.float32)
        inp_flow = flow[None].astype(np.float32)
        out = _MODEL.predict([inp_rgb, inp_flow], verbose=0)[0]
        prob = float(out[1] if len(out) > 1 else out[0])
        state = "Violence détectée" if prob > THRESHOLD else "Aucune violence détectée"
        preds.append(f"[{s:.1f}s, {e:.1f}s] score : {prob:.3f} Etat : {state}")
        probs.append(prob)

    annotated = None
    if any(p > THRESHOLD for p in probs):
        iv = [(s, e) for (p, (s, e)) in zip(probs, intervals) if p > THRESHOLD]
        annotated = generate_annotated_video(video_path, iv)

    return {
        "filename": os.path.basename(video_path),
        "predictions": preds,
        "annotated_video_path": (
            f"/annotated/{os.path.basename(annotated)}" if annotated else None
        )
    }