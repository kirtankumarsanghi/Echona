import os
import sys
import json
import logging
import socket
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from ml.recommend import recommend_songs

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
)
logger = logging.getLogger("echona-ml")

app = Flask(__name__)
CORS(app)

_face_analyzer = None
_text_analyzer = None
_face_import_error = None
_text_import_error = None


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
    global _face_analyzer, _face_import_error
    if _face_analyzer:
        return _face_analyzer
    if _face_import_error:
        return None
    try:
        from ml.face_emotion import analyze_face_emotion
        _face_analyzer = analyze_face_emotion
        logger.info("Face analyzer loaded successfully")
    except Exception as exc:
        _face_import_error = str(exc)
        logger.warning("Face analyzer unavailable: %s", exc)
        return None
    return _face_analyzer


def get_text_analyzer():
    global _text_analyzer, _text_import_error
    if _text_analyzer:
        return _text_analyzer
    if _text_import_error:
        return None
    try:
        from ml.text_emotion import analyze_text_emotion
        _text_analyzer = analyze_text_emotion
        logger.info("Text analyzer loaded successfully")
    except Exception as exc:
        _text_import_error = str(exc)
        logger.warning("Text analyzer unavailable: %s", exc)
        return None
    return _text_analyzer


def response_ok(payload=None, status=200):
    return jsonify({"success": True, **(payload or {})}), status


def response_error(message, status=400, details=None):
    body = {"success": False, "error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


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
    face_available = get_face_analyzer() is not None
    text_available = get_text_analyzer() is not None

    status = "ok" if (face_available or text_available) else "degraded"
    return response_ok({
        "service": "echona-ml",
        "status": status,
        "capabilities": {
            "face": face_available,
            "text": text_available,
        },
        "errors": {
            "face": _face_import_error if not face_available else None,
            "text": _text_import_error if not text_available else None,
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


@app.route("/recommend", methods=["GET"])
def recommend():
    try:
        emotion = request.args.get("emotion", "calm")
        songs = recommend_songs(emotion)
        return response_ok({"emotion": emotion, "songs": songs})
    except Exception as exc:
        logger.exception("Recommend endpoint failure")
        return response_error("Recommendation failed", 500, str(exc))


if __name__ == "__main__":
    default_ml_port = read_shared_ml_port()
    raw_port = os.getenv("ML_PORT", str(default_ml_port))
    try:
        ml_port = int(raw_port)
    except ValueError:
        raise SystemExit(f"Invalid ML_PORT '{raw_port}'. Expected an integer value.")

    # Check port availability
    if not is_port_available(ml_port):
        logger.error(f"Port {ml_port} is already in use!")
        logger.error(f"Fix: Run in PowerShell:")
        logger.error(f"  Get-NetTCPConnection -LocalPort {ml_port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force }}")
        sys.exit(1)

    logger.info("=" * 50)
    logger.info("  ECHONA ML Service Starting")
    logger.info(f"  Port: {ml_port}")
    logger.info(f"  URL:  http://127.0.0.1:{ml_port}")
    logger.info(f"  Health: http://127.0.0.1:{ml_port}/health")
    logger.info("=" * 50)

    app.run(debug=False, host="127.0.0.1", port=ml_port, use_reloader=False)
