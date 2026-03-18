import base64
import os
import json
import cv2
import numpy as np

# ── Model loading (once at startup) ────────────────────────────────────────────
_MODEL      = None
_LABELS     = None
_LABEL_MAP  = None
_MODEL_ERR  = None

IMG_SIZE = 48
MODEL_PATH  = os.path.join(os.path.dirname(__file__), "models", "face_emotion_model.h5")
LABELS_PATH = os.path.join(os.path.dirname(__file__), "models", "face_labels.json")

_DEFAULT_LABEL_MAP = {
    "Angry": "Angry", "Disgust": "Angry", "Fear": "Anxious",
    "Happy": "Happy", "Sad": "Sad", "Surprise": "Excited", "Neutral": "Calm",
}


def _load_model():
    global _MODEL, _LABELS, _LABEL_MAP, _MODEL_ERR
    if _MODEL is not None or _MODEL_ERR is not None:
        return _MODEL
    if not os.path.exists(MODEL_PATH):
        _MODEL_ERR = f"Model not found: {MODEL_PATH} — run train_face_model.py first"
        print(f"⚠️  {_MODEL_ERR}")
        return None
    try:
        from tensorflow.keras.models import load_model  # type: ignore
        _MODEL = load_model(MODEL_PATH)
        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH) as f:
                meta = json.load(f)
            _LABELS    = meta["labels"]
            _LABEL_MAP = meta["label_map"]
        else:
            _LABELS    = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]
            _LABEL_MAP = _DEFAULT_LABEL_MAP
        print(f"✅ Face emotion model loaded from {MODEL_PATH}")
    except Exception as e:
        _MODEL_ERR = str(e)
        print(f"⚠️  Could not load face model: {e}")
    return _MODEL


def _predict_with_model(img_gray):
    """Run the trained CNN on a grayscale face crop."""
    model = _load_model()
    if model is None:
        return None, 0.0
    resized = cv2.resize(img_gray, (IMG_SIZE, IMG_SIZE))
    arr = resized.astype(np.float32) / 255.0
    arr = arr.reshape(1, IMG_SIZE, IMG_SIZE, 1)
    probs = model.predict(arr, verbose=0)[0]
    idx   = int(np.argmax(probs))
    conf  = float(probs[idx])
    label = _LABELS[idx] if _LABELS else str(idx)
    return (_LABEL_MAP or _DEFAULT_LABEL_MAP).get(label, "Calm"), conf


def analyze_face_emotion(image_base64):
    """
    Analyze face emotion from a base64-encoded image.

    Priority:
      1. Trained CNN (ml/models/face_emotion_model.h5)
      2. DeepFace (if installed)
      3. Basic OpenCV brightness heuristic
    Returns: mood string + confidence float via _analyze_face_emotion_full()
    """
    result = _analyze_face_emotion_full(image_base64)
    return result["emotion"]


def _analyze_face_emotion_full(image_base64):
    """Return dict with emotion, confidence, source."""
    try:
        header, encoded = image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return {"emotion": "Calm", "confidence": 0.0, "source": "fallback"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        if len(faces) == 0:
            faces = [(0, 0, gray.shape[1], gray.shape[0])]  # full image fallback

        x, y, w, h = faces[0]
        face_gray = gray[y:y+h, x:x+w]

        # 1️⃣  Trained CNN
        emotion, conf = _predict_with_model(face_gray)
        if emotion is not None:
            print(f"✅ Face (trained model): {emotion} ({conf:.2f})")
            return {"emotion": emotion, "confidence": conf, "source": "trained_model"}

        # 2️⃣  DeepFace
        try:
            from deepface import DeepFace  # type: ignore
            result_df = DeepFace.analyze(img, actions=["emotion"], enforce_detection=False)
            if isinstance(result_df, list):
                result_df = result_df[0]
            raw = result_df["dominant_emotion"]
            df_map = {
                "happy": "Happy", "sad": "Sad", "angry": "Angry",
                "neutral": "Calm", "fear": "Anxious",
                "surprise": "Excited", "disgust": "Angry",
            }
            emotion = df_map.get(raw.lower(), "Calm")
            conf    = float(result_df["emotion"].get(raw, 50)) / 100.0
            print(f"✅ Face (DeepFace): {raw} → {emotion} ({conf:.2f})")
            return {"emotion": emotion, "confidence": conf, "source": "deepface"}
        except Exception:
            pass

        # 3️⃣  Brightness heuristic
        return _basic_face_detection_full(face_gray)

    except Exception as e:
        print(f"❌ Face analysis error: {e}")
        return {"emotion": "Calm", "confidence": 0.0, "source": "error"}
def _basic_face_detection_full(face_gray):
    """Brightness heuristic on an already-cropped face ROI."""
    avg_brightness = float(np.mean(face_gray))
    if avg_brightness > 140:
        mood, conf = "Happy", 0.45
    elif avg_brightness < 80:
        mood, conf = "Sad", 0.40
    else:
        mood, conf = "Calm", 0.35
    print(f"✅ Face (brightness heuristic): brightness={avg_brightness:.1f} → {mood}")
    return {"emotion": mood, "confidence": conf, "source": "heuristic"}


# Keep legacy name for any existing callers
def _basic_face_detection(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    return _basic_face_detection_full(gray)["emotion"]
