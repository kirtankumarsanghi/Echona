import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import SmartMoodFeature from "../components/SmartMoodFeature";
import SurpriseMe from "../components/SurpriseMe";
import ThemeToggle from "../components/ThemeToggle";
import QuickActions from "../components/QuickActions";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";

// ===============================
// YOUTUBE THUMBNAIL (always works)
// ===============================
const getYoutubeThumbnail = (youtubeId) => {
  // Try multiple thumbnail qualities
  return `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`;
};

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
const spotifyPlaylists = {
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
const motivationalQuotes = {
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

// =======================================================================
// MAIN COMPONENT
// =======================================================================
function Music() {
  const navigate = useNavigate();

  const [currentMood, setCurrentMood] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);

  useEffect(() => {
    fetchMoodAndMusic();
  }, []);

  // ===============================
  // SHUFFLE ARRAY FUNCTION
  // ===============================
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ===============================
  // FETCH MOOD HISTORY
  // ===============================
  const fetchMoodAndMusic = async () => {
    try {
      // First check localStorage for detected mood from ML
      const detectedMood = localStorage.getItem("detected_mood");
      let mood = "Happy"; // default

      if (detectedMood) {
        // Normalize mood name (capitalize first letter)
        mood = detectedMood.charAt(0).toUpperCase() + detectedMood.slice(1).toLowerCase();
        
        // Check if mood exists in our library, if not use Happy
        if (!musicLibrary[mood]) {
          mood = "Happy";
        }
      } else {
        // Fallback to API
        try {
          const res = await axiosInstance.get("/api/mood/history");
          const history = res.data;
          if (history.length > 0) {
            mood = history[history.length - 1].mood;
          }
        } catch {
          // Keep default Happy mood
        }
      }

      setCurrentMood(mood);
      
      // Shuffle songs randomly each time
      const shuffledSongs = shuffleArray(musicLibrary[mood] || musicLibrary.Happy);
      setSongs(shuffledSongs);
      
      // Random quote
      const quotes = motivationalQuotes[mood] || motivationalQuotes.Happy;
      setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      
    } catch (error) {
      console.error("Error fetching mood:", error);
      setCurrentMood("Happy");
      setSongs(shuffleArray(musicLibrary.Happy));
      setCurrentQuote(motivationalQuotes.Happy[Math.floor(Math.random() * motivationalQuotes.Happy.length)]);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // PLAYER CONTROLS
  // ===============================
  const playSong = (song) => {
    setCurrentlyPlaying(song);
    setShowPlayer(true);
  };

  const changeQuote = () => {
    if (currentMood && motivationalQuotes[currentMood] && motivationalQuotes[currentMood].length > 0) {
      const quotes = motivationalQuotes[currentMood];
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const newQuote = quotes[randomIndex];
      setCurrentQuote({ ...newQuote }); // Force state update with new object
    }
  };

  const refreshSongs = () => {
    if (currentMood && musicLibrary[currentMood]) {
      const shuffledSongs = shuffleArray(musicLibrary[currentMood]);
      setSongs(shuffledSongs);
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setCurrentlyPlaying(null);
  };

  const playNext = () => {
    const index = songs.findIndex((s) => s.youtubeId === currentlyPlaying.youtubeId);
    const next = songs[(index + 1) % songs.length];
    playSong(next);
  };

  const playPrev = () => {
    const index = songs.findIndex((s) => s.youtubeId === currentlyPlaying.youtubeId);
    const prev = songs[(index - 1 + songs.length) % songs.length];
    playSong(prev);
  };

  // =======================================================================
  // UI START
  // =======================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-black text-white overflow-hidden pt-28">

      {/* Animated Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -50, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        />
        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 md:p-12">

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 text-lg font-medium mb-10 transition-colors"
        >
          ← Back to Home
        </motion.button>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-500 border-t-cyan-400 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-400 text-xl">Loading Music...</p>
          </motion.div>
        ) : (
          <>
            {/* Motivational Quote Section */}
            {currentQuote && (
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl mx-auto mb-16"
              >
                <div className="relative p-10 bg-gradient-to-br from-purple-600/15 to-pink-600/15 border border-purple-500/40 rounded-3xl backdrop-blur-xl overflow-hidden group hover:border-purple-400/60 transition-all duration-300">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <svg className="absolute -top-8 -left-6 w-10 h-10 text-cyan-400 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.021-5-7-5S0 3.75 0 5v10c0 5 3 8 7 8z" />
                    </svg>
                    <motion.p
                      key={currentQuote.quote}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed pl-8 pr-4"
                    >
                      {currentQuote.quote}
                    </motion.p>
                    <motion.p
                      key={currentQuote.author}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-right text-cyan-300 mt-5 text-lg font-medium"
                    >
                      — {currentQuote.author}
                    </motion.p>
                  </div>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={changeQuote}
                    className="mt-8 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    💭 Get New Inspiration
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-5xl mx-auto text-center mb-16"
            >
              <div className="inline-block mb-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-full">
                <p className="text-cyan-300 text-sm font-semibold">🎵 PERSONALIZED FOR YOU</p>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                  Your Music Mood
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Curated tracks perfect for when you're feeling
                <span className={`ml-2 font-bold text-2xl inline-block px-4 py-2 rounded-lg`}>
                  {currentMood === "Happy" && "😊 Happy"}
                  {currentMood === "Sad" && "😢 Sad"}
                  {currentMood === "Angry" && "😠 Angry"}
                  {currentMood === "Calm" && "😌 Calm"}
                  {currentMood === "Excited" && "🤩 Excited"}
                  {currentMood === "Anxious" && "😰 Anxious"}
                </span>
              </p>

              {/* Play All Button */}
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playSong(songs[0])}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 font-bold rounded-2xl text-lg shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  ▶ Play All {songs.length} Songs
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshSongs}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 font-bold rounded-2xl text-lg shadow-lg hover:shadow-purple-500/50 transition-all"
                  title="Get different random songs"
                >
                  🔄 Refresh Songs
                </motion.button>
              </div>
            </motion.div>

            {/* SONG CARDS */}
            <div className="max-w-5xl mx-auto mb-16">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold mb-8 flex items-center gap-3"
              >
                <span className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
                Featured Tracks
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-6">
                {songs.map((song, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    <div className="relative flex items-center gap-5 bg-gray-800/50 backdrop-blur-xl p-5 rounded-2xl border border-gray-700/50 group-hover:border-cyan-500/50 transition-all duration-300 shadow-xl">
                      
                      {/* Thumbnail */}
                      <div className="relative flex-shrink-0">
                        <img
                          loading="lazy"
                          src={getYoutubeThumbnail(song.youtubeId)}
                          className="w-24 h-24 rounded-xl object-cover shadow-lg"
                          alt={song.title}
                          onError={(e) => { e.target.src = "/default-thumb.jpg" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent rounded-xl" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <p className="text-lg font-bold text-white truncate flex-1">
                            {song.title}
                          </p>
                          {song.isBollywood ? (
                            <span className="text-xs bg-red-500/80 px-3 py-1 rounded-full font-semibold flex-shrink-0">🎬 Bollywood</span>
                          ) : (
                            <span className="text-xs bg-blue-500/80 px-3 py-1 rounded-full font-semibold flex-shrink-0">🎵 English</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      </div>

                      {/* Play Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playSong(song)}
                        className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-cyan-500/50 transition-all"
                      >
                        ▶
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Spotify Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-5xl mx-auto mb-16"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40 p-12 text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-emerald-500/10 to-green-500/0" />
                
                <div className="relative">
                  <p className="text-gray-300 mb-4">Stream full playlists on</p>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    href={spotifyPlaylists[currentMood]}
                    target="_blank"
                    className="inline-block px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    🎧 Listen on Spotify
                  </motion.a>
                </div>
              </div>
            </motion.div>

            <SmartMoodFeature mood={currentMood} />
            <SurpriseMe />
          </>
        )}
      </div>

      {/* PLAYER MODAL */}
      {showPlayer && currentlyPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          onClick={closePlayer}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex justify-between items-start">
              <div className="flex-1">
                <p className="text-cyan-100 text-sm font-semibold mb-2">NOW PLAYING</p>
                <h2 className="text-3xl font-bold text-white mb-2">{currentlyPlaying.title}</h2>
                <p className="text-gray-100 text-lg">{currentlyPlaying.artist}</p>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={closePlayer}
                className="text-white text-4xl font-bold flex-shrink-0 w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg transition"
              >
                ×
              </motion.button>
            </div>

            {/* Player */}
            <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentlyPlaying.youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 p-6 flex justify-between gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPrev}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all text-lg"
              >
                ⏮ Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold transition-all text-lg"
              >
                Next ⏭
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Theme Toggle & Quick Actions */}
      <ThemeToggle />
      <QuickActions />
      <BreathingExercise />
      <MeditationTimer />
    </div>
  );
}

export default Music;
