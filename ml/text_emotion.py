from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    return_all_scores=True
)

def detect_text_emotion(text):
    result = classifier(text)[0]
    return max(result, key=lambda x: x['score'])['label']
