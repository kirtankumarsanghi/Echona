from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from ml.text_emotion import detect_text_emotion
from ml.face_emotion import detect_face_emotion
from ml.voice_emotion import detect_voice_emotion
from ml.fusion import fuse_emotions
from ml.recommend import recommend_song

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/analyze", methods=["POST"])
def analyze():
    text = request.form.get("text")

    image = request.files.get("image")
    audio = request.files.get("audio")

    if not text or not image or not audio:
        return jsonify({"error": "Missing input"}), 400

    image_path = os.path.join(UPLOAD_FOLDER, "face.jpg")
    audio_path = os.path.join(UPLOAD_FOLDER, "voice.wav")

    image.save(image_path)
    audio.save(audio_path)

    face_em = detect_face_emotion(image_path)
    text_em = detect_text_emotion(text)
    voice_em = detect_voice_emotion(audio_path)

    final_emotion = fuse_emotions(face_em, text_em, voice_em)
    songs = recommend_song(final_emotion)

    return jsonify({
        "face_emotion": face_em,
        "text_emotion": text_em,
        "voice_emotion": voice_em,
        "final_emotion": final_emotion,
        "songs": songs
    })


if __name__ == "__main__":
    print("Starting Flask API...")
    app.run(host="127.0.0.1", port=5000, debug=True)
