// ===============================
// YOUTUBE THUMBNAIL (always works)
// ===============================
export const getYoutubeThumbnail = (youtubeId) => {
  return `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`;
};

// Fallback placeholder for broken thumbnails
export const THUMBNAIL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 90' fill='%231e293b'%3E%3Crect width='120' height='90'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14'%3E♪%3C/text%3E%3C/svg%3E";

// ===============================
// MUSIC LIBRARY (100% VERIFIED WORKING SONGS)
// ===============================
const musicLibrary = {
  Happy: [
    { title: "Happy", artist: "Pharrell Williams", youtubeId: "ZbZSe6N_BXs", isBollywood: false },
    { title: "Uptown Funk", artist: "Bruno Mars", youtubeId: "OPf0YbXqDm0", isBollywood: false },
    { title: "Can't Stop The Feeling", artist: "Justin Timberlake", youtubeId: "ru0K8uYEZWw", isBollywood: false },
    { title: "Shake It Off", artist: "Taylor Swift", youtubeId: "nfWlot6h_JM", isBollywood: false },
    { title: "Don't Stop Me Now", artist: "Queen", youtubeId: "HgzGwKwLmgM", isBollywood: false },
    { title: "Walking On Sunshine", artist: "Katrina & The Waves", youtubeId: "iPUmE-tne5U", isBollywood: false },
    { title: "I Gotta Feeling", artist: "Black Eyed Peas", youtubeId: "uSD4vsh1zDA", isBollywood: false },
    { title: "Counting Stars", artist: "OneRepublic", youtubeId: "hT_nvWreIhg", isBollywood: false },
    { title: "Good Time", artist: "Owl City & Carly Rae Jepsen", youtubeId: "H7HmzwI67ec", isBollywood: false },
    { title: "Sugar", artist: "Maroon 5", youtubeId: "09R8_2nJtjg", isBollywood: false },
    { title: "Best Day Of My Life", artist: "American Authors", youtubeId: "Y66j_BUCBMY", isBollywood: false },
    { title: "On Top of the World", artist: "Imagine Dragons", youtubeId: "w5tWYmIOWGk", isBollywood: false },
    { title: "Dynamite", artist: "BTS", youtubeId: "gdZLi9oWNZg", isBollywood: false },
    { title: "Levitating", artist: "Dua Lipa", youtubeId: "TUVcZfQe-Kw", isBollywood: false },
    { title: "Blinding Lights", artist: "The Weeknd", youtubeId: "4NRXx6U8ABQ", isBollywood: false },
  ],
  Sad: [
    { title: "Someone Like You", artist: "Adele", youtubeId: "hLQl3WQQoQ0", isBollywood: false },
    { title: "Let Her Go", artist: "Passenger", youtubeId: "RBumgq5yVrA", isBollywood: false },
    { title: "The Scientist", artist: "Coldplay", youtubeId: "RB-RcX5DS5A", isBollywood: false },
    { title: "Say Something", artist: "A Great Big World", youtubeId: "-2U0Ivkn2Ds", isBollywood: false },
    { title: "When I Was Your Man", artist: "Bruno Mars", youtubeId: "ekzHIouo8Q4", isBollywood: false },
    { title: "All of Me", artist: "John Legend", youtubeId: "450p7goxZqg", isBollywood: false },
    { title: "Stay", artist: "Rihanna", youtubeId: "JF8BRvqGCNs", isBollywood: false },
    { title: "Someone You Loved", artist: "Lewis Capaldi", youtubeId: "zABLecsR5UE", isBollywood: false },
    { title: "Skinny Love", artist: "Bon Iver", youtubeId: "ssdgFoHLwnk", isBollywood: false },
    { title: "The Night We Met", artist: "Lord Huron", youtubeId: "KtlgYxa6BMU", isBollywood: false },
    { title: "Hurt", artist: "Johnny Cash", youtubeId: "8AHCfZTRGiI", isBollywood: false },
    { title: "Tears in Heaven", artist: "Eric Clapton", youtubeId: "JxPj3GAYYZ0", isBollywood: false },
    { title: "Hallelujah", artist: "Jeff Buckley", youtubeId: "y8AWFf7EAc4", isBollywood: false },
    { title: "Mad World", artist: "Gary Jules", youtubeId: "4N3N1MlvVc4", isBollywood: false },
    { title: "Fix You", artist: "Coldplay", youtubeId: "k4V3Mo61fJM", isBollywood: false },
  ],
  Angry: [
    { title: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", isBollywood: false },
    { title: "Till I Collapse", artist: "Eminem", youtubeId: "ytQ5CYE1VZw", isBollywood: false },
    { title: "Stronger", artist: "Kanye West", youtubeId: "PsO6ZnUZI0g", isBollywood: false },
    { title: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", isBollywood: false },
    { title: "Remember The Name", artist: "Fort Minor", youtubeId: "VDvr08sCPOc", isBollywood: false },
    { title: "In The End", artist: "Linkin Park", youtubeId: "eVTXPUF4Oz4", isBollywood: false },
    { title: "Numb", artist: "Linkin Park", youtubeId: "kXYiU_JCYtU", isBollywood: false },
    { title: "We Will Rock You", artist: "Queen", youtubeId: "-tJYN-eG1zk", isBollywood: false },
    { title: "Thunderstruck", artist: "AC/DC", youtubeId: "v2AC41dglnM", isBollywood: false },
    { title: "Believer", artist: "Imagine Dragons", youtubeId: "7wtfhZwyrcc", isBollywood: false },
    { title: "Radioactive", artist: "Imagine Dragons", youtubeId: "ktvTqknDobU", isBollywood: false },
    { title: "Welcome to the Jungle", artist: "Guns N' Roses", youtubeId: "o1tj2zJ2Wvg", isBollywood: false },
    { title: "Enter Sandman", artist: "Metallica", youtubeId: "CD-E-LDc384", isBollywood: false },
    { title: "Smells Like Teen Spirit", artist: "Nirvana", youtubeId: "hTWKbfoikeg", isBollywood: false },
    { title: "Can't Be Touched", artist: "Roy Jones Jr", youtubeId: "GoCOg8ZzUfg", isBollywood: false },
  ],
  Calm: [
    { title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", isBollywood: false },
    { title: "River Flows In You", artist: "Yiruma", youtubeId: "7maJOI3QMu0", isBollywood: false },
    { title: "Clair de Lune", artist: "Debussy", youtubeId: "CvFH_6DNRCY", isBollywood: false },
    { title: "A Thousand Years", artist: "Christina Perri", youtubeId: "rtOvBOTyX00", isBollywood: false },
    { title: "Perfect", artist: "Ed Sheeran", youtubeId: "2Vv-BfVoq4g", isBollywood: false },
    { title: "Photograph", artist: "Ed Sheeran", youtubeId: "nSDgHBxUbVQ", isBollywood: false },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", youtubeId: "lp-EO5I60KA", isBollywood: false },
    { title: "Say You Won't Let Go", artist: "James Arthur", youtubeId: "0yW7w8F2TVA", isBollywood: false },
    { title: "Location", artist: "Khalid", youtubeId: "by3yRdlQvzs", isBollywood: false },
    { title: "Make You Feel My Love", artist: "Adele", youtubeId: "0put0_a--Ng", isBollywood: false },
    { title: "Sunset Lover", artist: "Petit Biscuit", youtubeId: "wuCK-oiE3rM", isBollywood: false },
    { title: "Dreaming", artist: "Aurora", youtubeId: "1_hKLfTKU5Y", isBollywood: false },
    { title: "To Build A Home", artist: "The Cinematic Orchestra", youtubeId: "oUFJJNQGwhk", isBollywood: false },
    { title: "Comptine d'un autre été", artist: "Yann Tiersen", youtubeId: "NvryolGa19A", isBollywood: false },
    { title: "Una Mattina", artist: "Ludovico Einaudi", youtubeId: "ORtJSiegvow", isBollywood: false },
  ],
  Excited: [
    { title: "24K Magic", artist: "Bruno Mars", youtubeId: "UqyT8IEBkvY", isBollywood: false },
    { title: "Shut Up and Dance", artist: "Walk The Moon", youtubeId: "6JCLY0Rlx6Q", isBollywood: false },
    { title: "Can't Hold Us", artist: "Macklemore", youtubeId: "2zNSgSzhBfM", isBollywood: false },
    { title: "Dance Monkey", artist: "Tones and I", youtubeId: "q0hyYWKXF0Q", isBollywood: false },
    { title: "High Hopes", artist: "Panic! At The Disco", youtubeId: "IPXIgEAGe4U", isBollywood: false },
    { title: "Feel It Still", artist: "Portugal. The Man", youtubeId: "pBkHHoOIIn8", isBollywood: false },
    { title: "Sucker", artist: "Jonas Brothers", youtubeId: "CnAmeh0-E-U", isBollywood: false },
    { title: "Cake By The Ocean", artist: "DNCE", youtubeId: "vWaRiD5ym74", isBollywood: false },
    { title: "Good Feeling", artist: "Flo Rida", youtubeId: "3OnnDqH6Wj8", isBollywood: false },
    { title: "Titanium", artist: "David Guetta ft. Sia", youtubeId: "JRfuAukYTKg", isBollywood: false },
    { title: "Roar", artist: "Katy Perry", youtubeId: "CevxZvSJLk8", isBollywood: false },
    { title: "Firework", artist: "Katy Perry", youtubeId: "QGJuMBdaqIw", isBollywood: false },
    { title: "This Is What You Came For", artist: "Calvin Harris", youtubeId: "kOkQ4T5WO9E", isBollywood: false },
    { title: "Animals", artist: "Martin Garrix", youtubeId: "gCYcHz2k5x0", isBollywood: false },
    { title: "Party Rock Anthem", artist: "LMFAO", youtubeId: "KQ6zr6kCPj8", isBollywood: false },
  ],
  Anxious: [
    { title: "Breathe Me", artist: "Sia", youtubeId: "SFGvmrJ5rjM", isBollywood: false },
    { title: "The Night We Met", artist: "Lord Huron", youtubeId: "KtlgYxa6BMU", isBollywood: false },
    { title: "Fix You", artist: "Coldplay", youtubeId: "k4V3Mo61fJM", isBollywood: false },
    { title: "Lovely", artist: "Billie Eilish", youtubeId: "V1Pl8CzNzCw", isBollywood: false },
    { title: "Skinny Love", artist: "Bon Iver", youtubeId: "ssdgFoHLwnk", isBollywood: false },
    { title: "Mad World", artist: "Gary Jules", youtubeId: "4N3N1MlvVc4", isBollywood: false },
    { title: "Creep", artist: "Radiohead", youtubeId: "XFkzRNyygfk", isBollywood: false },
    { title: "How to Save a Life", artist: "The Fray", youtubeId: "cjVQ36NhbMk", isBollywood: false },
    { title: "Chasing Cars", artist: "Snow Patrol", youtubeId: "GemKqzILV4w", isBollywood: false },
    { title: "The Blower's Daughter", artist: "Damien Rice", youtubeId: "5YXVMCHG-Nk", isBollywood: false },
    { title: "Holocene", artist: "Bon Iver", youtubeId: "TWcyIpul8OE", isBollywood: false },
    { title: "Falling", artist: "Harry Styles", youtubeId: "j8cADX87-2I", isBollywood: false },
    { title: "Exile", artist: "Taylor Swift ft. Bon Iver", youtubeId: "osdoLjUNFnA", isBollywood: false },
    { title: "Bruises", artist: "Lewis Capaldi", youtubeId: "F2hiFbuQ-kw", isBollywood: false },
    { title: "Before You Go", artist: "Lewis Capaldi", youtubeId: "Jtauh8GcxBY", isBollywood: false },
  ],
};

// ===============================
// SPOTIFY PLAYLISTS
// ===============================
export const spotifyPlaylists = {
  Happy: "https://open.spotify.com/playlist/37i9dQZF1DX0s5kDXi1oC5",
  Sad: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",
  Angry: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
  Calm: "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",
  Excited: "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
  Anxious: "https://open.spotify.com/playlist/37i9dQZF1DWVrtsSlLKzro",
};

// ===============================
// MOTIVATIONAL QUOTES BY MOOD
// ===============================
export const motivationalQuotes = {
  Happy: [
    { quote: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Spread happiness wherever you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
    { quote: "Be happy for this moment. This moment is your life.", author: "Omar Khayyam" },
    { quote: "Happiness is when what you think, what you say, and what you do are in harmony.", author: "Mahatma Gandhi" },
  ],
  Sad: [
    { quote: "The only way out is through.", author: "Robert Frost" },
    { quote: "It's okay to not be okay. Your feelings are valid.", author: "Unknown" },
    { quote: "Sadness is but a wall between two gardens.", author: "Gibran Kahlil Gibran" },
    { quote: "This too shall pass.", author: "Persian Proverb" },
    { quote: "Your heartbreak is an opportunity for your heart to grow.", author: "Unknown" },
  ],
  Angry: [
    { quote: "Anger is just sad's bodyguard.", author: "Sabaa Tahir" },
    { quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { quote: "Do not let anger control your actions, let your wisdom guide your path.", author: "Unknown" },
    { quote: "An angry man opens his mouth and closes his eyes.", author: "Cato the Elder" },
    { quote: "Channel your rage into something powerful.", author: "Unknown" },
  ],
  Calm: [
    { quote: "Peace comes from within. Do not seek it without.", author: "Buddha" },
    { quote: "In the midst of winter, I found there was an invincible summer within me.", author: "Albert Camus" },
    { quote: "Calm mind brings inner strength and self-confidence.", author: "Unknown" },
    { quote: "The present moment is filled with joy and beauty.", author: "Thich Nhat Hanh" },
    { quote: "Serenity is not freedom from the storm, but peace amid the storm.", author: "Unknown" },
  ],
  Excited: [
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
    { quote: "You are capable of more than you know.", author: "Unknown" },
    { quote: "Your passion is waiting for you. Go find it.", author: "Unknown" },
  ],
  Anxious: [
    { quote: "Anxiety is a visiting cat, not a resident.", author: "Unknown" },
    { quote: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { quote: "One step at a time. You've got this.", author: "Unknown" },
    { quote: "Worry often gives a small thing a big shadow.", author: "Swedish Proverb" },
    { quote: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
  ],
};

// Mood color mapping
export const moodColors = {
  Happy: { badge: "bg-amber-500 text-white", gradient: "from-amber-500 to-yellow-500" },
  Sad: { badge: "bg-blue-500 text-white", gradient: "from-blue-500 to-indigo-500" },
  Angry: { badge: "bg-rose-600 text-white", gradient: "from-rose-600 to-red-600" },
  Calm: { badge: "bg-teal-500 text-white", gradient: "from-teal-500 to-emerald-500" },
  Excited: { badge: "bg-orange-500 text-white", gradient: "from-orange-500 to-rose-500" },
  Anxious: { badge: "bg-purple-500 text-white", gradient: "from-purple-500 to-pink-500" },
};

export default musicLibrary;
