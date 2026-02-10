import random
from ml.music_library import MUSIC_LIBRARY

def recommend_songs(emotion, count=3):
    if not emotion:
        return []

    if emotion not in MUSIC_LIBRARY:
        return []

    return random.sample(
        MUSIC_LIBRARY[emotion],
        min(count, len(MUSIC_LIBRARY[emotion]))
    )
