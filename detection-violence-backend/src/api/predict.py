import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.metrics import Precision, Recall

def preprocess_video_dynamic(video_path, frame_size=(224, 224), max_frames=30):
    # video_path est une string ici
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0 or not cap.isOpened():
        cap.release()
        return np.zeros((max_frames, frame_size[1], frame_size[0], 3), dtype=np.float32)

    indices = np.linspace(0, total_frames - 1, num=max_frames, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, frame_size)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame / 255.0)
        else:
            frames.append(np.zeros((frame_size[1], frame_size[0], 3), dtype=np.float32))
    cap.release()
    return np.array(frames, dtype=np.float32)

def preprocess_video_optical_flow(video_path, frame_size=(224, 224), max_frames=30):
    rgb_frames = preprocess_video_dynamic(video_path, frame_size, max_frames)
    gray_frames = []
    for frame in rgb_frames:
        frame_uint8 = (frame * 255).astype(np.uint8)
        gray = cv2.cvtColor(frame_uint8, cv2.COLOR_RGB2GRAY)
        gray_frames.append(gray)

    flow_frames = []
    h, w = gray_frames[0].shape
    flow_frames.append(np.zeros((h, w, 2), dtype=np.float32))  # first frame no previous
    for i in range(1, len(gray_frames)):
        prev_gray = gray_frames[i - 1]
        curr_gray = gray_frames[i]
        flow = cv2.calcOpticalFlowFarneback(prev_gray, curr_gray, None,
                                            pyr_scale=0.5, levels=3, winsize=15,
                                            iterations=3, poly_n=5, poly_sigma=1.2, flags=0)
        flow_frames.append(flow)
    return np.array(flow_frames, dtype=np.float32)

def tf_preprocess_video(video_path, frame_size, max_frames):
    video = tf.py_function(func=preprocess_video_dynamic,
                           inp=[video_path],
                           Tout=tf.float32)
    video.set_shape((max_frames, frame_size[1], frame_size[0], 3))
    return video

def tf_preprocess_video_flow(video_path, frame_size, max_frames):
    video = tf.py_function(func=preprocess_video_optical_flow,
                           inp=[video_path],
                           Tout=tf.float32)
    video.set_shape((max_frames, frame_size[1], frame_size[0], 2))
    return video

def get_tfdata_dataset_two_stream(video_path, frame_size, max_frames):
    # Crée un tf.data.Dataset avec un seul élément (le chemin de vidéo), label dummy 0
    ds = tf.data.Dataset.from_tensors(video_path)

    def parse_fn(video_path):
        rgb_video = tf.py_function(func=preprocess_video_dynamic,
                                   inp=[video_path],
                                   Tout=tf.float32)
        rgb_video.set_shape((max_frames, frame_size[1], frame_size[0], 3))

        flow_video = tf.py_function(func=preprocess_video_optical_flow,
                                    inp=[video_path],
                                    Tout=tf.float32)
        flow_video.set_shape((max_frames, frame_size[1], frame_size[0], 2))

        return (rgb_video, flow_video)

    ds = ds.map(parse_fn)
    ds = ds.batch(1)
    return ds

def main(video_path, model_path):
    # Paramètres fixes (à adapter si nécessaire)
    FRAME_SIZE = (224, 224)
    MAX_FRAMES = 30
    THRESHOLD = 0.517

    print(f"Chargement du modèle depuis : {model_path}")
    tf.keras.utils.enable_custom_object_scope({'Precision': Precision, 'Recall': Recall})
    model = load_model(model_path, custom_objects={'Precision': Precision, 'Recall': Recall})

    print(f"Prétraitement de la vidéo : {video_path}")
    ds = get_tfdata_dataset_two_stream(video_path, FRAME_SIZE, MAX_FRAMES)

    print("Prédiction...")
    for (rgb_batch, flow_batch) in ds.take(1):
        prob = model.predict([rgb_batch, flow_batch])[0, 0]
        print(f"Probabilité de violence brute : {prob:.4f}")
        if prob > THRESHOLD:
            print(f"➔ Violence détectée (probabilité > {THRESHOLD})")
        else:
            print(f"➔ Aucune violence détectée (probabilité ≤ {THRESHOLD})")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Prédiction violence sur vidéo avec modèle I3D Two-Stream")
    parser.add_argument("--video", type=str, required=True, help="Chemin vers la vidéo à analyser")
    parser.add_argument("--model", type=str, required=True, help="Chemin vers le modèle keras (.keras)")

    args = parser.parse_args()
    main(args.video, args.model)
