from flask import Flask, request, jsonify
from flask_cors import CORS

from ml.face_emotion import detect_face_emotion
from ml.text_emotion import detect_text_emotion

app = Flask(__name__)
CORS(app)

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    analysis_type = data.get("type")

    if analysis_type == "face":
        return jsonify(detect_face_emotion(data["image"]))

    if analysis_type == "text":
        return jsonify(detect_text_emotion(data["text"]))

    return jsonify({"error": "Invalid analysis type"}), 400


if __name__ == "__main__":
    print("🔥 Flask API running on http://localhost:5000")
    app.run(debug=True)
