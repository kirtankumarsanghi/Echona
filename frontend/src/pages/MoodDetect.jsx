import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import MoodQuote from "../components/MoodQuote";
import MoodJournal from "../components/MoodJournal";
import ThemeToggle from "../components/ThemeToggle";
import QuickActions from "../components/QuickActions";
import { useToast } from "../components/Toast";
import BreathingExercise from "../components/BreathingExercise";
import MeditationTimer from "../components/MeditationTimer";
import MoodQuiz from "../components/MoodQuiz";

// Icon component for moods - Beautiful, expressive icons
const MoodIcon = ({ type, className = "" }) => {
  const icons = {
    Happy: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Eyes */}
        <circle cx="35" cy="40" r="4" fill="currentColor" />
        <circle cx="65" cy="40" r="4" fill="currentColor" />
        {/* Big happy smile */}
        <path d="M 30 55 Q 50 75 70 55" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    ),
    Sad: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Sad eyes */}
        <circle cx="35" cy="42" r="3" fill="currentColor" />
        <circle cx="65" cy="42" r="3" fill="currentColor" />
        {/* Tear drop */}
        <path d="M 35 50 Q 35 58 35 62 Q 35 66 32 66 Q 29 66 29 62 Q 29 58 29 54" fill="currentColor" opacity="0.6" />
        {/* Sad frown */}
        <path d="M 30 68 Q 50 58 70 68" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    ),
    Angry: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Angry eyebrows */}
        <path d="M 25 35 L 40 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M 75 35 L 60 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        {/* Angry eyes */}
        <circle cx="35" cy="45" r="3" fill="currentColor" />
        <circle cx="65" cy="45" r="3" fill="currentColor" />
        {/* Angry mouth */}
        <path d="M 30 65 L 70 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    Anxious: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Worried eyes */}
        <circle cx="35" cy="43" r="4" fill="currentColor" />
        <circle cx="65" cy="43" r="4" fill="currentColor" />
        {/* Worried eyebrows curved up */}
        <path d="M 25 35 Q 35 32 40 35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 75 35 Q 65 32 60 35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Wavy worried mouth */}
        <path d="M 32 62 Q 40 58 48 62 Q 52 58 60 62 Q 65 58 68 62" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
    Calm: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Closed peaceful eyes */}
        <path d="M 28 42 Q 35 45 42 42" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M 58 42 Q 65 45 72 42" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Content smile */}
        <path d="M 35 62 Q 50 68 65 62" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    ),
    Excited: (
      <svg className={className} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="45" fill="currentColor" opacity="0.1" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
        {/* Sparkle effects around */}
        <path d="M 20 20 L 22 22 M 21 18 L 21 24 M 18 21 L 24 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M 80 25 L 82 27 M 81 23 L 81 29 M 78 26 L 84 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Wide excited eyes */}
        <circle cx="35" cy="42" r="5" fill="currentColor" />
        <circle cx="65" cy="42" r="5" fill="currentColor" />
        {/* Big open smile */}
        <ellipse cx="50" cy="62" rx="18" ry="12" stroke="currentColor" strokeWidth="3" fill="currentColor" opacity="0.2" />
        <path d="M 32 62 Q 50 75 68 62" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    )
  };
  return icons[type] || null;
};

const moods = [
  { 
    label: "Happy", 
    color: "from-yellow-400 to-yellow-600", 
    gradient: "bg-yellow-500/10",
    bgGlow: "from-yellow-500/30",
    description: "Feeling joyful and content",
    iconType: "Happy"
  },
  { 
    label: "Sad", 
    color: "from-blue-500 to-blue-700", 
    gradient: "bg-blue-500/10",
    bgGlow: "from-blue-500/30",
    description: "Feeling down or melancholic",
    iconType: "Sad"
  },
  { 
    label: "Angry", 
    color: "from-red-500 to-red-700", 
    gradient: "bg-red-500/10",
    bgGlow: "from-red-500/30",
    description: "Feeling frustrated or irritated",
    iconType: "Angry"
  },
  { 
    label: "Anxious", 
    color: "from-purple-500 to-purple-700", 
    gradient: "bg-purple-500/10",
    bgGlow: "from-purple-500/30",
    description: "Feeling worried or nervous",
    iconType: "Anxious"
  },
  { 
    label: "Calm", 
    color: "from-green-400 to-green-600", 
    gradient: "bg-green-500/10",
    bgGlow: "from-green-500/30",
    description: "Feeling peaceful and relaxed",
    iconType: "Calm"
  },
  { 
    label: "Excited", 
    color: "from-pink-500 to-pink-700", 
    gradient: "bg-pink-500/10",
    bgGlow: "from-pink-500/30",
    description: "Feeling energetic and enthusiastic",
    iconType: "Excited"
  },
];

function MoodDetect() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionMode, setDetectionMode] = useState("manual"); // manual, camera, voice, text
  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [showJournal, setShowJournal] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizMood, setQuizMood] = useState(null);
  const [moodCardMode, setMoodCardMode] = useState({}); // Track mode for each mood card: 'select' or 'quiz'
  const [hoveredMood, setHoveredMood] = useState(null); // Track which mood is being hovered for adaptive background
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { showToast, ToastContainer } = useToast();

  const saveMood = async (moodLabel) => {
    setSelectedMood(moodLabel);
    setShowJournal(true);
    setIsLoading(false);
  };

  const saveMoodWithoutNote = async (moodLabel) => {
    setIsLoading(true);

    try {
      console.log("[MoodDetect] Saving mood:", moodLabel);
      const token = localStorage.getItem("echona_token");
      console.log("[MoodDetect] Token available:", !!token);
      
      const response = await axiosInstance.post(
        "/api/mood/add",
        {
          mood: moodLabel,
          score: Math.floor(Math.random() * 10) + 1,
          intensity: moodIntensity,
        }
      );
      
      console.log("[MoodDetect] Mood saved successfully:", response.data);
      showToast(`Mood "${moodLabel}" saved successfully!`, "success");
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate("/music");
    } catch (err) {
      console.error("[MoodDetect] Error saving mood:", err);
      console.error("[MoodDetect] Error response:", err.response?.data);
      
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save mood";
      
      // If token error, offer to re-login
      if (err.response?.status === 401 || errorMessage.toLowerCase().includes("token")) {
        const reLogin = window.confirm(`Authentication Error: ${errorMessage}\n\nWould you like to go to the login page?`);
        if (reLogin) {
          localStorage.removeItem("echona_token");
          localStorage.removeItem("echona_user");
          navigate("/auth");
          return;
        }
      }
      
      showToast(`Failed to save mood: ${errorMessage}`, "error");
      setIsLoading(false);
      setSelectedMood(null);
    }
  };

  // Camera mode
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const capturePhoto = async () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Simple facial expression analysis based on image brightness and positioning
      // This is a basic implementation - in production, use a facial recognition API
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate average brightness to simulate mood detection
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        totalBrightness += brightness;
      }
      const avgBrightness = totalBrightness / (data.length / 4);
      
      // Simple mood detection based on brightness (simulation)
      let detectedMood;
      if (avgBrightness > 140) {
        detectedMood = "Happy"; // Bright image suggests happy
      } else if (avgBrightness > 120) {
        detectedMood = "Calm"; // Medium brightness
      } else if (avgBrightness > 100) {
        detectedMood = "Excited"; // Slightly darker
      } else if (avgBrightness > 80) {
        detectedMood = "Anxious"; // Darker
      } else if (avgBrightness > 60) {
        detectedMood = "Sad"; // Even darker
      } else {
        detectedMood = "Angry"; // Very dark
      }
      
      // Stop camera
      stopCamera();
      
      // Save the detected mood
      await saveMood(detectedMood);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Voice mode
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recognition, setRecognition] = useState(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      showToast("Speech recognition not supported in this browser. Please use Chrome or Edge.", "error");
      setIsRecording(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    let fullTranscript = "";

    recognitionInstance.onresult = (event) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTextInput(fullTranscript + interimTranscript);
    };

    recognitionInstance.onerror = (event) => {
      console.error("[MoodDetect] Speech recognition error:", event.error);
      showToast(`Speech recognition error: ${event.error}`, "error");
      setIsRecording(false);
    };

    recognitionInstance.onend = () => {
      setIsRecording(false);
    };

    try {
      recognitionInstance.start();
      setRecognition(recognitionInstance);
      showToast("Listening... Start speaking!", "success");
    } catch (err) {
      console.error("[MoodDetect] Failed to start recording:", err);
      showToast("Failed to start voice recording", "error");
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = async () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    
    setIsRecording(false);
    
    if (textInput.trim()) {
      showToast("Analyzing your voice...", "info");
      await analyzeText();
    } else {
      showToast("No speech detected. Please try again.", "error");
    }
  };

  // Text mode
  const analyzeText = async () => {
    if (!textInput.trim()) return;
    
    setIsLoading(true);
    try {
      console.log("[MoodDetect] Analyzing text:", textInput);
      
      // Call backend AI analysis
      const response = await axiosInstance.post("/api/mood/analyze-text", {
        text: textInput
      });
      
      console.log("[MoodDetect] AI Analysis result:", response.data);
      
      const detectedMood = response.data.mood;
      showToast(`AI detected mood: ${detectedMood}!`, "success");
      
      // Save the detected mood
      await saveMood(detectedMood);
      setTextInput("");
    } catch (err) {
      console.error("[MoodDetect] Text analysis error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Failed to analyze text";
      showToast(`Failed to analyze text: ${errorMessage}`, "error");
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 pt-28 overflow-hidden relative">
      
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Blobs */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.3, 1.1, 1],
            rotate: [0, 90, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/30 via-blue-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 80, -50, 0],
            scale: [1, 1.2, 1.4, 1],
            rotate: [0, -90, -180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[700px] h-[700px] bg-gradient-to-tl from-purple-500/30 via-pink-500/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.4, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-transparent rounded-full blur-3xl"
        />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent)]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Enhanced Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all shadow-lg shadow-black/20 group mb-10"
        >
          <span className="text-xl transition-transform group-hover:-translate-x-1">←</span>
          <span className="font-semibold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">Back to Dashboard</span>
        </motion.button>

        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 relative"
        >
          {/* Floating Circle Decorations */}
          <div className="absolute inset-0 pointer-events-none">
            {moods.map((mood, i) => (
              <motion.div
                key={mood.label}
                className={`absolute w-12 h-12 rounded-full bg-gradient-to-br ${mood.color} opacity-20`}
                style={{
                  left: `${15 + (i * 15)}%`,
                  top: `${i % 2 === 0 ? -20 : -40}px`,
                }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <motion.div
            className="mb-4 flex justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-4 relative"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-[length:200%_auto] drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              How Are You Feeling?
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your emotional wellbeing matters. Let's explore your mood together.
          </motion.p>
          
          <motion.div
            className="flex items-center justify-center gap-2 text-cyan-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>Choose a method below to detect your mood</span>
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Detection Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { 
              mode: "manual", 
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>,
              label: "Manual Select", 
              desc: "Choose mood" 
            },
            { 
              mode: "camera", 
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              label: "Camera", 
              desc: "Face detection" 
            },
            { 
              mode: "voice", 
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
              label: "Voice", 
              desc: "Speak your mind" 
            },
            { 
              mode: "text", 
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
              label: "Text", 
              desc: "Write it down" 
            },
          ].map((option, index) => (
            <motion.button
              key={option.mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDetectionMode(option.mode)}
              className={`group relative px-6 py-4 rounded-2xl font-semibold transition-all border-2 backdrop-blur-xl ${
                detectionMode === option.mode
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-400 shadow-xl shadow-cyan-500/50 scale-105"
                  : "bg-gray-800/40 border-gray-700/50 hover:border-cyan-500/50 hover:bg-gray-800/60"
              }`}
            >
              {/* Glow effect on active */}
              {detectionMode === option.mode && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={detectionMode === option.mode ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5, repeat: detectionMode === option.mode ? Infinity : 0, repeatDelay: 2 }}
                  >
                    {option.svgIcon}
                  </motion.div>
                  <span>{option.label}</span>
                </div>
                <span className={`text-xs transition-opacity ${
                  detectionMode === option.mode ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                }`}>
                  {option.desc}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Manual Mode - Enhanced Mood Grid */}
        {detectionMode === "manual" && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"
          >
            {moods.map((mood, index) => {
              const currentMode = moodCardMode[mood.label] || 'select';
              
              return (
                <motion.div
                  key={mood.label}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Enhanced Mode Toggle Tabs */}
                  <div className="flex gap-2 mb-3">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setMoodCardMode(prev => ({ ...prev, [mood.label]: 'select' }))}
                      className={`relative flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all overflow-hidden ${
                        currentMode === 'select'
                          ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                          : 'bg-gray-800/40 text-gray-400 border border-gray-700/50 hover:border-gray-600/70 backdrop-blur-sm'
                      }`}
                    >
                      {currentMode === 'select' && (
                        <motion.div
                          layoutId={`tab-${mood.label}`}
                          className={`absolute inset-0 bg-gradient-to-r ${mood.color} -z-10`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <MoodIcon type={mood.iconType} className="w-4 h-4 inline-block" /> Select
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setMoodCardMode(prev => ({ ...prev, [mood.label]: 'quiz' }))}
                      className={`relative flex-1 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all overflow-hidden ${
                        currentMode === 'quiz'
                          ? `bg-gradient-to-r ${mood.color} text-white shadow-lg`
                          : 'bg-gray-800/40 text-gray-400 border border-gray-700/50 hover:border-gray-600/70 backdrop-blur-sm'
                      }`}
                    >
                      {currentMode === 'quiz' && (
                        <motion.div
                          layoutId={`tab-${mood.label}`}
                          className={`absolute inset-0 bg-gradient-to-r ${mood.color} -z-10`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Quiz
                    </motion.button>
                  </div>

                  <AnimatePresence mode="wait">
                    {currentMode === 'select' ? (
                      <motion.div
                        key="select-mode"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.button
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onHoverStart={() => setHoveredMood(mood.label)}
                          onHoverEnd={() => setHoveredMood(null)}
                          onClick={() => saveMood(mood.label)}
                          disabled={isLoading && selectedMood !== mood.label}
                          className={`w-full relative group cursor-pointer transition-all duration-300 ${
                            isLoading && selectedMood !== mood.label ? "pointer-events-none opacity-50" : ""
                          } ${selectedMood === mood.label ? "ring-4 ring-cyan-400" : ""}`}
                        >
                          {/* Enhanced Multi-layer Glow Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-500`} />
                          <div className={`absolute inset-0 bg-gradient-to-br ${mood.bgGlow} to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500`} />
                          
                          {/* Enhanced Card with Glassmorphism */}
                          <div className={`relative p-8 rounded-3xl border-2 border-gray-700/30 group-hover:border-gray-500/50 transition-all duration-500 ${mood.gradient} backdrop-blur-2xl bg-gray-900/30 overflow-hidden`}>
                            
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25px 25px, ${mood.color.includes('yellow') ? '#fbbf24' : mood.color.includes('blue') ? '#3b82f6' : mood.color.includes('red') ? '#ef4444' : mood.color.includes('purple') ? '#a855f7' : mood.color.includes('green') ? '#10b981' : '#ec4899'} 2%, transparent 0%)`,
                                backgroundSize: '50px 50px',
                              }} />
                            </div>

                            {/* Corner Accent */}
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${mood.color} opacity-20 blur-2xl rounded-full`} />
                            
                            {/* Success Checkmark */}
                            {selectedMood === mood.label && isLoading && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-green-600 backdrop-blur-xl"
                              >
                                <motion.svg
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                  className="w-16 h-16 text-white drop-shadow-lg"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </motion.svg>
                              </motion.div>
                            )}

                            {/* Content */}
                            <div className={`relative text-center transition-all duration-300 ${selectedMood === mood.label && isLoading ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
                              {/* Floating Icon Badge */}
                              <motion.div
                                className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${mood.color} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg`}
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm" />
                              </motion.div>

                              <motion.div 
                                className="mb-4 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                                animate={{ 
                                  scale: hoveredMood === mood.label ? [1, 1.15, 1.1] : 1,
                                  rotate: hoveredMood === mood.label ? [0, -5, 5, 0] : 0
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                <MoodIcon type={mood.iconType} className="w-28 h-28 md:w-32 md:h-32 text-white" />
                              </motion.div>
                              
                              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                                {mood.label}
                              </h3>
                              
                              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                                {mood.description}
                              </p>
                              
                              <motion.div
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs text-gray-300"
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Click to select</span>
                              </motion.div>
                            </div>

                            {/* Enhanced Hover Shine Effect */}
                            <motion.div 
                              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              animate={{ x: [-200, 300] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12" />
                            </motion.div>
                          </div>
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="quiz-mode"
                        initial={{ opacity: 0, rotateY: 90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: -90 }}
                        transition={{ duration: 0.3 }}
                        className="relative group"
                      >
                        {/* Enhanced Multi-layer Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-all duration-500`} />
                        <div className={`absolute inset-0 bg-gradient-to-br ${mood.bgGlow} to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500`} />

                        {/* Enhanced Quiz Card Content */}
                        <div className={`relative p-8 rounded-3xl border-2 border-gray-700/30 group-hover:border-gray-500/50 transition-all duration-500 ${mood.gradient} backdrop-blur-2xl bg-gray-900/30 min-h-[320px] flex flex-col items-center justify-center overflow-hidden`}>
                          
                          {/* Animated Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                              backgroundImage: `radial-gradient(circle at 25px 25px, ${mood.color.includes('yellow') ? '#fbbf24' : mood.color.includes('blue') ? '#3b82f6' : mood.color.includes('red') ? '#ef4444' : mood.color.includes('purple') ? '#a855f7' : mood.color.includes('green') ? '#10b981' : '#ec4899'} 2%, transparent 0%)`,
                              backgroundSize: '50px 50px',
                            }} />
                          </div>

                          {/* Corner Accent */}
                          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${mood.color} opacity-20 blur-3xl rounded-full`} />
                          <div className={`absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr ${mood.color} opacity-15 blur-2xl rounded-full`} />

                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 10, 0],
                              scale: [1, 1.15, 1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity, 
                              repeatDelay: 2 
                            }}
                            className="mb-4 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
                          >
                            <svg className="w-28 h-28 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth={2} />
                              <circle cx="12" cy="12" r="6" strokeWidth={2} />
                              <circle cx="12" cy="12" r="2" fill="currentColor" />
                            </svg>
                          </motion.div>
                          
                          <motion.div
                            className={`w-16 h-1 bg-gradient-to-r ${mood.color} rounded-full mb-4`}
                            animate={{ width: ["4rem", "5rem", "4rem"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />

                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            {mood.label} Quiz
                          </h3>
                          
                          <p className="text-gray-300 text-center text-sm mb-6 max-w-xs leading-relaxed">
                            Test your knowledge about {mood.label.toLowerCase()} mood, music, and wellness
                          </p>
                          
                          <motion.button
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setQuizMood(mood.label);
                              setShowQuiz(true);
                            }}
                            className={`relative w-full py-4 bg-gradient-to-r ${mood.color} text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 overflow-hidden group/btn`}
                          >
                            {/* Button Shine Effect */}
                            <motion.div 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              animate={{ x: [-200, 200] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                            />
                            
                            <motion.div
                              className="relative z-10"
                              animate={{ y: [0, -3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                              </svg>
                            </motion.div>
                            <span className="relative z-10">Start Quiz Now</span>
                          </motion.button>
                          
                          <div className="mt-6 flex items-center gap-6 text-xs">
                            <motion.div 
                              className="flex items-center gap-2 text-gray-400"
                              whileHover={{ scale: 1.1, color: "#ffffff" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>5 questions</span>
                            </motion.div>
                            <div className="w-px h-4 bg-gray-600" />
                            <motion.div 
                              className="flex items-center gap-2 text-gray-400"
                              whileHover={{ scale: 1.1, color: "#ffffff" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>2 minutes</span>
                            </motion.div>
                            <div className="w-px h-4 bg-gray-600" />
                            <motion.div 
                              className="flex items-center gap-2 text-gray-400"
                              whileHover={{ scale: 1.1, color: "#ffffff" }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span>Get score</span>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Info Banner for Manual Mode */}
        {detectionMode === "manual" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 backdrop-blur-xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>
              <p className="text-gray-300 text-sm">
                Your mood data is private and secure. We use it to provide better recommendations.
              </p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Camera Mode */}
        {detectionMode === "camera" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl border-2 border-gray-700/50 p-8 overflow-hidden shadow-2xl"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.3),transparent_50%)]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Camera Detection</h2>
              </div>
              
              <p className="text-gray-300 mb-6 text-sm">AI will analyze your facial expression to detect your mood</p>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative rounded-2xl overflow-hidden bg-black/50 border-2 border-gray-700/50 aspect-video"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Camera Frame Overlay */}
                  <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-2xl pointer-events-none" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-red-500 rounded-full"
                      />
                      <span>Recording</span>
                    </div>
                  </div>
                </motion.div>
                <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startCamera}
                    className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Start Camera</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={capturePhoto}
                    className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl font-semibold shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <span>Capture Photo</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={stopCamera}
                    className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 rounded-xl font-semibold shadow-lg hover:shadow-red-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Stop</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Voice Mode */}
        {detectionMode === "voice" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-2xl rounded-3xl border-2 border-gray-700/50 p-8 text-center overflow-hidden shadow-2xl"
          >
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.3),transparent_50%)]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Voice Detection</h2>
              </div>
              
              <motion.div
                animate={isRecording ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.8, repeat: isRecording ? Infinity : 0 }}
                className="relative inline-block mb-6"
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_10px_40px_rgba(168,85,247,0.5)]"
                  animate={isRecording ? { rotate: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5, repeat: isRecording ? Infinity : 0 }}
                >
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </motion.div>
                {isRecording && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-purple-500/30 blur-2xl"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-pink-500/30 blur-2xl"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
              </motion.div>

              <motion.p 
                className="text-gray-200 mb-6 text-lg font-medium"
                animate={{ opacity: isRecording ? [1, 0.7, 1] : 1 }}
                transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
              >
                {isRecording ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    Recording... Describe how you're feeling
                  </span>
                ) : (
                  "Click below to start recording your voice"
                )}
              </motion.p>

              {/* Enhanced Transcription Display */}
              {textInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-5 rounded-2xl bg-gray-900/70 border-2 border-purple-500/30 text-left backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-purple-300 font-semibold">Transcription:</p>
                  </div>
                  <p className="text-white leading-relaxed">{textInput}</p>
                </motion.div>
              )}

              <div className="flex gap-4 flex-wrap justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startVoiceRecording}
                  disabled={isRecording}
                  className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all ${
                    isRecording
                      ? "bg-gray-700 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 hover:shadow-cyan-500/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <span>Start Recording</span>
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopVoiceRecording}
                  disabled={!isRecording}
                  className={`px-8 py-4 rounded-xl font-semibold shadow-lg transition-all ${
                    !isRecording
                      ? "bg-gray-700 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 hover:shadow-red-500/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    <span>Stop & Analyze</span>
                  </span>
                </motion.button>
              </div>
              
              <p className="text-gray-300 text-sm mt-6 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span>AI will analyze your tone and speech patterns</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Text Mode */}
        {detectionMode === "text" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Text Detection
            </h2>
            
            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Describe how you're feeling right now..."
                className="w-full h-32 p-4 rounded-xl bg-gray-900/50 border border-gray-600 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none"
              />
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeText}
                disabled={!textInput.trim()}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all ${
                  textInput.trim()
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/50"
                    : "bg-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze Text
              </motion.button>
              
              <p className="text-gray-400 text-sm">AI will use natural language processing to detect mood</p>
            </div>
          </motion.div>
        )}

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-gray-400 text-sm mt-12"
        >
          Your mood data is private and secure. We use it to provide better recommendations.
        </motion.p>

        {/* Mood Quote */}
        {selectedMood && !showJournal && <MoodQuote mood={selectedMood} />}

        {/* Mood Journal */}
        {selectedMood && showJournal && (
          <>
            <MoodQuote mood={selectedMood} />
            <MoodJournal mood={selectedMood} onSave={() => saveMoodWithoutNote(selectedMood)} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => saveMoodWithoutNote(selectedMood)}
                className="px-8 py-3 rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Skip Note & Continue →
              </motion.button>
            </motion.div>
          </>
        )}

        {/* Mood Intensity Slider */}
        {detectionMode === "manual" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Mood Intensity
              </label>
              <span className="text-2xl font-bold text-cyan-400">{moodIntensity}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={moodIntensity}
              onChange={(e) => setMoodIntensity(parseInt(e.target.value))}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${moodIntensity * 10}%, #374151 ${moodIntensity * 10}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </motion.div>
        )}

        {/* Motivational Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-purple-500/30 p-10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/5 to-purple-500/0" />
            <div className="relative text-center">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4 inline-block"
              >
                <svg className="w-20 h-20 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <p className="text-sm text-gray-400 mb-3 uppercase tracking-wider">Remember</p>
              <p className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed mb-4">
                "It's okay to not be okay. What matters is that you're taking steps to understand yourself better."
              </p>
              <p className="text-cyan-400 font-medium flex items-center justify-center gap-2">
                — You're doing great
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Theme Toggle & Toast */}
      <ThemeToggle />
      <QuickActions />
      <BreathingExercise />
      <MeditationTimer />
      <ToastContainer />

      {/* Mood Quiz Modal */}
      {showQuiz && quizMood && (
        <MoodQuiz
          mood={quizMood}
          onClose={() => {
            setShowQuiz(false);
            setQuizMood(null);
          }}
          onComplete={(score, total) => {
            showToast(`Quiz completed! You scored ${score}/${total}!`, "success");
          }}
        />
      )}
    </div>
  );
}

export default MoodDetect;
