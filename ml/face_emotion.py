import base64
import cv2
import numpy as np
from deepface import DeepFace

def analyze_face_emotion(image_base64):
    try:
        header, encoded = image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return "neutral"

        # Analyze face emotion
        result = DeepFace.analyze(
            img,
            actions=["emotion"],
            enforce_detection=False
        )

        emotion = result[0]["dominant_emotion"]
        
        # Map DeepFace emotions to our mood categories
        emotion_mapping = {
            "happy": "Happy",
            "sad": "Sad",
            "angry": "Angry",
            "neutral": "Calm",
            "fear": "Anxious",
            "surprise": "Excited",
            "disgust": "Angry"
        }
        
        return emotion_mapping.get(emotion.lower(), "Calm")

    except Exception as e:
        print("❌ Face detection error:", e)
        return "Calm"
