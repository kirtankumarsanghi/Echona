import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { analyzeWithFlask } from "../api/flask";
import { useToast } from "../components/Toast";

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
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#happyGrad)" />
          <path d="M30 55 Q50 75 70 55" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <circle cx="35" cy="40" r="4" fill="white"/>
          <circle cx="65" cy="40" r="4" fill="white"/>
          <defs>
            <linearGradient id="happyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-amber-400 to-yellow-400", 
      bgColor: "bg-amber-500/20", 
      borderColor: "border-amber-400",
      description: "Joyful & Positive"
    },
    { 
      name: "Sad", 
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#sadGrad)" />
          <path d="M30 65 Q50 55 70 65" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <circle cx="35" cy="40" r="4" fill="white"/>
          <circle cx="65" cy="40" r="4" fill="white"/>
          <path d="M32 35 L32 25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M68 35 L68 25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="sadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-sky-400 to-blue-400", 
      bgColor: "bg-sky-500/20", 
      borderColor: "border-sky-400",
      description: "Down & Blue"
    },
    { 
      name: "Angry", 
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#angryGrad)" />
          <path d="M30 65 Q50 55 70 65" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <circle cx="35" cy="45" r="4" fill="white"/>
          <circle cx="65" cy="45" r="4" fill="white"/>
          <path d="M25 32 L40 38" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <path d="M75 32 L60 38" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          <defs>
            <linearGradient id="angryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-red-500 to-rose-500", 
      bgColor: "bg-red-500/20", 
      borderColor: "border-red-500",
      description: "Frustrated & Mad"
    },
    { 
      name: "Calm", 
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#calmGrad)" />
          <path d="M30 55 L70 55" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          <path d="M35 40 Q37 35 39 40" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M61 40 Q63 35 65 40" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <defs>
            <linearGradient id="calmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-emerald-400 to-teal-400", 
      bgColor: "bg-emerald-500/20", 
      borderColor: "border-emerald-400",
      description: "Peaceful & Relaxed"
    },
    { 
      name: "Excited", 
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#excitedGrad)" />
          <circle cx="50" cy="60" r="8" fill="white"/>
          <circle cx="35" cy="40" r="6" fill="white"/>
          <circle cx="65" cy="40" r="6" fill="white"/>
          <path d="M30 25 L35 30 L30 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M70 25 L65 30 L70 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <defs>
            <linearGradient id="excitedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      ),
      color: "from-fuchsia-400 to-violet-400", 
      bgColor: "bg-fuchsia-500/20", 
      borderColor: "border-fuchsia-400",
      description: "Energized & Thrilled"
    },
    { 
      name: "Anxious", 
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="url(#anxiousGrad)" />
          <path d="M28 60 Q35 55 42 60 Q50 55 58 60 Q65 55 72 60" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <circle cx="35" cy="38" r="5" fill="white"/>
          <circle cx="65" cy="38" r="5" fill="white"/>
          <path d="M25 30 Q28 25 31 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M69 30 Q72 25 75 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <defs>
            <linearGradient id="anxiousGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
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
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.current.srcObject = stream;
};

const stopCamera = () => {
  videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
};

const capturePhoto = async () => {
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
      setText(e.results[0][0].transcript);
    };

    recog.onend = analyzeVoice;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-950 text-white overflow-hidden relative">
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.3, 1.1, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-orange-600/25 via-amber-600/15 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 100, -60, 0],
            scale: [1, 1.4, 1.2, 1],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-gradient-to-tl from-teal-600/25 via-emerald-600/15 to-transparent rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
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

      <div className="relative z-10 p-6 md:p-8 pt-24 md:pt-28">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-8 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </motion.button>

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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-coral-400">
                How Are You Feeling?
              </span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto"
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
              className={`relative px-6 md:px-8 py-4 rounded-2xl font-bold text-sm md:text-base transition-all duration-300 shadow-xl overflow-hidden ${
                mode === m.id
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/50 ring-2 ring-orange-400/50"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-white/20"
              }`}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 -z-10"
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
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Select Your Current Mood
              </h2>
              <p className="text-gray-400 text-base md:text-lg">
                Tap on the mood that best describes how you're feeling right now
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
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
                  whileHover={{ scale: 1.08, y: -12 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectManualMood(mood.name)}
                  disabled={loading}
                  className={`relative p-6 md:p-10 rounded-3xl ${mood.bgColor} border-2 ${mood.borderColor} backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {/* Animated Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-30 transition-all duration-500`} />
                  
                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={false}
                    whileHover={{
                      background: [
                        "linear-gradient(45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%)",
                        "linear-gradient(45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%)"
                      ],
                      backgroundPosition: ["-200% 0", "200% 0"],
                      transition: { duration: 1.5, repeat: Infinity }
                    }}
                  />
                  
                  <div className="relative">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="mb-5 flex justify-center"
                    >
                      {mood.icon}
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{mood.name}</h3>
                    <p className="text-sm md:text-base text-gray-300 mb-3">{mood.description}</p>
                    <motion.div 
                      className={`h-1.5 w-20 mx-auto rounded-full bg-gradient-to-r ${mood.color}`}
                      whileHover={{ width: "100px" }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Face Emotion Detection
                </h2>
                <p className="text-gray-400 text-base md:text-lg">
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
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl font-bold text-lg shadow-xl hover:shadow-teal-500/50 transition-all flex items-center gap-2"
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
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold text-lg shadow-xl hover:shadow-orange-500/50 transition-all disabled:opacity-50 flex items-center gap-2"
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
                  className="px-8 py-4 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl font-bold text-lg shadow-xl hover:shadow-rose-500/50 transition-all flex items-center gap-2"
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
            <div className="bg-gradient-to-br from-violet-900/50 to-fuchsia-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl text-center">
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
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Voice Emotion Analysis
              </h2>
              <p className="text-gray-300 mb-8 text-base md:text-lg max-w-lg mx-auto">
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
                className="px-12 py-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-violet-500/50 transition-all disabled:opacity-50 flex items-center gap-3 mx-auto"
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
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  Text Emotion Analysis
                </h2>
                <p className="text-gray-400 text-base md:text-lg">
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
                  className="w-full p-6 md:p-8 rounded-2xl bg-black/40 border-2 border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all min-h-[240px] text-base md:text-lg resize-none"
                  placeholder="Share your thoughts and feelings here...\n\nFor example:\n• 'I feel overwhelmed with all the work I have to do today'\n• 'I'm so excited about my upcoming vacation!'\n• 'Feeling peaceful after a good meditation session'"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mt-4 mb-6 text-sm text-gray-400"
              >
                <span>{text.length} characters</span>
                <span className={text.length < 10 ? "text-orange-400" : "text-green-400"}>
                  {text.length < 10 ? "Please write at least 10 characters" : "Ready to analyze"}
                </span>
              </motion.div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeText}
                disabled={loading || text.trim().length < 10}
                className="w-full px-8 py-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
            <div className="bg-gray-900/90 border border-orange-500/50 rounded-3xl p-8 shadow-2xl shadow-orange-500/30">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-xl font-bold text-orange-400">Analyzing your mood...</p>
            </div>
          </motion.div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
}

export default MoodDetect;
