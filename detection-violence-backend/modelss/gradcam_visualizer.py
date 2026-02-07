#models/gradcam_visualizer.py 
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model, Model
import os

# === CONSTANTES ===
FRAME_SIZE = (224, 224)
MAX_FRAMES = 30
THRESHOLD = 0.467
MODEL_PATH = os.path.join(os.path.dirname(__file__), "two_stream_i3d_model.keras")
TARGET_LAYER = 'conv3d_5'  # Change si ton modèle utilise un autre nom

# === PREPROCESSING RGB ===
def preprocess_rgb_segment(path):
    cap = cv2.VideoCapture(path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    idxs = np.linspace(0, total-1, num=MAX_FRAMES, dtype=int)

    frames = []
    for idx in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((FRAME_SIZE[1], FRAME_SIZE[0], 3), np.float32))
        else:
            f = cv2.resize(frame, FRAME_SIZE)
            f = cv2.cvtColor(f, cv2.COLOR_BGR2RGB)
            frames.append(f / 255.0)
    cap.release()
    return np.stack(frames, axis=0)

# === PREPROCESS FLOW ===
def preprocess_flow_segment(rgb):
    gray = [(f * 255).astype(np.uint8) for f in rgb]
    gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in gray]
    flows = [np.zeros((FRAME_SIZE[1], FRAME_SIZE[0], 2), np.float32)]
    for i in range(1, len(gray)):
        flow = cv2.calcOpticalFlowFarneback(
            gray[i-1], gray[i], None, 0.5, 3, 15, 3, 5, 1.2, 0
        )
        flows.append(flow)
    return np.stack(flows, axis=0)

# === MODEL ===
def make_gradcam_model(base_model, layer_name):
    return Model(
        inputs=base_model.inputs,
        outputs=[base_model.get_layer(layer_name).output, base_model.output]
    )

# === COMPUTE GRAD-CAM ===
def compute_gradcam(grad_model, rgb, flow, class_index=1):
    rgb = np.expand_dims(rgb, axis=0)
    flow = np.expand_dims(flow, axis=0)
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model([rgb, flow])
        loss = predictions[:, class_index]
    grads = tape.gradient(loss, conv_outputs)[0]
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2, 3))
    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs), axis=-1)
    heatmap = tf.nn.relu(heatmap)
    heatmap /= tf.reduce_max(heatmap) + 1e-6
    return heatmap.numpy()

# === SUPERPOSITION SUR FRAME ===
def overlay_heatmap(frame, heatmap):
    heatmap = cv2.resize(heatmap, (frame.shape[1], frame.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    output = cv2.addWeighted(frame, 0.6, heatmap_color, 0.4, 0)
    return output

# === MAIN ===
def visualize_violence(video_path):
    rgb = preprocess_rgb_segment(video_path)
    flow = preprocess_flow_segment(rgb)

    tf.keras.config.enable_unsafe_deserialization()
    model = load_model(MODEL_PATH)
    gradcam_model = make_gradcam_model(model, TARGET_LAYER)

    prob = float(model.predict([np.expand_dims(rgb, 0), np.expand_dims(flow, 0)])[0, 0])
    print(f"Score: {prob:.3f}")

    if prob < THRESHOLD:
        print("Pas de violence détectée.")
        return

    print("🎯 Violence détectée ! Affichage de la zone...")
    heatmap = compute_gradcam(gradcam_model, rgb, flow)

    # Prendre une frame au hasard (milieu)
    mid_frame = (rgb[MAX_FRAMES // 2] * 255).astype(np.uint8)
    frame_bgr = cv2.cvtColor(mid_frame, cv2.COLOR_RGB2BGR)
    result = overlay_heatmap(frame_bgr, heatmap)

    # Afficher
    cv2.imshow("Grad-CAM - Zone de violence", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Exemple d'utilisation
if __name__ == "__main__":
    video = "chemin/vers/ta/video.mp4"  # ⚠️ Modifie ce chemin
    visualize_violence(video)
