"""
Text emotion analysis using enhanced keyword-based detection.
Falls back gracefully if advanced NLP libraries are unavailable.
"""

import re

# Lazy load classifier to avoid startup issues
_classifier = None
_classifier_error = None

def get_classifier():
    """Try to load transformers, but don't fail if unavailable"""
    global _classifier, _classifier_error
    if _classifier is not None:
        return _classifier
    if _classifier_error is not None:
        return None
    
    try:
        from transformers import pipeline
        _classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=False
        )
        print("✅ Transformers loaded successfully")
        return _classifier
    except Exception as e:
        _classifier_error = str(e)
        print(f"⚠️ Transformers unavailable: {e}")
        return None


def analyze_text_emotion_simple(text):
    """
    Enhanced keyword-based emotion detection.
    More sophisticated than simple word matching.
    """
    text_lower = text.lower()
    
    # Emotion keywords with weights
    emotion_patterns = {
        "Happy": [
            (r'\b(happy|joy|joyful|delighted|cheerful|excited|wonderful|amazing|fantastic|great|awesome|love|loved|loving)\b', 2),
            (r'\b(good|nice|pleasant|lovely|enjoy|enjoyed|enjoying|glad|pleased)\b', 1),
            (r'(😊|😄|😃|🙂|😁|🥰|❤️|💕)', 2),
        ],
        "Sad": [
            (r'\b(sad|depressed|unhappy|miserable|upset|down|lonely|heartbroken|crying|cry|tears)\b', 2),
            (r'\b(disappointed|pessimistic|gloomy|hopeless|despair)\b', 1),
            (r'(😢|😭|😔|☹️|😞)', 2),
        ],
        "Angry": [
            (r'\b(angry|mad|furious|rage|outraged|irritated|annoyed|frustrated|hate|hatred)\b', 2),
            (r'\b(pissed|aggravated|bitter|resentful)\b', 1),
            (r'(😠|😡|🤬|😤)', 2),
        ],
        "Anxious": [
            (r'\b(anxious|worried|nervous|stressed|panic|fear|scared|afraid|terrified|overwhelmed|tense)\b', 2),
            (r'\b(uncertain|uneasy|apprehensive|concerned)\b', 1),
            (r'(😰|😨|😱|😟|😧)', 2),
        ],
        "Excited": [
            (r'\b(excited|thrilled|enthusiastic|eager|pumped|energized|motivated)\b', 2),
            (r'\b(looking forward|can t wait|amazing|incredible|awesome)\b', 1),
            (r'(🎉|🎊|🥳|🤩|✨)', 2),
        ],
        "Calm": [
            (r'\b(calm|peaceful|relaxed|serene|tranquil|content|satisfied|comfortable)\b', 2),
            (r'\b(okay|fine|alright|neutral|normal|steady)\b', 1),
            (r'(😌|🙏|🧘)', 2),
        ],
    }
    
    # Calculate scores for each emotion
    scores = {emotion: 0 for emotion in emotion_patterns}
    
    for emotion, patterns in emotion_patterns.items():
        for pattern, weight in patterns:
            matches = len(re.findall(pattern, text_lower))
            scores[emotion] += matches * weight
    
    # Find the emotion with highest score
    max_score = max(scores.values())
    
    if max_score == 0:
        # No clear emotion detected, default to Calm
        return "Calm"
    
    # Return the emotion with highest score
    for emotion, score in scores.items():
        if score == max_score:
            return emotion
    
    return "Calm"


def analyze_text_emotion(text):
    """
    Main text emotion analysis function.
    Tries transformers first, falls back to enhanced keyword detection.
    """
    if not text or not text.strip():
        return "Calm"
    
    try:
        # Try advanced NLP if available
        classifier = get_classifier()
        if classifier is not None:
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
            
            mapped = emotion_mapping.get(emotion, "Calm")
            print(f"✅ Text emotion (transformers): {emotion} → {mapped}")
            return mapped
    
    except Exception as e:
        print(f"⚠️ Text emotion (transformers) failed: {e}")
    
    # Fallback to enhanced keyword detection
    result = analyze_text_emotion_simple(text)
    print(f"✅ Text emotion (keyword): {result}")
    return result
