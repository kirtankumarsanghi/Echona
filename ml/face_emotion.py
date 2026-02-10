from deepface import DeepFace

def detect_face_emotion(image_path):
    analysis = DeepFace.analyze(
        img_path=image_path,
        actions=["emotion"],
        enforce_detection=False
    )
    return analysis[0]["dominant_emotion"]
