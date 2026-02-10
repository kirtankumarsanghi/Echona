from collections import Counter

def fuse_emotions(face, text, voice):
    emotions = [face, text, voice]
    return Counter(emotions).most_common(1)[0][0]
