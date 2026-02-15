import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzeWithFlask } from "../api/flask";
import { useToast } from "../components/Toast";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";

function MoodDetect() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const [mode, setMode] = useState("manual"); // manual | camera | voice | text
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  const moods = [
    { 
      name: "Happy", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L36 20L48 24L36 28L32 40L28 28L16 24L28 20L32 8Z" fill="url(#happyGrad)" className="animate-pulse"/>
          <circle cx="32" cy="32" r="20" stroke="url(#happyGrad)" strokeWidth="2" opacity="0.3"/>
          <circle cx="32" cy="32" r="14" stroke="url(#happyGrad)" strokeWidth="2" opacity="0.5"/>
          <defs>
            <linearGradient id="happyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-amber-500 to-orange-500", 
      bgColor: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent", 
      borderColor: "border-amber-500/30",
      description: "Joyful & Positive",
      accent: "amber"
    },
    { 
      name: "Sad", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 48C32 48 20 44 20 32C20 20 32 16 32 16C32 16 44 20 44 32C44 44 32 48 32 48Z" fill="url(#sadGrad)" opacity="0.8"/>
          <path d="M28 20L28 12M36 20L36 12M24 32L18 32M46 32L40 32" stroke="url(#sadGrad)" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="sadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-blue-500 to-indigo-500", 
      bgColor: "bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent", 
      borderColor: "border-blue-500/30",
      description: "Down & Blue",
      accent: "blue"
    },
    { 
      name: "Angry", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 16L40 24L48 16L44 32L48 48L40 40L32 48L24 40L16 48L20 32L16 16L24 24L32 16Z" fill="url(#angryGrad)"/>
          <path d="M20 24L28 28M44 24L36 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
          <defs>
            <linearGradient id="angryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-red-500 to-rose-600", 
      bgColor: "bg-gradient-to-br from-red-500/10 via-rose-600/5 to-transparent", 
      borderColor: "border-red-500/30",
      description: "Frustrated & Mad",
      accent: "red"
    },
    { 
      name: "Calm", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 32C16 32 20 28 32 28C44 28 48 32 48 32M16 38C16 38 20 42 32 42C44 42 48 38 48 38" stroke="url(#calmGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
          <circle cx="32" cy="32" r="22" stroke="url(#calmGrad)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4"/>
          <circle cx="32" cy="32" r="4" fill="url(#calmGrad)"/>
          <defs>
            <linearGradient id="calmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-emerald-500 to-teal-500", 
      bgColor: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent", 
      borderColor: "border-emerald-500/30",
      description: "Peaceful & Relaxed",
      accent: "emerald"
    },
    { 
      name: "Excited", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 8L35 25L48 18L38 30L54 32L38 34L48 46L35 39L32 56L29 39L16 46L26 34L10 32L26 30L16 18L29 25L32 8Z" fill="url(#excitedGrad)"/>
          <circle cx="32" cy="32" r="8" fill="white" opacity="0.3"/>
          <defs>
            <linearGradient id="excitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-pink-500 to-fuchsia-500", 
      bgColor: "bg-gradient-to-br from-pink-500/10 via-fuchsia-500/5 to-transparent", 
      borderColor: "border-pink-500/30",
      description: "Energized & Thrilled",
      accent: "pink"
    },
    { 
      name: "Anxious", 
      icon: (
        <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 28L24 24L28 28M36 28L40 24L44 28" stroke="url(#anxiousGrad)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 36Q28 32 32 36Q36 32 42 36M24 42Q28 40 32 42Q36 40 40 42" stroke="url(#anxiousGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
          <circle cx="32" cy="32" r="24" stroke="url(#anxiousGrad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3"/>
          <defs>
            <linearGradient id="anxiousGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-slate-400 to-zinc-400", 
      bgColor: "bg-slate-500/20", 
      borderColor: "border-slate-400",
      description: "Worried & Nervous"
    },
  ];

  /* ---------------- MANUAL ---------------- */
  
  const selectManualMood = (moodName) => {
    setSelectedMood(moodName);
    localStorage.setItem("detected_mood", moodName);
    showToast(`Mood set to: ${moodName}`, "success");
    setTimeout(() => navigate("/music"), 1500);
  };

  /* ---------------- CAMERA ---------------- */

  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (err) {
    console.error("Camera access error:", err);
    showToast(
      err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access."
        : "Camera not available on this device.",
      "error"
    );
  }
};

const stopCamera = () => {
  videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
};

const capturePhoto = async () => {
  // Guard: ensure camera is active
  if (!videoRef.current?.srcObject || !videoRef.current.videoWidth) {
    showToast("Please start the camera first", "error");
    return;
  }

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = videoRef.current.videoWidth;
  canvas.height = videoRef.current.videoHeight;

  ctx.drawImage(videoRef.current, 0, 0);

  const base64Image = canvas.toDataURL("image/jpeg");

  setLoading(true);
  try {
    const res = await analyzeWithFlask({
      type: "face",
      image: base64Image,
    });

    if (res.error || !res.mood) {
      throw new Error(res.error || "Face detection failed");
    }
    
    localStorage.setItem("detected_mood", res.mood);
    showToast(`Detected: ${res.mood}`, "success");
    setTimeout(() => navigate("/music"), 1500);
  } catch (err) {
    console.error("Face detection error:", err);
    showToast(err.message || "Face detection failed", "error");
  } finally {
    setLoading(false);
    stopCamera();
  }
};

  

  /* ---------------- VOICE ---------------- */

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Speech not supported", "error");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.lang = "en-US";

    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      // Store transcript for analyzeVoice to use (avoids stale closure)
      recog._transcript = transcript;
    };

    recog.onend = async () => {
      const spokenText = recog._transcript || "";
      if (!spokenText.trim()) {
        showToast("No speech detected. Please try again.", "error");
        return;
      }
      setLoading(true);
      try {
        const res = await analyzeWithFlask({ 
          type: "text",
          text: spokenText 
        });
        
        if (res.error || !res.mood) {
          throw new Error(res.error || "Voice analysis failed");
        }
        
        localStorage.setItem("detected_mood", res.mood);
        showToast(`Detected: ${res.mood}`, "success");
        setTimeout(() => navigate("/music"), 1500);
      } catch (err) {
        console.error("Voice analysis error:", err);
        showToast(err.message || "Voice analysis failed", "error");
      }
      setLoading(false);
    };
    recognitionRef.current = recog;
    recog.start();
  };

  const analyzeVoice = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeWithFlask({ 
        type: "text",
        text: text 
      });
      
      if (res.error || !res.mood) {
        throw new Error(res.error || "Voice analysis failed");
      }
      
      localStorage.setItem("detected_mood", res.mood);
      showToast(`Detected: ${res.mood}`, "success");
      setTimeout(() => navigate("/music"), 1500);
    } catch (err) {
      console.error("Voice analysis error:", err);
      showToast(err.message || "Voice analysis failed", "error");
    }
    setLoading(false);
  };

  /* ---------------- TEXT ---------------- */

  const analyzeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeWithFlask({ 
        type: "text",
        text: text 
      });
      
      if (res.error || !res.mood) {
        throw new Error(res.error || "Text analysis failed");
      }
      
      localStorage.setItem("detected_mood", res.mood);
      showToast(`Detected: ${res.mood}`, "success");
      setTimeout(() => navigate("/music"), 1500);
    } catch (err) {
      console.error("Text analysis error:", err);
      showToast(err.message || "Text analysis failed", "error");
    }
    setLoading(false);
  };

  return (
    <AppShell>
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-60">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.3, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 100, -60, 0],
            scale: [1, 1.4, 1.2, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-tl from-cyan-600/15 via-emerald-600/10 to-transparent rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-slate-200/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Back Button and Options Menu */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full text-sm text-slate-200 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Home</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <OptionsMenu currentPage="/mood-detect" />
          </motion.div>
        </div>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300">
                How Are You Feeling?
              </span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto"
          >
            Choose your preferred detection method or manually select your current mood
          </motion.p>
        </motion.div>

        {/* MODE SELECT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-3 md:gap-4 mb-16 flex-wrap max-w-4xl mx-auto"
        >
          {[
            { id: "manual", icon: "●", label: "Manual Selection" },
            { id: "camera", icon: "◉", label: "Face Detection" },
            { id: "voice", icon: "◐", label: "Voice Analysis" },
            { id: "text", icon: "◆", label: "Text Analysis" }
          ].map((m, index) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => setMode(m.id)}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-6 md:px-8 py-4 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 shadow-lg overflow-hidden border ${
                mode === m.id
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-violet-500/30 border-violet-500/60"
                  : "bg-slate-900/70 text-slate-300 hover:bg-slate-800/80 backdrop-blur-xl border-slate-700 hover:border-slate-500"
              }`}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <span className="text-xl">{m.icon}</span>
                <span>{m.label}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4"
              >
                <div className="px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full backdrop-blur-sm">
                  <span className="text-violet-400 font-semibold text-xs tracking-widest uppercase">Manual Selection</span>
                </div>
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-100 tracking-tight">
                Select Your Current Mood
              </h2>
              <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Choose the emotion that resonates with your current state of mind
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood.name}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectManualMood(mood.name)}
                  disabled={loading}
                  className="relative p-8 md:p-10 rounded-2xl bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 overflow-hidden group transition-all duration-300 hover:border-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Top Border Accent */}
                  <motion.div 
                    className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${mood.color} opacity-0 group-hover:opacity-100`}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  {/* Radial Glow Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl bg-gradient-to-br ${mood.color}`} 
                    style={{ transform: 'scale(0.8)' }} 
                  />
                  
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -3, 3, 0] }}
                      transition={{ duration: 0.5 }}
                      className="mb-5 flex justify-center relative"
                    >
                      {/* Icon Glow */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${mood.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300`} />
                      <div className="relative">
                        {mood.icon}
                      </div>
                    </motion.div>
                    
                    {/* Text Content */}
                    <div className="space-y-2">
                      <h3 className="text-2xl md:text-3xl font-bold text-neutral-100 tracking-tight">{mood.name}</h3>
                      <p className="text-sm md:text-base text-neutral-400 font-medium">{mood.description}</p>
                    </div>
                    
                    {/* Animated Bottom Indicator */}
                    <motion.div 
                      className={`mt-5 h-1 rounded-full bg-gradient-to-r ${mood.color} mx-auto`}
                      initial={{ width: "2rem" }}
                      whileHover={{ width: "4rem" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Corner Accent */}
                  <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl ${mood.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-tl-3xl`} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CAMERA MODE */}
        {mode === "camera" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="card-premium rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Face Emotion Detection
                </h2>
                <p className="text-slate-300 text-base md:text-lg">
                  Position your face clearly in the camera frame and capture your expression
                </p>
              </div>
              
              <div className="relative rounded-3xl overflow-hidden bg-black/50 mb-8 border-2 border-white/10">
                <video ref={videoRef} autoPlay className="w-full rounded-3xl" />
                <canvas ref={canvasRef} width="640" height="480" hidden />
                
                {/* Camera overlay guides */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-teal-400/50 rounded-full" />
                </div>
              </div>
              
              <div className="flex gap-4 justify-center flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startCamera}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Camera
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-violet-500/35 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capture Photo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopCamera}
                  className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-slate-500/30 transition-all flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  Stop
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VOICE MODE */}
        {mode === "voice" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card-premium rounded-3xl p-8 md:p-16 shadow-2xl text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8 flex justify-center"
              >
                <svg className="w-24 h-24 md:w-32 md:h-32" viewBox="0 0 100 100" fill="none">
                  <rect x="35" y="20" width="30" height="40" rx="15" fill="url(#micGrad)" />
                  <path d="M25 55 Q25 75 50 75 Q75 75 75 55" stroke="url(#micGrad)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <line x1="50" y1="75" x2="50" y2="85" stroke="url(#micGrad)" strokeWidth="4" strokeLinecap="round"/>
                  <line x1="35" y1="85" x2="65" y2="85" stroke="url(#micGrad)" strokeWidth="4" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="micGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-100">
                Voice Emotion Analysis
              </h2>
              <p className="text-slate-300 mb-8 text-base md:text-lg max-w-lg mx-auto">
                Speak naturally about your feelings and let our AI analyze your emotional state
              </p>
              
              {text && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl backdrop-blur-sm"
                >
                  <p className="text-amber-300 italic text-lg">"{text}"</p>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startVoice}
                disabled={loading}
                className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-violet-500/35 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Speaking
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* TEXT MODE */}
        {mode === "text" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="card-premium rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  Text Emotion Analysis
                </h2>
                <p className="text-slate-300 text-base md:text-lg">
                  Express your feelings in words and let AI understand your emotional state
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-6 md:p-8 rounded-2xl bg-slate-950/80 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all min-h-[240px] text-base md:text-lg resize-none"
                  placeholder="Share your thoughts and feelings here...\n\nFor example:\n• 'I feel overwhelmed with all the work I have to do today'\n• 'I'm so excited about my upcoming vacation!'\n• 'Feeling peaceful after a good meditation session'"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mt-4 mb-6 text-sm text-slate-300"
              >
                <span>{text.length} characters</span>
                <span className={text.length < 10 ? "text-amber-400" : "text-emerald-400"}>
                  {text.length < 10 ? "Please write at least 10 characters" : "Ready to analyze"}
                </span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeText}
                disabled={loading || text.trim().length < 10}
                className="w-full px-8 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-violet-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analyze My Mood
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-slate-900/90 border border-violet-500/40 rounded-3xl p-8 shadow-2xl shadow-violet-500/30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-xl font-bold text-violet-300">Analyzing your mood...</p>
            </div>
          </motion.div>
        )}

        <ToastContainer />
      </div>
    </AppShell>
  );
}

export default MoodDetect;
