import os
import sys
import json
import logging
import socket
import tempfile
import threading
import time
import requests
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from ml.recommend import recommend_songs, get_therapy_context

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("echona-ml")

app = Flask(__name__)
CORS(app)

# ── Prediction log ─────────────────────────────────────────────────────────────
_LOGS_DIR     = os.path.join(os.path.dirname(__file__), "ml", "logs")
_PREDS_FILE   = os.path.join(_LOGS_DIR, "predictions.json")
_preds_lock   = threading.Lock()

def _log_prediction(entry: dict):
    """Append one prediction entry to ml/logs/predictions.json (thread-safe)."""
    try:
        os.makedirs(_LOGS_DIR, exist_ok=True)
        with _preds_lock:
            records = []
            if os.path.exists(_PREDS_FILE) and os.path.getsize(_PREDS_FILE) > 2:
                with open(_PREDS_FILE, "r", encoding="utf-8") as f:
                    try:
                        records = json.load(f)
                    except json.JSONDecodeError:
                        records = []
            records.append(entry)
            tmp = _PREDS_FILE + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(records, f, ensure_ascii=False, separators=(",", ":"))
            os.replace(tmp, _PREDS_FILE)
    except Exception as log_err:
        logger.warning("Prediction logging failed: %s", log_err)

# ── Lazy-loaded analysers (loaded ONCE at first request) ──────────────────────
_face_analyzer     = None
_text_analyzer     = None
_text_analyzer_full = None
_voice_analyzer    = None
_voice_analyzer_full = None
_face_analyzer_full = None
_face_import_error = None
_text_import_error = None
_voice_import_error = None

_recommend_cache = {}
_RECOMMEND_TTL_SEC = 300


def read_shared_service_config():
    config_path = os.path.join(os.path.dirname(__file__), "service-config.json")
    try:
        with open(config_path, "r", encoding="utf-8") as config_file:
            return json.load(config_file)
    except Exception:
        return {
            "ports": {"ml": 5001, "backend": 5000, "frontend": 3000},
            "timeouts": {"ml": 15000},
        }


def read_shared_ml_port():
    config = read_shared_service_config()
    return int(config.get("ports", {}).get("ml", 5001))


def is_port_available(port, host="127.0.0.1"):
    """Check if a port is available before binding."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result != 0
    except Exception:
        return True


def get_face_analyzer():
    global _face_analyzer, _face_analyzer_full, _face_import_error
    if _face_analyzer:
        return _face_analyzer
    if _face_import_error:
        return None
    try:
        from ml.face_emotion import analyze_face_emotion, _analyze_face_emotion_full
        _face_analyzer      = analyze_face_emotion
        _face_analyzer_full = _analyze_face_emotion_full
        logger.info("Face analyzer loaded successfully")
    except Exception as exc:
        _face_import_error = str(exc)
        logger.warning("Face analyzer unavailable: %s", exc)
        return None
    return _face_analyzer


def get_text_analyzer():
    global _text_analyzer, _text_analyzer_full, _text_import_error
    if _text_analyzer:
        return _text_analyzer
    if _text_import_error:
        return None
    try:
        from ml.text_emotion import analyze_text_emotion, analyze_text_emotion_full
        _text_analyzer      = analyze_text_emotion
        _text_analyzer_full = analyze_text_emotion_full
        logger.info("Text analyzer loaded successfully")
    except Exception as exc:
        _text_import_error = str(exc)
        logger.warning("Text analyzer unavailable: %s", exc)
        return None
    return _text_analyzer


def get_voice_analyzer():
    global _voice_analyzer, _voice_analyzer_full, _voice_import_error
    if _voice_analyzer:
        return _voice_analyzer
    if _voice_import_error:
        return None
    try:
        from ml.voice_emotion import detect_voice_emotion, detect_voice_emotion_full
        _voice_analyzer      = detect_voice_emotion
        _voice_analyzer_full = detect_voice_emotion_full
        logger.info("Voice analyzer loaded successfully")
    except Exception as exc:
        _voice_import_error = str(exc)
        logger.warning("Voice analyzer unavailable: %s", exc)
        return None
    return _voice_analyzer


def response_ok(payload=None, status=200):
    return jsonify({"success": True, **(payload or {})}), status


def response_error(message, status=400, details=None):
    body = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def _cache_key_recommend(emotion: str, count: int, energy: str | None):
    return f"{emotion.lower()}::{count}::{(energy or '').lower()}"


def _get_recommend_cached(emotion: str, count: int, energy: str | None):
    key = _cache_key_recommend(emotion, count, energy)
    item = _recommend_cache.get(key)
    if not item:
        return None
    age = time.time() - item["ts"]
    if age > _RECOMMEND_TTL_SEC:
        _recommend_cache.pop(key, None)
        return None
    return item["payload"]


def _set_recommend_cached(emotion: str, count: int, energy: str | None, payload: dict):
    key = _cache_key_recommend(emotion, count, energy)
    _recommend_cache[key] = {"ts": time.time(), "payload": payload}


def _simple_text_fallback(text):
    """Keyword-based mood detection when ML models are unavailable."""
    text_lower = text.lower()
    if any(w in text_lower for w in ["happy", "great", "good", "awesome", "joy", "excited", "wonderful"]):
        return "Happy"
    if any(w in text_lower for w in ["sad", "down", "depressed", "cry", "upset", "lonely"]):
        return "Sad"
    if any(w in text_lower for w in ["angry", "mad", "furious", "annoyed", "rage"]):
        return "Angry"
    if any(w in text_lower for w in ["anxious", "worried", "stress", "nervous", "panic", "fear"]):
        return "Anxious"
    if any(w in text_lower for w in ["excited", "thrilled", "amazing", "fantastic"]):
        return "Excited"
    return "Calm"


# ─── Error handlers ──────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return response_error("Endpoint not found", 404)


@app.errorhandler(500)
def internal_error(e):
    logger.exception("Internal server error")
    return response_error("Internal ML service error", 500)


@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception("Unhandled exception: %s", e)
    return response_error("ML service encountered an error", 500, str(e))


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return response_ok({"service": "echona-ml", "status": "running"})


@app.route("/health")
def health():
    face_available  = get_face_analyzer() is not None
    text_available  = get_text_analyzer() is not None
    voice_available = get_voice_analyzer() is not None

    all_up = face_available and text_available and voice_available
    status = "ok" if all_up else ("degraded" if any([face_available, text_available, voice_available]) else "down")
    return response_ok({
        "service": "echona-ml",
        "status": status,
        "capabilities": {
            "face":  face_available,
            "text":  text_available,
            "voice": voice_available,
        },
        "errors": {
            "face":  _face_import_error  if not face_available  else None,
            "text":  _text_import_error  if not text_available  else None,
            "voice": _voice_import_error if not voice_available else None,
        },
        "timestamp": datetime.utcnow().isoformat() + "Z",
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json(silent=True) or {}
        analysis_type = data.get("type")

        if analysis_type == "face":
            image_data = data.get("image")
            if not image_data:
                return response_error("No image data provided", 400)

            analyzer = get_face_analyzer()
            if analyzer is None:
                return response_error(
                    "Face analysis unavailable",
                    503,
                    _face_import_error or "face analyzer failed to initialize",
                )

            mood = analyzer(image_data)
            if not mood:
                return response_ok({"mood": "Calm", "source": "fallback", "message": "Face analysis returned no result"})
            return response_ok({"mood": mood, "source": "face"})

        if analysis_type == "text":
            text = str(data.get("text") or "").strip()
            if not text:
                return response_error("No text provided", 400)

            analyzer = get_text_analyzer()
            if analyzer is None:
                # Fallback: simple keyword-based detection
                mood = _simple_text_fallback(text)
                return response_ok({"mood": mood, "source": "fallback", "message": "ML text analyzer unavailable, using fallback"})

            mood = analyzer(text)
            if not mood:
                return response_ok({"mood": "Calm", "source": "fallback"})
            return response_ok({"mood": mood, "source": "text"})

        return response_error("Invalid analysis type", 400, "Allowed: face, text")

    except Exception as exc:
        logger.exception("Analyze endpoint failure")
        return response_error("ML analysis failed", 500, str(exc))


@app.route("/detect-face", methods=["POST"])
def detect_face():
    """
    Detect emotion from a face image.
    Body: { "image": "data:image/...;base64,..." }
    Returns: { emotion, confidence, source }
    """
    try:
        data       = request.get_json(silent=True) or {}
        image_data = data.get("image")
        if not image_data:
            return response_error("No image data provided", 400)

        analyzer_full = _face_analyzer_full
        if analyzer_full is None:
            get_face_analyzer()  # trigger load
            analyzer_full = _face_analyzer_full

        if analyzer_full is None:
            return response_error("Face analysis unavailable", 503,
                                  _face_import_error or "face analyzer failed to initialize")

        start_t = time.perf_counter()
        result = analyzer_full(image_data)
        inference_ms = round((time.perf_counter() - start_t) * 1000, 2)

        logger.info(
            "[detect-face] source=%s emotion=%s confidence=%.4f inference_ms=%.2f",
            result["source"], result["emotion"], result["confidence"], inference_ms,
        )

        _log_prediction({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "endpoint":  "detect-face",
            "emotion":   result["emotion"],
            "confidence": result["confidence"],
            "source":    result["source"],
            "inference_ms": inference_ms,
        })
        return response_ok({
            "emotion":    result["emotion"],
            "confidence": result["confidence"],
            "source":     result["source"],
            "inference_ms": inference_ms,
        })
    except Exception as exc:
        logger.exception("detect-face failure")
        return response_error("Face analysis failed", 500, str(exc))


@app.route("/detect-voice", methods=["POST"])
def detect_voice():
    """
    Detect emotion from an audio file upload (multipart) or base64 JSON.
    Multipart: form field 'audio' (file)
    JSON:      { "audio_base64": "...", "format": "wav" }
    Returns: { emotion, confidence, source }
    """
    try:
        tmp_path = None

        if request.content_type and "multipart" in request.content_type:
            audio_file = request.files.get("audio")
            if not audio_file:
                return response_error("No audio file uploaded", 400)
            suffix = os.path.splitext(audio_file.filename or ".wav")[1] or ".wav"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                audio_file.save(tmp.name)
                tmp_path = tmp.name
        else:
            data = request.get_json(silent=True) or {}
            b64  = data.get("audio_base64")
            if not b64:
                return response_error("No audio data provided. Use multipart 'audio' field or JSON 'audio_base64'.", 400)
            import base64 as b64mod
            fmt  = data.get("format", "wav").lstrip(".")
            audio_bytes = b64mod.b64decode(b64)
            with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

        get_voice_analyzer()  # trigger load
        analyzer_full = _voice_analyzer_full
        if analyzer_full is None:
            return response_error("Voice analysis unavailable", 503,
                                  _voice_import_error or "voice analyzer failed to initialize")

        start_t = time.perf_counter()
        result = analyzer_full(tmp_path)
        inference_ms = round((time.perf_counter() - start_t) * 1000, 2)

        logger.info(
            "[detect-voice] source=%s emotion=%s confidence=%.4f inference_ms=%.2f",
            result["source"], result["emotion"], result["confidence"], inference_ms,
        )

        _log_prediction({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "endpoint":  "detect-voice",
            "emotion":   result["emotion"],
            "confidence": result["confidence"],
            "source":    result["source"],
            "inference_ms": inference_ms,
        })
        return response_ok({
            "emotion":    result["emotion"],
            "confidence": result["confidence"],
            "source":     result["source"],
            "inference_ms": inference_ms,
        })

    except Exception as exc:
        logger.exception("detect-voice failure")
        return response_error("Voice analysis failed", 500, str(exc))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route("/detect-text", methods=["POST"])
def detect_text():
    """
    Detect emotion from text.
    Body: { "text": "I feel amazing today!" }
    Returns: { emotion, confidence, source }
    """
    try:
        data = request.get_json(silent=True) or {}
        text = str(data.get("text") or "").strip()
        if not text:
            return response_error("No text provided", 400)

        get_text_analyzer()  # trigger load
        analyzer_full = _text_analyzer_full
        if analyzer_full is None:
            mood = _simple_text_fallback(text)
            return response_ok({"emotion": mood, "confidence": 0.4, "source": "fallback"})

        start_t = time.perf_counter()
        result = analyzer_full(text)
        inference_ms = round((time.perf_counter() - start_t) * 1000, 2)

        logger.info(
            "[detect-text] source=%s emotion=%s confidence=%.4f inference_ms=%.2f",
            result["source"], result["emotion"], result["confidence"], inference_ms,
        )

        _log_prediction({
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "endpoint":  "detect-text",
            "emotion":   result["emotion"],
            "confidence": result["confidence"],
            "source":    result["source"],
            "inference_ms": inference_ms,
        })
        return response_ok({
            "emotion":    result["emotion"],
            "confidence": result["confidence"],
            "source":     result["source"],
            "inference_ms": inference_ms,
        })
    except Exception as exc:
        logger.exception("detect-text failure")
        return response_error("Text analysis failed", 500, str(exc))


@app.route("/detect-multimodal", methods=["POST"])
def detect_multimodal():
    """
    Fuse emotion from any combination of face + voice + text.
    Body (JSON or multipart):
      - image:       base64 image string  (optional)
      - text:        plain text           (optional)
      - audio_base64: base64 audio        (optional)
    Weights: face 40%, voice 30%, text 30%
    Returns: { emotion, confidence, votes, sources, modalities: {face, voice, text} }
    """
    tmp_path = None
    try:
        from ml.fusion import fuse_emotions_weighted, _result_to_probs

        # Parse request (supports both JSON and multipart)
        if request.content_type and "multipart" in request.content_type:
            image_data  = request.form.get("image")
            text        = request.form.get("text", "")
            audio_file  = request.files.get("audio")
            audio_b64   = None
        else:
            data       = request.get_json(silent=True) or {}
            image_data = data.get("image")
            text       = str(data.get("text") or "")
            audio_b64  = data.get("audio_base64")
            audio_file = None

        if not any([image_data, text.strip(), audio_b64, audio_file]):
            return response_error("Provide at least one of: image, text, audio", 400)

        face_result  = None
        voice_result = None
        text_result  = None

        # Face
        if image_data:
            get_face_analyzer()
            if _face_analyzer_full:
                try:
                    face_result = _face_analyzer_full(image_data)
                except Exception as e:
                    logger.warning("Face modality failed: %s", e)

        # Voice
        if audio_b64 or audio_file:
            get_voice_analyzer()
            if _voice_analyzer_full:
                try:
                    import base64 as b64mod
                    if audio_file:
                        suffix = os.path.splitext(audio_file.filename or ".wav")[1] or ".wav"
                        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                            audio_file.save(tmp.name)
                            tmp_path = tmp.name
                    else:
                        fmt = "wav"
                        with tempfile.NamedTemporaryFile(suffix=f".{fmt}", delete=False) as tmp:
                            tmp.write(b64mod.b64decode(audio_b64))
                            tmp_path = tmp.name
                    voice_result = _voice_analyzer_full(tmp_path)
                except Exception as e:
                    logger.warning("Voice modality failed: %s", e)

        # Text
        if text.strip():
            get_text_analyzer()
            if _text_analyzer_full:
                try:
                    text_result = _text_analyzer_full(text)
                except Exception as e:
                    logger.warning("Text modality failed: %s", e)
            else:
                mood = _simple_text_fallback(text)
                text_result = {"emotion": mood, "confidence": 0.4, "source": "fallback"}

        start_t = time.perf_counter()
        fusion = fuse_emotions_weighted(
            face_result=face_result,
            voice_result=voice_result,
            text_result=text_result,
        )
        inference_ms = round((time.perf_counter() - start_t) * 1000, 2)

        logger.info(
            "[detect-multimodal] method=%s emotion=%s confidence=%.4f inference_ms=%.2f sources=%s",
            fusion.get("fusion_method", "weighted"),
            fusion["emotion"],
            fusion["confidence"],
            inference_ms,
            ",".join(fusion["sources"]),
        )

        _log_prediction({
            "timestamp":    datetime.utcnow().isoformat() + "Z",
            "endpoint":     "detect-multimodal",
            "emotion":      fusion["emotion"],
            "confidence":   fusion["confidence"],
            "fusion_method": fusion.get("fusion_method", "weighted"),
            "sources":      fusion["sources"],
            "inference_ms": inference_ms,
            "face_probs":   _result_to_probs(face_result)  if face_result  else None,
            "voice_probs":  _result_to_probs(voice_result) if voice_result else None,
            "text_probs":   _result_to_probs(text_result)  if text_result  else None,
        })

        return response_ok({
            "emotion":       fusion["emotion"],
            "confidence":    fusion["confidence"],
            "votes":         fusion["votes"],
            "sources":       fusion["sources"],
            "fusion_method": fusion.get("fusion_method", "weighted"),
            "inference_ms": inference_ms,
            "breakdown": {
                "face":  {"emotion": face_result["emotion"],  "confidence": face_result["confidence"],  "source": face_result.get("source")}  if face_result  else None,
                "voice": {"emotion": voice_result["emotion"], "confidence": voice_result["confidence"], "source": voice_result.get("source")} if voice_result else None,
                "text":  {"emotion": text_result["emotion"],  "confidence": text_result["confidence"],  "source": text_result.get("source")}  if text_result  else None,
            },
            "modalities": {
                "face":  face_result,
                "voice": voice_result,
                "text":  text_result,
            },
        })

    except Exception as exc:
        logger.exception("detect-multimodal failure")
        return response_error("Multimodal analysis failed", 500, str(exc))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.route("/recommend", methods=["GET"])
def recommend():
    try:
        emotion = request.args.get("emotion", "Neutral")
        count   = min(int(request.args.get("count", 3)), 10)
        energy  = request.args.get("energy")  # optional "low"|"medium"|"high"

        cached = _get_recommend_cached(emotion, count, energy)
        if cached is not None:
            return response_ok({**cached, "cached": True})

        songs   = recommend_songs(emotion, count=count, energy=energy or None)
        therapy = get_therapy_context(emotion)
        payload = {"emotion": therapy["emotion"], "songs": songs, "therapy": therapy}
        _set_recommend_cached(emotion, count, energy, payload)
        return response_ok({**payload, "cached": False})
    except Exception as exc:
        logger.exception("Recommend endpoint failure")
        return response_error("Recommendation failed", 500, str(exc))


if __name__ == "__main__":
    # Use PORT env variable (Render standard) or ML_PORT or default
    default_ml_port = read_shared_ml_port()
    raw_port = os.getenv("PORT") or os.getenv("ML_PORT", str(default_ml_port))
    try:
        ml_port = int(raw_port)
    except ValueError:
        raise SystemExit(f"Invalid PORT '{raw_port}'. Expected an integer value.")

    # In production, skip port check (cloud providers handle this)
    is_production = os.getenv("NODE_ENV") == "production" or os.getenv("FLASK_ENV") == "production"
    
    if not is_production and not is_port_available(ml_port):
        logger.error(f"Port {ml_port} is already in use!")
        logger.error(f"Fix: Run in PowerShell:")
        logger.error(f"  Get-NetTCPConnection -LocalPort {ml_port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force }}")
        sys.exit(1)

    # Keep-alive mechanism for production (prevent Render from sleeping)
    if is_production:
        def keep_alive():
            ml_service_url = os.getenv("ML_SERVICE_URL", "https://echona-ml.onrender.com")
            while True:
                time.sleep(14 * 60)  # 14 minutes
                try:
                    requests.get(f"{ml_service_url}/health", timeout=5)
                    logger.info(f"🔄 Keep-alive ping sent at {datetime.now().isoformat()}")
                except Exception as e:
                    logger.warning(f"⚠️  Keep-alive ping failed: {e}")
        
        keep_alive_thread = threading.Thread(target=keep_alive, daemon=True)
        keep_alive_thread.start()
        logger.info("🔄 Keep-alive mechanism enabled (pings every 14 minutes)")

    logger.info("=" * 50)
    logger.info("  ECHONA ML Service Starting")
    logger.info(f"  Port: {ml_port}")
    logger.info(f"  Environment: {'production' if is_production else 'development'}")
    logger.info("=" * 50)

    # Preload models once at startup so requests do not repeatedly trigger lazy imports.
    face_ok = get_face_analyzer() is not None
    text_ok = get_text_analyzer() is not None
    voice_ok = get_voice_analyzer() is not None
    logger.info(
        "Model preload complete | face=%s text=%s voice=%s",
        "ok" if face_ok else "unavailable",
        "ok" if text_ok else "unavailable",
        "ok" if voice_ok else "unavailable",
    )

    # Use 0.0.0.0 in production for cloud deployment
    host = "0.0.0.0" if is_production else "127.0.0.1"
    app.run(debug=False, host=host, port=ml_port, use_reloader=False)
