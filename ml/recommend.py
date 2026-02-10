songs = {
    "happy": ["Happy Song 1", "Happy Song 2"],
    "sad": ["Sad Song 1", "Sad Song 2"],
    "neutral": ["Chill Song 1"],
    "angry": ["Rock Song 1"]
}

def recommend_song(emotion):
    return songs.get(emotion, ["Default Song"])
