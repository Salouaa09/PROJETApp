# models/video_utils.py
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Model

def preprocess_video_dynamic(video_path, target_size=(224, 224), max_frames=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    idxs = np.linspace(0, total - 1, max_frames, dtype=int)

    for i in range(total):
        ret, frame = cap.read()
        if not ret:
            break
        if i in idxs:
            frame = cv2.resize(frame, target_size)
            frame = frame / 255.0
            frames.append(frame)

    cap.release()
    return np.array(frames)

def preprocess_video_optical_flow(video_path, target_size=(224, 224), max_frames=30):
    cap = cv2.VideoCapture(video_path)
    frames = []
    ret, prev = cap.read()
    if not ret:
        return np.zeros((max_frames, *target_size, 2))

    prev = cv2.resize(prev, target_size)
    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)

    count = 0
    while count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, target_size)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        flow = cv2.calcOpticalFlowFarneback(prev_gray, gray,
                                            None, 0.5, 3, 15, 3, 5, 1.2, 0)
        frames.append(flow)

        prev_gray = gray
        count += 1

    cap.release()
    return np.array(frames)

def make_gradcam_model(model, layer_name='conv3d_5'):
    conv_layer = model.get_layer(layer_name)
    return Model(inputs=model.inputs,
                 outputs=[conv_layer.output, model.output])

def compute_gradcam(grad_model, rgb_input, flow_input, class_index=0):
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model([rgb_input, flow_input])
        loss = predictions[:, class_index]

    grads = tape.gradient(loss, conv_outputs)[0]
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2, 3))
    conv_outputs = conv_outputs[0]

    heatmaps = []
    for t in range(conv_outputs.shape[0]):
        feature_map = conv_outputs[t]
        heatmap = np.maximum(np.sum(pooled_grads * feature_map, axis=-1), 0)
        heatmap /= np.max(heatmap) + 1e-6
        heatmaps.append(heatmap)

    return np.array(heatmaps)
