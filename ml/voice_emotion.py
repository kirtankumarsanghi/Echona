import librosa
import numpy as np

def detect_voice_emotion(audio_path):
    y, sr = librosa.load(audio_path)
    energy = np.mean(librosa.feature.rms(y=y))

    if energy < 0.02:
        return "sad"
    elif energy < 0.05:
        return "neutral"
    else:
        return "happy"
