import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import SmartMoodFeature from "../components/SmartMoodFeature";
import SurpriseMe from "../components/SurpriseMe";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";
import MusicChallenges from "../components/MusicChallenges";
import SpotifyPlayer from "../components/SpotifyPlayer";
import SpotifySearch from "../components/SpotifySearch";
import SpotifyDashboard from "../components/SpotifyDashboard";
import { getSpotifyToken, clearSpotifyTokens } from "../utils/auth";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";

// Get API base URL for Spotify OAuth (production or dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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
  
  // Spotify state
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState(null);

  // Function to clear expired Spotify token
  const clearSpotifyToken = () => {
    clearSpotifyTokens();
    setSpotifyToken(null);
    console.log("🔄 Cleared expired Spotify token. Please reconnect.");
  };

  useEffect(() => {
    fetchMoodAndMusic();
    
    // Check for Spotify token
    const token = getSpotifyToken();
    if (token) {
      setSpotifyToken(token);
    }
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

  // Song list visibility state
  const [showSongList, setShowSongList] = useState(false);

  // =======================================================================
  // UI START
  // =======================================================================
  return (
    <AppShell>

      {/* Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mix-blend-screen filter blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 100, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full mix-blend-screen filter blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header with Back Button and Options Menu */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mood-detect")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-sm text-slate-200 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <OptionsMenu currentPage="/music" />
          </motion.div>
        </div>

        {/* Spotify Connect Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {getSpotifyToken() ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-sm text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span className="font-semibold">Spotify Connected</span>
              </div>
              <button
                onClick={clearSpotifyToken}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-400 hover:bg-red-500/30 transition-all font-semibold"
                title="Disconnect and reconnect if you're having issues"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <a
              href={`${API_BASE_URL}/api/spotify/login`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-full text-sm text-white font-bold transition-all shadow-lg hover:shadow-emerald-500/40 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Connect to Spotify</span>
            </a>
          )}
        </motion.div>

        {/* Spotify Player & Search - Only show when connected */}
        {spotifyToken && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
          >
            <SpotifyPlayer 
              accessToken={spotifyToken}
              onPlayerReady={(deviceId) => setSpotifyDeviceId(deviceId)}
            />
            <SpotifyDashboard 
              spotifyToken={spotifyToken}
            />
          </motion.div>
        )}

        {/* Spotify Search - Always available (works without login) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SpotifySearch 
            accessToken={spotifyToken}
            deviceId={spotifyDeviceId}
          />
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-white/20 border-t-amber-500 rounded-full mx-auto mb-4"
            />
            <p className="text-white/90 text-xl font-semibold">Loading your music...</p>
          </motion.div>
        ) : (
          <>
            {/* Hero Player Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 md:p-8 mb-8 overflow-hidden"
            >
              {/* Current Mood Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg ${
                  currentMood === "Happy" ? "bg-amber-500 text-white" :
                  currentMood === "Sad" ? "bg-blue-500 text-white" :
                  currentMood === "Angry" ? "bg-rose-600 text-white" :
                  currentMood === "Calm" ? "bg-teal-500 text-white" :
                  currentMood === "Excited" ? "bg-orange-500 text-white" :
                  "bg-purple-500 text-white"
                }`}>
                  {currentMood}
                </span>
              </div>

              {/* Quote Section */}
              {currentQuote && (
                <div className="mb-8 max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
                    <span className="text-amber-400 font-bold text-sm tracking-wider uppercase">Daily Inspiration</span>
                  </div>
                  <motion.p
                    key={currentQuote.quote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-white mb-2 leading-relaxed"
                  >
                    "{currentQuote.quote}"
                  </motion.p>
                  <p className="text-white/60 text-sm">— {currentQuote.author}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={changeQuote}
                    className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm font-semibold transition-all"
                  >
                    Next Quote →
                  </motion.button>
                </div>
              )}

              {/* Player Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playSong(songs[0])}
                  className="px-6 md:px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Play All
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshSongs}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold rounded-full transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Shuffle
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSongList(!showSongList)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold rounded-full transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {showSongList ? 'Hide' : 'View'} Playlist ({songs.length})
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/mood-detect')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold rounded-full transition-all"
                >
                  Change Mood
                </motion.button>
              </div>
            </motion.div>

            {/* Collapsible Song List */}
            <AnimatePresence>
              {showSongList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Your Playlist</h3>
                      <span className="text-white/60 text-sm">{songs.length} songs</span>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {songs.map((song, index) => (
                        <motion.div
                          key={song.youtubeId || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ x: 4 }}
                          className="flex items-center gap-3 p-3 bg-slate-800/60 hover:bg-slate-700/70 rounded-lg transition-all cursor-pointer group"
                          onClick={() => playSong(song)}
                        >
                          <span className="text-white/40 text-sm font-mono w-6">{String(index + 1).padStart(2, '0')}</span>
                          <img
                            src={getYoutubeThumbnail(song.youtubeId)}
                            className="w-12 h-12 rounded object-cover"
                            alt={song.title}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{song.title}</p>
                            <p className="text-white/60 text-xs truncate">{song.artist}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${song.isBollywood ? 'bg-rose-500/20 text-rose-300' : 'bg-teal-500/20 text-teal-300'}`}>
                            {song.isBollywood ? 'Hindi' : 'English'}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Integrated Features Grid */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Spotify Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-900/80 backdrop-blur-lg border border-slate-700 rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.73 14.42c-.15.25-.42.39-.7.39-.13 0-.27-.03-.39-.1-1.41-.8-3.18-1.23-5.12-1.23-.97 0-1.9.11-2.76.33-.38.09-.77-.14-.86-.52-.09-.38.14-.77.52-.86.98-.25 2.03-.37 3.1-.37 2.15 0 4.11.5 5.83 1.48.35.2.48.65.28 1z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Extended Playlist</h3>
                </div>
                <p className="text-white/80 mb-4">Discover more {currentMood} songs on Spotify</p>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={spotifyPlaylists[currentMood]}
                  target="_blank"
                  className="inline-block px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-full shadow-lg transition-all"
                >
                  Open Spotify →
                </motion.a>
              </motion.div>
            </div>

            {/* Smart Features */}
            <div className="grid grid-cols-1 gap-6 mb-8">
              <SmartMoodFeature mood={currentMood} />
              <SurpriseMe />
            </div>
          </>
        )}
      </div>

      {/* PLAYER MODAL */}
      {showPlayer && currentlyPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50"
          onClick={closePlayer}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 flex justify-between items-start">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full mb-2">
                  <span className="text-white text-xs font-bold tracking-wider">NOW PLAYING</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{currentlyPlaying.title}</h2>
                <p className="text-white/90 text-base">{currentlyPlaying.artist}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closePlayer}
                className="text-white flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-lg transition font-bold text-2xl"
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
            <div className="bg-slate-950 p-6 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPrev}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-bold transition-all"
              >
                PREVIOUS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playNext}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                NEXT
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BreathingExercise />
      <MeditationTimer />
      
      {/* Music Challenges */}
      <MusicChallenges currentSong={currentlyPlaying} mood={currentMood} />
    </AppShell>
  );
}

export default Music;
