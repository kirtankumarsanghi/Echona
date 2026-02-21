import base64
import cv2
import numpy as np

def analyze_face_emotion(image_base64):
    """
    Analyze face emotion from base64 image.
    Uses DeepFace if available, otherwise falls back to basic detection.
    """
    try:
        # Decode image
        header, encoded = image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            print("⚠️ Could not decode image")
            return "Calm"

        # Try to use DeepFace if available
        try:
            from deepface import DeepFace

            # DeepFace 0.0.75 does NOT support 'silent' kwarg
            result = DeepFace.analyze(
                img,
                actions=["emotion"],
                enforce_detection=False,
            )

            # DeepFace 0.0.75 returns a dict; newer versions return a list
            if isinstance(result, list):
                result = result[0]

            emotion = result["dominant_emotion"]
            
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
            
            mapped_emotion = emotion_mapping.get(emotion.lower(), "Calm")
            print(f"✅ Face analysis: {emotion} → {mapped_emotion}")
            return mapped_emotion

        except ImportError:
            print("⚠️ DeepFace not available, using basic face detection")
            return _basic_face_detection(img)
        except Exception as deepface_error:
            print(f"⚠️ DeepFace error: {deepface_error}, falling back to basic detection")
            return _basic_face_detection(img)

    except Exception as e:
        print(f"❌ Face analysis error: {e}")
        return "Calm"


def _basic_face_detection(img):
    """
    Basic face detection fallback using OpenCV Haar Cascades.
    Returns a mood based on simple heuristics.
    """
    try:
        # Load Haar Cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            print("⚠️ No face detected")
            return "Calm"
        
        # Face detected - analyze brightness as simple heuristic
        # Brighter faces often correlate with positive emotions in controlled lighting
        for (x, y, w, h) in faces:
            face_roi = gray[y:y+h, x:x+w]
            avg_brightness = np.mean(face_roi)
            
            # Simple heuristic based on brightness and contrast
            if avg_brightness > 140:
                mood = "Happy"
            elif avg_brightness < 80:
                mood = "Sad"
            else:
                mood = "Calm"
            
            print(f"✅ Basic face detection: brightness={avg_brightness:.1f} → {mood}")
            return mood
        
        return "Calm"
        
    except Exception as e:
        print(f"⚠️ Basic face detection error: {e}")
        return "Calm"
