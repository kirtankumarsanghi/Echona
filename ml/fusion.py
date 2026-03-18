"""
Multimodal emotion fusion.

Primary:  dynamic meta-classifier (LogReg/RF) trained on stacked modality probs.
Fallback: weighted vote  face 40%, voice 30%, text 30%.
"""

import os
import pickle
from collections import defaultdict

WEIGHTS = {"face": 0.40, "voice": 0.30, "text": 0.30}

ALL_EMOTIONS = [
    "Happy", "Sad", "Angry", "Calm", "Excited",
    "Anxious", "Stressed", "Lonely", "Tired", "Neutral",
]
EMO_IDX = {e: i for i, e in enumerate(ALL_EMOTIONS)}

_MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "models")
_FUSION_MODEL_PATH = os.path.join(_MODELS_DIR, "fusion_model.pkl")

_fusion_payload = None   # loaded once
_fusion_tried   = False  # avoid repeated failed loads


def load_fusion_model():
    """
    Load the trained meta-classifier from disk (once).
    Returns the sklearn model, or None if not available.
    """
    global _fusion_payload, _fusion_tried
    if _fusion_tried:
        return _fusion_payload.get("model") if _fusion_payload else None
    _fusion_tried = True
    if os.path.exists(_FUSION_MODEL_PATH):
        try:
            with open(_FUSION_MODEL_PATH, "rb") as f:
                _fusion_payload = pickle.load(f)
        except Exception:
            _fusion_payload = None
    return _fusion_payload.get("model") if _fusion_payload else None


def _result_to_probs(result: dict | None) -> list[float]:
    """
    Convert a modality result dict to a 10-dim probability vector.
    Uses 'votes' key if present, otherwise puts full confidence on the emotion.
    """
    probs = [0.0] * len(ALL_EMOTIONS)
    if result is None:
        probs[EMO_IDX["Neutral"]] = 1.0
        return probs

    if "votes" in result and result["votes"]:
        for emo, score in result["votes"].items():
            if emo in EMO_IDX:
                probs[EMO_IDX[emo]] = float(score)
    else:
        emotion = result.get("emotion", "Neutral")
        conf    = float(result.get("confidence", 1.0))
        idx     = EMO_IDX.get(emotion, EMO_IDX["Neutral"])
        probs[idx] = conf
        # distribute remaining mass uniformly
        remaining = max(0.0, 1.0 - conf)
        for i in range(len(probs)):
            if i != idx:
                probs[i] = remaining / (len(ALL_EMOTIONS) - 1)

    # Normalise
    total = sum(probs)
    if total > 0:
        probs = [p / total for p in probs]
    return probs


def fuse_emotions(face: str, text: str, voice: str) -> str:
    """
    Simple backwards-compatible wrapper.
    Accepts emotion strings, uses equal-weight majority vote.
    """
    result = fuse_emotions_weighted(
        face_result={"emotion": face,  "confidence": 1.0},
        voice_result={"emotion": voice, "confidence": 1.0},
        text_result={"emotion": text,  "confidence": 1.0},
    )
    return result["emotion"]


def fuse_emotions_weighted(
    face_result:  dict | None = None,
    voice_result: dict | None = None,
    text_result:  dict | None = None,
) -> dict:
    """
    Fuse modality results using the dynamic meta-classifier when available,
    falling back to the weighted-vote strategy.

    Args:
        face_result:  {"emotion": str, "confidence": float, "votes"?: dict} or None
        voice_result: {"emotion": str, "confidence": float, "votes"?: dict} or None
        text_result:  {"emotion": str, "confidence": float, "votes"?: dict} or None

    Returns:
        {
            "emotion":    str,
            "confidence": float,
            "votes":      {emotion: score},
            "sources":    list[str],
            "fusion_method": "dynamic" | "weighted",
        }
    """
    sources_used = [
        name for name, r in [("face", face_result), ("voice", voice_result), ("text", text_result)]
        if r is not None
    ]

    if not sources_used:
        return {
            "emotion": "Neutral", "confidence": 0.0,
            "votes": {}, "sources": [], "fusion_method": "none",
        }

    # Dynamic model is trained on full face+voice+text vectors.
    # For partial inputs, weighted fusion preserves available modality signal.
    has_all_modalities = (face_result is not None and voice_result is not None and text_result is not None)

    # ── Try dynamic meta-classifier ───────────────────────────────────────────
    clf = load_fusion_model()
    if clf is not None and has_all_modalities:
        try:
            face_probs  = _result_to_probs(face_result)
            voice_probs = _result_to_probs(voice_result)
            text_probs  = _result_to_probs(text_result)
            feature_vec = [face_probs + voice_probs + text_probs]  # 1 × 30
            import numpy as np
            proba = clf.predict_proba(np.array(feature_vec))[0]
            labels = clf.classes_
            votes  = {lab: round(float(p), 4) for lab, p in zip(labels, proba)}
            best_emotion = max(votes, key=votes.get)
            return {
                "emotion":       best_emotion,
                "confidence":    round(votes[best_emotion], 4),
                "votes":         dict(sorted(votes.items(), key=lambda x: -x[1])),
                "sources":       sources_used,
                "fusion_method": "dynamic",
            }
        except Exception:
            pass  # fall through to weighted

    # ── Weighted-vote fallback ─────────────────────────────────────────────────
    votes: dict = defaultdict(float)
    total_weight = 0.0
    for name, result in [("face", face_result), ("voice", voice_result), ("text", text_result)]:
        if result is None:
            continue
        emotion    = result.get("emotion", "Neutral")
        confidence = float(result.get("confidence", 1.0))
        weight     = WEIGHTS[name]
        votes[emotion] += weight * confidence
        total_weight   += weight

    if total_weight > 0:
        votes = {k: v / total_weight for k, v in votes.items()}

    best_emotion = max(votes, key=votes.get)
    return {
        "emotion":       best_emotion,
        "confidence":    round(votes[best_emotion], 4),
        "votes":         {k: round(v, 4) for k, v in sorted(votes.items(), key=lambda x: -x[1])},
        "sources":       sources_used,
        "fusion_method": "weighted",
    }

