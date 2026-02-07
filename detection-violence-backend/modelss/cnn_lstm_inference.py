# ===== models/cnn_lstm_inference.py =====
import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.metrics import Precision, Recall # type: ignore
from tensorflow.keras.models import load_model # type: ignore

# --- 1) Video → RGB-only preprocessing -----------------------------------
def preprocess_video_dynamic(video_path, frame_size=(224, 224), max_frames=30):
    # Convert TF Tensor to Python string
    if isinstance(video_path, tf.Tensor):
        video_path = video_path.numpy().decode('utf-8')
    # Ensure frame_size is tuple of ints
    if hasattr(frame_size, 'numpy'):
        frame_size = tuple(int(x) for x in frame_size.numpy())
    else:
        frame_size = (int(frame_size[0]), int(frame_size[1]))

    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total <= 0 or not cap.isOpened():
        cap.release()
        return np.zeros((max_frames, frame_size[1], frame_size[0], 3), np.float32)

    idxs = np.linspace(0, total - 1, num=max_frames, dtype=int)
    frames = []
    for i in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((frame_size[1], frame_size[0], 3), np.float32))
        else:
            frm = cv2.resize(frame, frame_size)
            frm = cv2.cvtColor(frm, cv2.COLOR_BGR2RGB) / 255.0
            frames.append(frm.astype(np.float32))
    cap.release()
    return np.stack(frames, axis=0)

# --- 2) tf.data pipeline --------------------------------------------------
def tf_preprocess_video(video_path, frame_size, max_frames):
    v = tf.py_function(
        func=preprocess_video_dynamic,
        inp=[video_path, frame_size, max_frames],
        Tout=tf.float32
    )
    v.set_shape((max_frames, frame_size[1], frame_size[0], 3))
    return v


def get_rgb_tf_dataset(df, batch_size, frame_size, max_frames, shuffle=False):
    paths = df['video_path'].values
    labels = df['label'].values
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    def _parse(p, y):
        return tf_preprocess_video(p, frame_size, max_frames), y

    ds = ds.map(_parse, num_parallel_calls=tf.data.AUTOTUNE)
    if shuffle:
        ds = ds.shuffle(100)
    return ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)

# --- 3) Load & mount ------------------------------------------------------
# If using Colab, uncomment:
# from google.colab import drive
# drive.mount('/content/drive', force_remount=True)

MODEL_PATH = os.path.join("models", "CNNetLSTM.keras")
tf.keras.config.enable_unsafe_deserialization()
MODEL = load_model(
    MODEL_PATH,
    custom_objects={'Precision': Precision, 'Recall': Recall}
)

# --- 4) Inference on one clip ---------------------------------------------

BATCH_SIZE = 1
FRAME_SIZE = (224, 224)
MAX_FRAMES = 30
THRESHOLD = 0.5

def predict_cnn_lstm(video_path: str) -> dict:
    df_test = pd.DataFrame({
        'video_path': [video_path],
        'label':      [0]  # dummy
    })
    ds_test = get_rgb_tf_dataset(
        df_test,
        batch_size=BATCH_SIZE,
        frame_size=FRAME_SIZE,
        max_frames=MAX_FRAMES,
        shuffle=False
    )
    for rgb_batch, _ in ds_test.take(1):
        prob = MODEL.predict(rgb_batch)[0, 0]
        return {
            'filename': os.path.basename(video_path),
            'probability': float(prob),
            'is_violent': bool(prob > THRESHOLD)
        }

# ===== models/i3d_inference.py =====
import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.metrics import Precision, Recall # type: ignore
from tensorflow.keras.models import load_model # type: ignore

# ----- Constants (must match training) -----
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

# --- 1) Video → RGB-only preprocessing -----------------------------------
def preprocess_video_dynamic(video_path, frame_size=(224, 224), max_frames=30):
    # Convert TF Tensor to Python string if needed
    if isinstance(video_path, tf.Tensor):
        video_path = video_path.numpy().decode('utf-8')
    # Ensure frame_size is tuple of ints
    if hasattr(frame_size, 'numpy'):
        frame_size = tuple(int(x) for x in frame_size.numpy())
    else:
        frame_size = (int(frame_size[0]), int(frame_size[1]))

    cap = cv2.VideoCapture(video_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total <= 0 or not cap.isOpened():
        cap.release()
        return np.zeros((max_frames, frame_size[1], frame_size[0], 3), dtype=np.float32)

    idxs = np.linspace(0, total - 1, num=max_frames, dtype=int)
    frames = []
    for idx in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            frames.append(np.zeros((frame_size[1], frame_size[0], 3), dtype=np.float32))
        else:
            frm = cv2.resize(frame, frame_size)
            frm = cv2.cvtColor(frm, cv2.COLOR_BGR2RGB) / 255.0
            frames.append(frm.astype(np.float32))
    cap.release()
    return np.stack(frames, axis=0)

# --- 2) tf.data pipeline --------------------------------------------------
def tf_preprocess_video(video_path, frame_size, max_frames):
    video = tf.py_function(
        func=preprocess_video_dynamic,
        inp=[video_path, frame_size, max_frames],
        Tout=tf.float32
    )
    video.set_shape((max_frames, frame_size[1], frame_size[0], 3))
    return video


def get_rgb_tf_dataset(df, batch_size, frame_size, max_frames, shuffle=False):
    paths = df['video_path'].values
    labels = df['label'].values
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    def _parse(p, y):
        clip = tf_preprocess_video(p, frame_size, max_frames)
        return clip, y

    ds = ds.map(_parse, num_parallel_calls=tf.data.AUTOTUNE)
    if shuffle:
        ds = ds.shuffle(100)
    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds

# --- 3) Inference function ------------------------------------------------
def predict_i3d(video_path: str) -> dict:
    # Build one-row DataFrame
    df = pd.DataFrame({'video_path': [video_path], 'label': [0]})
    # Create dataset without shuffle
    ds = get_rgb_tf_dataset(
        df,
        batch_size=BATCH_SIZE,
        frame_size=FRAME_SIZE,
        max_frames=MAX_FRAMES,
        shuffle=False
    )
    # Take one batch and predict
    for clip_batch, _ in ds.take(1):
        prob = MODEL_I3D.predict(clip_batch)[0, 0]
        return {
            'filename': os.path.basename(video_path),
            'probability': float(prob),
            'is_violent': bool(prob > THRESHOLD_I3D)
        }