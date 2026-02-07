# ===== models/i3d_inference.py =====
import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.metrics import Precision, Recall # type: ignore
from tensorflow.keras.models import load_model # type: ignore

# ----- Constants (match training) -----
BATCH_SIZE = 1
FRAME_SIZE = (224, 224)
MAX_FRAMES = 30
THRESHOLD_I3D = 0.517

# ----- Load I3D Model -----
MODEL_I3D_PATH = os.path.join("models", "i3d_model.keras")
tf.keras.config.enable_unsafe_deserialization()
MODEL_I3D = load_model(
    MODEL_I3D_PATH,
    custom_objects={ 'Precision': Precision, 'Recall': Recall }
)

# Preprocess RGB-only
def preprocess_video_i3d(video_path, frame_size=FRAME_SIZE, max_frames=MAX_FRAMES):
    if isinstance(video_path, tf.Tensor):
        video_path = video_path.numpy().decode('utf-8')
    frame_size = (int(frame_size[0]), int(frame_size[1]))

    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total <= 0 or not cap.isOpened():
        cap.release()
        return np.zeros((max_frames, frame_size[1], frame_size[0], 3), dtype=np.float32)

    indices = np.linspace(0, total - 1, num=max_frames, dtype=int)
    frames = []
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((frame_size[1], frame_size[0], 3), dtype=np.float32))
        else:
            frame = cv2.resize(frame, frame_size)
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) / 255.0
            frames.append(frame.astype(np.float32))
    cap.release()
    return np.stack(frames, axis=0)

# TF wrapper
def tf_preprocess_video_i3d(video_path, frame_size, max_frames):
    video = tf.py_function(
        func=preprocess_video_i3d,
        inp=[video_path, frame_size, max_frames],
        Tout=tf.float32
    )
    video.set_shape((max_frames, frame_size[1], frame_size[0], 3))
    return video

# Build dataset
def get_tfdata_dataset_i3d(df, batch_size=BATCH_SIZE):
    paths = df['video_path'].tolist()
    labels = df['label'].tolist()
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    def parse_fn(path, label):
        clip = tf_preprocess_video_i3d(path, FRAME_SIZE, MAX_FRAMES)
        return clip, label

    ds = ds.map(parse_fn, num_parallel_calls=tf.data.experimental.AUTOTUNE)
    ds = ds.batch(batch_size).prefetch(tf.data.experimental.AUTOTUNE)
    return ds

# Prediction function
def predict_i3d(video_path: str) -> dict:
    df = pd.DataFrame({'video_path': [video_path], 'label':[0]})
    ds = get_tfdata_dataset_i3d(df)
    for video_batch, _ in ds.take(1):
        prob = MODEL_I3D.predict(video_batch)[0,0]
        return {
            'filename': os.path.basename(video_path),
            'probability': float(prob),
            'is_violent': bool(prob > THRESHOLD_I3D)
        }
        
        