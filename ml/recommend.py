"""
ml/recommend.py — Emotion-aware music recommendation.

Exports:
    recommend_songs(emotion, count=3, energy=None) -> list[dict]
    get_therapy_context(emotion) -> dict
"""

import random
from ml.music_library import MUSIC_LIBRARY, _ALIAS

# Therapy metadata: what kind of music experience each mood calls for
THERAPY_CONTEXT = {
    "Happy": {
        "goal":     "Amplify positive energy",
        "strategy": "uplifting, high-energy pop and dance tracks",
        "energy":   "high",
        "tags":     ["upbeat", "joyful", "feel-good"],
    },
    "Sad": {
        "goal":     "Validate emotions and gently lift mood",
        "strategy": "empathetic ballads first, then gradually uplifting pieces",
        "energy":   "low",
        "tags":     ["empathetic", "soothing", "healing"],
    },
    "Angry": {
        "goal":     "Provide a healthy emotional outlet",
        "strategy": "high-energy rock or hip-hop to channel frustration",
        "energy":   "high",
        "tags":     ["intense", "cathartic", "empowering"],
    },
    "Calm": {
        "goal":     "Maintain and deepen relaxation",
        "strategy": "ambient, classical, or acoustic tracks with minimal lyrics",
        "energy":   "low",
        "tags":     ["peaceful", "meditative", "relaxing"],
    },
    "Excited": {
        "goal":     "Sustain and celebrate high energy",
        "strategy": "uptempo, celebratory anthems and EDM",
        "energy":   "high",
        "tags":     ["energetic", "celebratory", "dance"],
    },
    "Anxious": {
        "goal":     "Reduce physiological arousal",
        "strategy": "slow-tempo, gentle melodies proven to reduce cortisol",
        "energy":   "low",
        "tags":     ["calming", "grounding", "slow-tempo"],
    },
    "Stressed": {
        "goal":     "Lower tension and promote recovery",
        "strategy": "ambient or soft acoustic music to decompress",
        "energy":   "low",
        "tags":     ["de-stressing", "relaxing", "ambient"],
    },
    "Lonely": {
        "goal":     "Foster connection and comfort",
        "strategy": "introspective songs that acknowledge the feeling without deepening it",
        "energy":   "low",
        "tags":     ["comforting", "relatable", "introspective"],
    },
    "Tired": {
        "goal":     "Facilitate rest or gentle restoration",
        "strategy": "mellow, low-energy tracks conducive to winding down or light focus",
        "energy":   "low",
        "tags":     ["mellow", "restorative", "background"],
    },
    "Neutral": {
        "goal":     "Maintain pleasant background atmosphere",
        "strategy": "balanced, versatile tracks that neither agitate nor sedate",
        "energy":   "medium",
        "tags":     ["balanced", "ambient", "versatile"],
    },
}


def _canonical(emotion: str) -> str | None:
    """Return the canonical (Title-case) mood key, or None if unknown."""
    if not emotion:
        return None
    if emotion in MUSIC_LIBRARY:
        return emotion
    return _ALIAS.get(emotion.lower())


def recommend_songs(emotion: str, count: int = 3, energy: str | None = None) -> list:
    """
    Return `count` songs for the given emotion.

    Args:
        emotion: One of the 10 ECHONA moods (case-insensitive).
        count:   Number of songs to return (default 3).
        energy:  Optional filter — "low" | "medium" | "high".

    Returns:
        List of song dicts: {title, artist, genre, energy}
        Falls back to "Neutral" if emotion is unrecognised.
    """
    key = _canonical(emotion) or "Neutral"
    pool = MUSIC_LIBRARY.get(key, MUSIC_LIBRARY["Neutral"])

    if energy:
        filtered = [s for s in pool if s.get("energy") == energy]
        if filtered:
            pool = filtered

    return random.sample(pool, min(count, len(pool)))


def get_therapy_context(emotion: str) -> dict:
    """
    Return music-therapy metadata for the given emotion.

    Returns a dict with: goal, strategy, energy, tags, emotion (canonical).
    Falls back to Neutral if emotion is unrecognised.
    """
    key = _canonical(emotion) or "Neutral"
    ctx = dict(THERAPY_CONTEXT.get(key, THERAPY_CONTEXT["Neutral"]))
    ctx["emotion"] = key
    return ctx

