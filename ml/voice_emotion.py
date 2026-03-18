"""
Voice emotion analysis.

Priority:
  1. Trained sklearn model (ml/models/voice_emotion_model.pkl)
  2. Librosa energy heuristic fallback
"""

import os
import numpy as np

# ── Model loading (once at startup) ───────────────────────────────────────────
_MODEL_PAYLOAD = None
_MODEL_ERR     = None

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "voice_emotion_model.pkl")

N_MFCC  = 40
N_MELS  = 128
HOP_LEN = 512


def _load_model():
    global _MODEL_PAYLOAD, _MODEL_ERR
    if _MODEL_PAYLOAD is not None or _MODEL_ERR is not None:
        return _MODEL_PAYLOAD
    if not os.path.exists(MODEL_PATH):
        _MODEL_ERR = f"Model not found: {MODEL_PATH} — run train_voice_model.py first"
        print(f"⚠️  {_MODEL_ERR}")
        return None
    try:
        import joblib
        _MODEL_PAYLOAD = joblib.load(MODEL_PATH)
        print(f"✅ Voice emotion model loaded from {MODEL_PATH}")
    except Exception as e:
        _MODEL_ERR = str(e)
        print(f"⚠️  Could not load voice model: {e}")
    return _MODEL_PAYLOAD


def _extract_features(audio_path: str) -> np.ndarray:
    import librosa
    y, sr = librosa.load(audio_path, sr=22050, duration=3.0)
    target_len = 3 * sr
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        y = y[:target_len]

    mfcc     = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=N_MFCC, hop_length=HOP_LEN)
    mfcc_f   = np.concatenate([mfcc.mean(axis=1), mfcc.std(axis=1)])
    chroma   = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=HOP_LEN)
    chroma_f = np.concatenate([chroma.mean(axis=1), chroma.std(axis=1)])
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr, hop_length=HOP_LEN)
    cont_f   = np.concatenate([contrast.mean(axis=1), contrast.std(axis=1)])
    mel      = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS, hop_length=HOP_LEN)
    mel_f    = librosa.power_to_db(mel).mean(axis=1)
    zcr      = librosa.feature.zero_crossing_rate(y, hop_length=HOP_LEN).mean()
    rms      = librosa.feature.rms(y=y, hop_length=HOP_LEN).mean()
    return np.concatenate([mfcc_f, chroma_f, cont_f, mel_f, [zcr, rms]])


def detect_voice_emotion(audio_path: str) -> str:
    """Return mood string from audio file path."""
    result = detect_voice_emotion_full(audio_path)
    return result["emotion"]


def detect_voice_emotion_full(audio_path: str) -> dict:
    """Return dict with emotion, confidence, source."""
    # 1️⃣  Trained model
    payload = _load_model()
    if payload is not None:
        try:
            feat = _extract_features(audio_path).reshape(1, -1)
            model   = payload["model"]
            labels  = payload["emotions"]
            probs   = model.predict_proba(feat)[0]
            idx     = int(np.argmax(probs))
            emotion = labels[idx]
            conf    = float(probs[idx])
            print(f"✅ Voice (trained model): {emotion} ({conf:.2f})")
            return {"emotion": emotion, "confidence": conf, "source": "trained_model"}
        except Exception as e:
            print(f"⚠️  Voice model inference failed: {e}")

    # 2️⃣  Librosa energy heuristic
    try:
        import librosa
        y, sr = librosa.load(audio_path)
        energy   = float(np.mean(librosa.feature.rms(y=y)))
        pitch    = float(np.mean(librosa.yin(y, fmin=80, fmax=400))) if len(y) > 2048 else 200
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        tempo    = float(tempo)

        if energy < 0.02:
            emotion, conf = "Sad", 0.45
        elif energy > 0.15 and tempo > 120:
            emotion, conf = "Excited", 0.50
        elif energy > 0.10:
            emotion, conf = "Angry", 0.45
        elif pitch > 250:
            emotion, conf = "Happy", 0.40
        else:
            emotion, conf = "Calm", 0.35

        print(f"✅ Voice (heuristic): energy={energy:.3f}, tempo={tempo:.0f} → {emotion}")
        return {"emotion": emotion, "confidence": conf, "source": "heuristic"}
    except Exception as e:
        print(f"❌ Voice analysis error: {e}")
        return {"emotion": "Calm", "confidence": 0.0, "source": "error"}

