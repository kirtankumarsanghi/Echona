from text_emotion import detect_text_emotion
from face_emotion import detect_face_emotion
from voice_emotion import detect_voice_emotion
from fusion import fuse_emotions
from recommend import recommend_song

text = "I feel very low today"

face_em = detect_face_emotion("face.jpg")
text_em = detect_text_emotion(text)
voice_em = detect_voice_emotion("voice.wav")

final_emotion = fuse_emotions(face_em, text_em, voice_em)
songs = recommend_song(final_emotion)

print("Face Emotion:", face_em)
print("Text Emotion:", text_em)
print("Voice Emotion:", voice_em)
print("Final Emotion:", final_emotion)
print("Recommended Songs:", songs)
