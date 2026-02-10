from transformers import pipeline

# Lazy load classifier to avoid startup issues
_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=False
        )
    return _classifier

def analyze_text_emotion(text):
    try:
        classifier = get_classifier()
        result = classifier(text)[0]
        emotion = result["label"].lower()
        
        # Map model emotions to our mood categories
        emotion_mapping = {
            "joy": "Happy",
            "sadness": "Sad",
            "anger": "Angry",
            "fear": "Anxious",
            "surprise": "Excited",
            "neutral": "Calm",
            "disgust": "Angry"
        }
        
        return emotion_mapping.get(emotion, "Calm")
    
    except Exception as e:
        print("❌ Text emotion error:", e)
        return "Calm"
