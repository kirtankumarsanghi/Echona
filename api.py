from flask import Flask, jsonify, request
from flask_cors import CORS
from ml.recommend import recommend_songs
from ml.face_emotion import analyze_face_emotion
from ml.text_emotion import analyze_text_emotion

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {"status": "Backend running"}

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        analysis_type = data.get("type")
        
        if analysis_type == "face":
            image_data = data.get("image")
            if not image_data:
                return jsonify({"error": "No image data provided"}), 400
            
            mood = analyze_face_emotion(image_data)
            return jsonify({"mood": mood})
        
        elif analysis_type == "text":
            text = data.get("text")
            if not text:
                return jsonify({"error": "No text provided"}), 400
            
            mood = analyze_text_emotion(text)
            return jsonify({"mood": mood})
        
        else:
            return jsonify({"error": "Invalid analysis type"}), 400
    
    except Exception as e:
        print(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/recommend", methods=["GET"])
def recommend():
    emotion = request.args.get("emotion")
    songs = recommend_songs(emotion)
    return jsonify({"emotion": emotion, "songs": songs})

if __name__ == "__main__":
    app.run(debug=False, port=5000, use_reloader=False)
