"""
Text emotion analysis.

Priority:
  1. Fine-tuned DistilBERT (ml/models/text_emotion_model/)
  2. Trained TF-IDF + LogReg (ml/models/text_emotion_model.pkl)
  3. Pretrained HuggingFace pipeline
  4. Enhanced keyword heuristic
"""

import os
import re

# ── Model paths ───────────────────────────────────────────────────────────────
_MODEL_DIR  = os.path.join(os.path.dirname(__file__), "models")
_HF_PATH    = os.path.join(_MODEL_DIR, "text_emotion_model")      # fine-tuned
_SKL_PATH   = os.path.join(_MODEL_DIR, "text_emotion_model.pkl")   # sklearn

# ── Fine-tuned DistilBERT (lazy load) ─────────────────────────────────────────
_hf_pipeline  = None
_hf_error     = None
_hf_labels    = None

def _load_hf_model():
    global _hf_pipeline, _hf_error, _hf_labels
    if _hf_pipeline is not None or _hf_error is not None:
        return _hf_pipeline
    labels_json = os.path.join(_HF_PATH, "echona_labels.json")
    if not os.path.isdir(_HF_PATH):
        _hf_error = f"Fine-tuned model not found at {_HF_PATH}"
        return None
    try:
        from transformers import pipeline as hf_pipeline  # type: ignore
        import json
        _hf_pipeline = hf_pipeline(
            "text-classification", model=_HF_PATH,
            return_all_scores=True, top_k=None,
        )
        if os.path.exists(labels_json):
            with open(labels_json) as f:
                _hf_labels = json.load(f)["labels"]
        print(f"✅ Fine-tuned text model loaded from {_HF_PATH}")
    except Exception as e:
        _hf_error = str(e)
        print(f"⚠️  Fine-tuned text model unavailable: {e}")
    return _hf_pipeline

# ── Sklearn TF-IDF model (lazy load) ──────────────────────────────────────────
_skl_payload = None
_skl_error   = None

def _load_skl_model():
    global _skl_payload, _skl_error
    if _skl_payload is not None or _skl_error is not None:
        return _skl_payload
    if not os.path.exists(_SKL_PATH):
        _skl_error = f"Sklearn model not found at {_SKL_PATH}"
        return None
    try:
        import joblib  # type: ignore
        _skl_payload = joblib.load(_SKL_PATH)
        print(f"✅ Text sklearn model loaded from {_SKL_PATH}")
    except Exception as e:
        _skl_error = str(e)
        print(f"⚠️  Text sklearn model unavailable: {e}")
    return _skl_payload

# ── Pretrained HuggingFace pipeline (lazy load, original behaviour) ───────────
_classifier = None
_classifier_error = None

_LONELY_PATTERNS = [
    r"\blonely\b",
    r"\balone\b",
    r"\bisolated\b",
    r"\bno one\b",
    r"\bnobody\b",
    r"\bleft out\b",
    r"\bdisconnected\b",
    r"\bfeel unseen\b",
    r"\babandoned\b",
]


def _lonely_signal_score(text: str) -> int:
    text_lower = text.lower()
    score = 0
    for pattern in _LONELY_PATTERNS:
        score += len(re.findall(pattern, text_lower))
    return score


def _apply_lonely_relabel(
    text: str,
    emotion: str,
    confidence: float,
    source: str,
    labels=None,
    probs=None,
):
    """
    Calibrate common lonely->anxious drift.
    If strong loneliness cues exist and Lonely probability is competitive,
    prefer Lonely for better UX alignment.
    """
    lonely_hits = _lonely_signal_score(text)
    if lonely_hits <= 0:
        return emotion, confidence, False

    if emotion == "Lonely":
        return emotion, max(confidence, 0.55), False

    if emotion not in {"Anxious", "Sad", "Neutral"}:
        return emotion, confidence, False

    if labels is not None and probs is not None:
        try:
            lonely_idx = labels.index("Lonely")
            lonely_prob = float(probs[lonely_idx])
            margin = float(confidence) - lonely_prob
            if lonely_prob >= 0.20 and (margin <= 0.35 or lonely_hits >= 2):
                return "Lonely", max(lonely_prob, min(0.55 + lonely_hits * 0.08, 0.85)), True

            # If explicit loneliness language exists, avoid anxious drift.
            if lonely_hits >= 1 and emotion == "Anxious" and confidence <= 0.85:
                return "Lonely", max(lonely_prob, 0.62), True

            return emotion, confidence, False
        except Exception:
            pass

    if lonely_hits >= 1 and emotion == "Anxious" and confidence <= 0.85:
        return "Lonely", min(max(0.62, confidence * 0.9), 0.82), True

    if lonely_hits >= 2 and confidence <= 0.85:
        return "Lonely", min(max(0.55, confidence * 0.9), 0.82), True

    return emotion, confidence, False

def get_classifier():
    """Try to load pretrained transformers pipeline."""
    global _classifier, _classifier_error
    if _classifier is not None:
        return _classifier
    if _classifier_error is not None:
        return None
    try:
        from transformers import pipeline  # type: ignore
        _classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=False,
        )
        print("✅ Pretrained transformers pipeline loaded")
        return _classifier
    except Exception as e:
        _classifier_error = str(e)
        print(f"⚠️ Transformers unavailable: {e}")
        return None


def analyze_text_emotion_simple(text):
    """Enhanced keyword-based emotion detection covering all 10 moods."""
    text_lower = text.lower()

    emotion_patterns = {
        "Happy":   [
            (r'\b(happy|joy|joyful|delighted|cheerful|wonderful|amazing|fantastic|great|awesome|love|loved|loving|grateful|bliss)\b', 2),
            (r'\b(good|nice|pleasant|lovely|enjoy|glad|pleased)\b', 1),
            (r'(😊|😄|😃|🙂|😁|🥰|❤️|💕)', 2),
        ],
        "Sad": [
            (r'\b(sad|depressed|unhappy|miserable|upset|down|heartbroken|crying|cry|tears|grief|sorrow|hopeless)\b', 2),
            (r'\b(disappointed|pessimistic|gloomy|despair|broken)\b', 1),
            (r'(😢|😭|😔|☹️|😞)', 2),
        ],
        "Angry": [
            (r'\b(angry|mad|furious|rage|outraged|irritated|annoyed|frustrated|hate|hatred|disgust)\b', 2),
            (r'\b(pissed|aggravated|bitter|resentful)\b', 1),
            (r'(😠|😡|🤬|😤)', 2),
        ],
        "Anxious": [
            (r'\b(anxious|worried|nervous|panic|fear|scared|afraid|terrified|uneasy|apprehensive)\b', 2),
            (r'\b(uncertain|concerned|dread|phobia)\b', 1),
            (r'(😰|😨|😱|😟|😧)', 2),
        ],
        "Stressed": [
            (r'\b(stressed|overwhelmed|pressure|burnout|tense|overloaded|deadline|exhausting|chaotic)\b', 2),
            (r'\b(swamped|buried|frantic|hectic)\b', 1),
        ],
        "Lonely": [
            (r'\b(lonely|alone|isolated|miss|abandoned|disconnected|left out|no one|nobody)\b', 2),
            (r'\b(forgotten|invisible|unwanted)\b', 1),
        ],
        "Tired": [
            (r'\b(tired|exhausted|sleepy|fatigued|drained|bored|boring|monoton|lethargic|weary|burnt out)\b', 2),
            (r'\b(numb|flat|meh|blah|sluggish)\b', 1),
        ],
        "Excited": [
            (r'\b(excited|thrilled|enthusiastic|eager|pumped|energized|motivated|hyped|stoked)\b', 2),
            (r'\b(can.t wait|looking forward|incredible|unbelievable)\b', 1),
            (r'(🎉|🎊|🥳|🤩|✨)', 2),
        ],
        "Calm": [
            (r'\b(calm|peaceful|relaxed|serene|tranquil|content|satisfied|comfortable|okay|fine|alright|steady)\b', 2),
            (r'(😌|🙏|🧘)', 2),
        ],
        "Neutral": [
            (r'\b(neutral|normal|nothing|just|whatever|idk|hmm|so so|meh)\b', 1),
        ],
    }

    scores = {e: 0 for e in emotion_patterns}
    for emotion, patterns in emotion_patterns.items():
        for pattern, weight in patterns:
            scores[emotion] += len(re.findall(pattern, text_lower)) * weight

    max_score = max(scores.values())
    if max_score == 0:
        return "Neutral"
    return max(scores, key=scores.get)


def analyze_text_emotion(text: str) -> str:
    """Return mood string. Use analyze_text_emotion_full() for confidence."""
    return analyze_text_emotion_full(text)["emotion"]


def analyze_text_emotion_full(text: str) -> dict:
    """
    Return dict with emotion, confidence, source.

    Priority:
      1. Fine-tuned DistilBERT  (ml/models/text_emotion_model/)
      2. Trained sklearn model  (ml/models/text_emotion_model.pkl)
      3. Pretrained HF pipeline (j-hartmann/emotion-english-distilroberta-base)
      4. Keyword heuristic
    """
    if not text or not text.strip():
        return {"emotion": "Neutral", "confidence": 0.0, "source": "empty"}

    # 1️⃣  Fine-tuned DistilBERT
    pipe = _load_hf_model()
    if pipe is not None:
        try:
            scores = pipe(text[:512])[0]  # list of {label, score}
            best   = max(scores, key=lambda x: x["score"])
            label  = best["label"]
            conf   = float(best["score"])
            label, conf, adjusted = _apply_lonely_relabel(text, label, conf, "fine_tuned")
            print(f"✅ Text (fine-tuned): {label} ({conf:.2f})")
            return {
                "emotion": label,
                "confidence": conf,
                "source": "fine_tuned+postrule_lonely" if adjusted else "fine_tuned",
            }
        except Exception as e:
            print(f"⚠️  Fine-tuned inference failed: {e}")

    # 2️⃣  Sklearn TF-IDF model
    payload = _load_skl_model()
    if payload is not None:
        try:
            import numpy as np
            model  = payload["model"]
            labels = payload["labels"]
            probs  = model.predict_proba([text])[0]
            idx    = int(np.argmax(probs))
            emotion, conf = labels[idx], float(probs[idx])
            emotion, conf, adjusted = _apply_lonely_relabel(
                text,
                emotion,
                conf,
                "sklearn",
                labels=labels,
                probs=probs,
            )
            print(f"✅ Text (sklearn): {emotion} ({conf:.2f})")
            return {
                "emotion": emotion,
                "confidence": conf,
                "source": "sklearn+postrule_lonely" if adjusted else "sklearn",
            }
        except Exception as e:
            print(f"⚠️  Sklearn inference failed: {e}")

    # 3️⃣  Pretrained HuggingFace pipeline
    try:
        clf = get_classifier()
        if clf is not None:
            result  = clf(text)[0]
            raw     = result["label"].lower()
            hf_map  = {
                "joy": "Happy", "sadness": "Sad", "anger": "Angry",
                "fear": "Anxious", "surprise": "Excited",
                "neutral": "Neutral", "disgust": "Angry",
            }
            emotion = hf_map.get(raw, "Neutral")
            conf    = float(result.get("score", 0.5))
            emotion, conf, adjusted = _apply_lonely_relabel(text, emotion, conf, "pretrained_hf")
            print(f"✅ Text (pretrained HF): {raw} → {emotion} ({conf:.2f})")
            return {
                "emotion": emotion,
                "confidence": conf,
                "source": "pretrained_hf+postrule_lonely" if adjusted else "pretrained_hf",
            }
    except Exception as e:
        print(f"⚠️  Pretrained HF failed: {e}")

    # 4️⃣  Keyword fallback
    emotion = analyze_text_emotion_simple(text)
    print(f"✅ Text (keyword): {emotion}")
    return {"emotion": emotion, "confidence": 0.4, "source": "keyword"}

