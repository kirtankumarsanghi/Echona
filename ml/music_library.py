"""
ml/music_library.py — Curated song library mapped to the 10 ECHONA moods.

Each entry: {"title": str, "artist": str, "genre": str, "energy": str}
energy: "low" | "medium" | "high"
"""

MUSIC_LIBRARY = {
    "Happy": [
        {"title": "Happy",                       "artist": "Pharrell Williams",        "genre": "Pop",       "energy": "high"},
        {"title": "Uptown Funk",                  "artist": "Bruno Mars",               "genre": "Pop",       "energy": "high"},
        {"title": "Can't Stop the Feeling",       "artist": "Justin Timberlake",        "genre": "Pop",       "energy": "high"},
        {"title": "On Top of the World",          "artist": "Imagine Dragons",          "genre": "Pop Rock",  "energy": "high"},
        {"title": "Good Life",                    "artist": "OneRepublic",              "genre": "Pop",       "energy": "medium"},
        {"title": "Walking on Sunshine",          "artist": "Katrina & The Waves",      "genre": "Pop",       "energy": "high"},
        {"title": "Best Day of My Life",          "artist": "American Authors",         "genre": "Indie Pop", "energy": "high"},
        {"title": "Shake It Off",                 "artist": "Taylor Swift",             "genre": "Pop",       "energy": "high"},
    ],
    "Sad": [
        {"title": "Fix You",                      "artist": "Coldplay",                 "genre": "Alternative", "energy": "low"},
        {"title": "Someone Like You",             "artist": "Adele",                    "genre": "Pop",         "energy": "low"},
        {"title": "Let Her Go",                   "artist": "Passenger",                "genre": "Folk Pop",    "energy": "low"},
        {"title": "All I Want",                   "artist": "Kodaline",                 "genre": "Indie Pop",   "energy": "low"},
        {"title": "The Night We Met",             "artist": "Lord Huron",               "genre": "Indie Folk",  "energy": "low"},
        {"title": "Skinny Love",                  "artist": "Bon Iver",                 "genre": "Indie Folk",  "energy": "low"},
        {"title": "Chasing Cars",                 "artist": "Snow Patrol",              "genre": "Alternative", "energy": "low"},
        {"title": "The Sound of Silence",         "artist": "Simon & Garfunkel",        "genre": "Folk",        "energy": "low"},
    ],
    "Angry": [
        {"title": "Believer",                     "artist": "Imagine Dragons",          "genre": "Rock",       "energy": "high"},
        {"title": "Lose Yourself",                "artist": "Eminem",                   "genre": "Hip Hop",    "energy": "high"},
        {"title": "Numb",                         "artist": "Linkin Park",              "genre": "Nu-Metal",   "energy": "high"},
        {"title": "Stronger",                     "artist": "Kanye West",               "genre": "Hip Hop",    "energy": "high"},
        {"title": "Break Stuff",                  "artist": "Limp Bizkit",              "genre": "Nu-Metal",   "energy": "high"},
        {"title": "Killing in the Name",          "artist": "Rage Against the Machine", "genre": "Metal",      "energy": "high"},
        {"title": "In the End",                   "artist": "Linkin Park",              "genre": "Nu-Metal",   "energy": "high"},
        {"title": "Faint",                        "artist": "Linkin Park",              "genre": "Nu-Metal",   "energy": "high"},
    ],
    "Calm": [
        {"title": "Weightless",                   "artist": "Marconi Union",            "genre": "Ambient",    "energy": "low"},
        {"title": "Holocene",                     "artist": "Bon Iver",                 "genre": "Indie Folk", "energy": "low"},
        {"title": "River",                        "artist": "Leon Bridges",             "genre": "Soul",       "energy": "low"},
        {"title": "Sunset Lover",                 "artist": "Petit Biscuit",            "genre": "Electronic", "energy": "low"},
        {"title": "Clair de Lune",                "artist": "Debussy",                  "genre": "Classical",  "energy": "low"},
        {"title": "Re: Stacks",                   "artist": "Bon Iver",                 "genre": "Indie Folk", "energy": "low"},
        {"title": "Experience",                   "artist": "Ludovico Einaudi",         "genre": "Modern Classical", "energy": "low"},
        {"title": "Nuvole Bianche",               "artist": "Ludovico Einaudi",         "genre": "Modern Classical", "energy": "low"},
    ],
    "Excited": [
        {"title": "Dynamite",                     "artist": "BTS",                      "genre": "K-Pop",      "energy": "high"},
        {"title": "Thunder",                      "artist": "Imagine Dragons",          "genre": "Pop Rock",   "energy": "high"},
        {"title": "Firework",                     "artist": "Katy Perry",               "genre": "Pop",        "energy": "high"},
        {"title": "Eye of the Tiger",             "artist": "Survivor",                 "genre": "Rock",       "energy": "high"},
        {"title": "Pump Up the Jam",              "artist": "Technotronic",             "genre": "Dance",      "energy": "high"},
        {"title": "Levels",                       "artist": "Avicii",                   "genre": "EDM",        "energy": "high"},
        {"title": "Don't Stop Me Now",            "artist": "Queen",                    "genre": "Rock",       "energy": "high"},
        {"title": "Mr. Brightside",               "artist": "The Killers",              "genre": "Indie Rock", "energy": "high"},
    ],
    "Anxious": [
        {"title": "Breathe (2 AM)",               "artist": "Anna Nalick",              "genre": "Pop",        "energy": "low"},
        {"title": "Easy On Me",                   "artist": "Adele",                    "genre": "Pop",        "energy": "low"},
        {"title": "Please Don't Say You Love Me", "artist": "Gabrielle Aplin",          "genre": "Indie Folk", "energy": "low"},
        {"title": "Yellow",                       "artist": "Coldplay",                 "genre": "Alternative","energy": "medium"},
        {"title": "The Night",                    "artist": "Disturbed",                "genre": "Alternative","energy": "medium"},
        {"title": "Unwritten",                    "artist": "Natasha Bedingfield",      "genre": "Pop",        "energy": "medium"},
        {"title": "Breathe",                      "artist": "Pink Floyd",               "genre": "Rock",       "energy": "low"},
        {"title": "Slow Down",                    "artist": "Brandy",                   "genre": "R&B",        "energy": "low"},
    ],
    "Stressed": [
        {"title": "Weightless",                   "artist": "Marconi Union",            "genre": "Ambient",    "energy": "low"},
        {"title": "Stress Relief Sounds",         "artist": "Nature Sounds",            "genre": "Ambient",    "energy": "low"},
        {"title": "Lose You to Love Me",          "artist": "Selena Gomez",             "genre": "Pop",        "energy": "low"},
        {"title": "R U Mine?",                    "artist": "Arctic Monkeys",           "genre": "Indie Rock", "energy": "medium"},
        {"title": "Demons",                       "artist": "Imagine Dragons",          "genre": "Pop Rock",   "energy": "medium"},
        {"title": "Keep Your Head Up",            "artist": "Ben Howard",               "genre": "Folk",       "energy": "low"},
        {"title": "Let It Be",                    "artist": "The Beatles",              "genre": "Classic Rock","energy": "low"},
        {"title": "Mr. Blue Sky",                 "artist": "Electric Light Orchestra", "genre": "Classic Rock","energy": "medium"},
    ],
    "Lonely": [
        {"title": "Mad World",                    "artist": "Tears for Fears",          "genre": "New Wave",   "energy": "low"},
        {"title": "Eleanor Rigby",                "artist": "The Beatles",              "genre": "Classic Rock","energy": "low"},
        {"title": "Only the Lonely",              "artist": "Roy Orbison",              "genre": "Pop",        "energy": "low"},
        {"title": "Liability",                    "artist": "Lorde",                    "genre": "Indie Pop",  "energy": "low"},
        {"title": "Creep",                        "artist": "Radiohead",                "genre": "Alternative","energy": "medium"},
        {"title": "Boulevard of Broken Dreams",   "artist": "Green Day",                "genre": "Punk Rock",  "energy": "medium"},
        {"title": "Wish You Were Here",           "artist": "Pink Floyd",               "genre": "Rock",       "energy": "low"},
        {"title": "Comfortably Numb",             "artist": "Pink Floyd",               "genre": "Rock",       "energy": "low"},
    ],
    "Tired": [
        {"title": "Sleepwalker",                  "artist": "Adam Lambert",             "genre": "Pop",        "energy": "low"},
        {"title": "Lullaby",                      "artist": "Shawn Mullins",            "genre": "Folk",       "energy": "low"},
        {"title": "Breathe Me",                   "artist": "Sia",                      "genre": "Indie Pop",  "energy": "low"},
        {"title": "The Night Will Always Win",    "artist": "Manchester Orchestra",     "genre": "Indie Rock", "energy": "low"},
        {"title": "Slow Motion",                  "artist": "Trey Songz",               "genre": "R&B",        "energy": "low"},
        {"title": "Coffee",                       "artist": "beabadoobee",              "genre": "Indie Pop",  "energy": "low"},
        {"title": "Night Owl",                    "artist": "Gerry Rafferty",           "genre": "Classic Rock","energy": "low"},
        {"title": "Lost in Japan",                "artist": "Shawn Mendes",             "genre": "Pop",        "energy": "low"},
    ],
    "Neutral": [
        {"title": "Viva la Vida",                 "artist": "Coldplay",                 "genre": "Alternative","energy": "medium"},
        {"title": "Clocks",                       "artist": "Coldplay",                 "genre": "Alternative","energy": "medium"},
        {"title": "The Scientist",                "artist": "Coldplay",                 "genre": "Alternative","energy": "low"},
        {"title": "Counting Stars",               "artist": "OneRepublic",              "genre": "Pop",        "energy": "medium"},
        {"title": "Photograph",                   "artist": "Ed Sheeran",               "genre": "Pop",        "energy": "low"},
        {"title": "Ordinary World",               "artist": "Duran Duran",              "genre": "New Wave",   "energy": "medium"},
        {"title": "Vienna",                       "artist": "Billy Joel",               "genre": "Classic Pop","energy": "low"},
        {"title": "The Sound of Silence",         "artist": "Disturbed",                "genre": "Metal",      "energy": "medium"},
    ],
}

# Alias lookup: lowercase key → canonical Key
_ALIAS = {k.lower(): k for k in MUSIC_LIBRARY}
# backwards-compatible aliases for old lowercase keys
for _old in ["happy", "sad", "angry", "calm"]:
    _ALIAS[_old] = _old.capitalize()

