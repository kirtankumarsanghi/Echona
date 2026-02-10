import base64
import cv2
import numpy as np
from deepface import DeepFace

def detect_face_emotion(image_base64):
    try:
        # Remove base64 header
        header, encoded = image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        # Convert bytes → OpenCV image
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        cv2.imwrite("debug_face.jpg", img)


        if img is None:
            return {"error": "Invalid image"}

        # DeepFace analysis
        result = DeepFace.analyze(
            img,
            actions=["emotion"],
            enforce_detection=True
        )

        emotion = result[0]["dominant_emotion"]
        return {"mood": emotion.capitalize()}

    except Exception as e:
        print("❌ Face detection error:", e)
        return {"error": "Face detection failed"}
