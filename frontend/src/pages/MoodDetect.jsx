import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { detectFace, detectText, detectVoice } from "../api/flask";
import { useToast } from "../components/Toast";
import AppShell from "../components/AppShell";
import OptionsMenu from "../components/OptionsMenu";
import { useMood } from "../context/MoodContext";                // #18 context
import { useSubmitGuard } from "../hooks/useDebounce";           // #21 debounce
import { sanitizeText } from "../utils/sanitize";                // #26 sanitize
import SEO from "../components/SEO";                             // #24 SEO
import MoodChatDetect from "../components/MoodChatDetect";        // AI chat detection

function MoodDetect() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const { saveMood } = useMood();                                 // #18 context
  const { guarded, guard } = useSubmitGuard();                    // #21 debounce

  const [mode, setMode] = useState("camera"); // camera | voice | text | chat
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const voiceChunksRef = useRef([]);
  const voiceStreamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceAudioBase64, setVoiceAudioBase64] = useState("");
  const [voiceFormat, setVoiceFormat] = useState("webm");

  const modeOptions = [
    { id: "camera", label: "Face", short: "Visual analysis", hint: "Use camera expression" },
    { id: "voice", label: "Voice", short: "Speech cues", hint: "Record and analyze voice" },
    { id: "text", label: "Text", short: "Written context", hint: "Describe how you feel" },
    { id: "chat", label: "Guided Chat", short: "Structured prompts", hint: "Short mood interview" },
  ];

  const getModeIcon = (id) => {
    switch (id) {
      case "manual":
      case "camera":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "voice":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a5 5 0 005-5V8a5 5 0 10-10 0v5a5 5 0 005 5zm0 0v3m-4 0h8" />
          </svg>
        );
      case "text":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h8m-8 4h6" />
            <rect x="3" y="4" width="18" height="16" rx="2" />
          </svg>
        );
      case "chat":
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const workflowSteps = [
    { id: 1, title: "Choose Method" },
    { id: 2, title: "Provide Input" },
    { id: 3, title: "Get Mood Result" },
  ];

  const activeMode = modeOptions.find((item) => item.id === mode) || modeOptions[0];

  /* ---------------- CAMERA ---------------- */

  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
        setCameraReady(true);
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
  setCameraReady(false);
};

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",", 2)[1] : "";
      if (!base64) {
        reject(new Error("Could not encode audio recording"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const stopVoiceCapture = () => {
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
    mediaRecorderRef.current.stop();
  }
  voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
  voiceStreamRef.current = null;
  setIsRecording(false);
};

const capturePhoto = async () => {
  if (guarded) return;                                             // #21 debounce
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
    const res = await detectFace({ image: base64Image });

    if (res.error || !res.mood) {
      throw new Error(res.error || "Face detection failed");
    }
    
    localStorage.setItem("detected_mood", res.mood);
    saveMood(res.mood);                                            // #18 context
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

  const startVoiceRecording = async () => {
    if (guarded || loading) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      showToast("Audio recording is not supported in this browser", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;
      voiceChunksRef.current = [];

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const type = recorder.mimeType || "audio/webm";
          const blob = new Blob(voiceChunksRef.current, { type });
          const encoded = await blobToBase64(blob);
          setVoiceAudioBase64(encoded);

          const mappedFormat = type.includes("wav")
            ? "wav"
            : type.includes("mp4")
              ? "mp4"
              : "webm";
          setVoiceFormat(mappedFormat);
          showToast("Voice recording captured. Tap Analyze Voice.", "success");
        } catch (err) {
          console.error("Voice recording processing error:", err);
          showToast("Could not process recorded audio", "error");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setVoiceAudioBase64("");
      setIsRecording(true);
      showToast("Recording started", "info");
    } catch (err) {
      console.error("Microphone access error:", err);
      showToast(
        err.name === "NotAllowedError"
          ? "Microphone permission denied. Please allow microphone access."
          : "Could not access microphone on this device.",
        "error"
      );
    }
  };

  const analyzeRecordedVoice = async () => {
    if (!voiceAudioBase64 || guarded) {
      showToast("Please record your voice first", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await detectVoice({
        audio_base64: voiceAudioBase64,
        format: voiceFormat,
      });

      if (res.error || !res.mood) {
        throw new Error(res.error || "Voice analysis failed");
      }

      localStorage.setItem("detected_mood", res.mood);
      saveMood(res.mood);
      showToast(`Detected: ${res.mood}`, "success");
      setTimeout(() => navigate("/music"), 1500);
    } catch (err) {
      console.error("Voice model analysis error:", err);
      showToast(err.message || "Voice analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

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
        const res = await detectText({ 
          text: sanitizeText(spokenText)                           // #26 sanitize
        });
        
        if (res.error || !res.mood) {
          throw new Error(res.error || "Voice analysis failed");
        }
        
        localStorage.setItem("detected_mood", res.mood);
        saveMood(res.mood);                                        // #18 context
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

  const stopVoiceTranscript = () => {
    recognitionRef.current?.stop?.();
  };

  const analyzeVoice = async () => {
    if (!text.trim() || guarded) return;                           // #21 debounce
    setLoading(true);
    try {
      const res = await detectText({ 
        text: sanitizeText(text)                                   // #26 sanitize
      });
      
      if (res.error || !res.mood) {
        throw new Error(res.error || "Voice analysis failed");
      }
      
      localStorage.setItem("detected_mood", res.mood);
      saveMood(res.mood);                                          // #18 context
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
    if (!text.trim() || guarded) return;                           // #21 debounce
    setLoading(true);
    try {
      const res = await detectText({ 
        text: sanitizeText(text)                                   // #26 sanitize
      });
      
      if (res.error || !res.mood) {
        throw new Error(res.error || "Text analysis failed");
      }
      
      localStorage.setItem("detected_mood", res.mood);
      saveMood(res.mood);                                          // #18 context
      showToast(`Detected: ${res.mood}`, "success");
      setTimeout(() => navigate("/music"), 1500);
    } catch (err) {
      console.error("Text analysis error:", err);
      showToast(err.message || "Text analysis failed", "error");
    }
    setLoading(false);
  };

  const textPrompts = [
    "I feel calm and focused today.",
    "I am stressed about deadlines.",
    "I feel lonely and unmotivated right now.",
  ];

  useEffect(() => {
    return () => {
      stopVoiceCapture();
      stopVoiceTranscript();
      stopCamera();
    };
  }, []);

  return (
    <AppShell>
      <SEO title="Detect Your Mood" description="Use AI-powered face, voice, or text analysis to detect your current emotional state." />
      
      {/* Skip to content for accessibility (#23) */}
      <a href="#mood-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg">
        Skip to mood detection
      </a>
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

      <div id="mood-content" className="relative z-10 pt-14 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" role="main" aria-label="Mood detection">
        {/* Header with Back Button and Options Menu */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-100 transition-all group"
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-slate-100">
              Mood Assessment
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto"
          >
            Choose a detection method and get a fast, guided mood result.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {workflowSteps.map((step) => (
              <div key={step.id} className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 md:px-4 md:py-3">
                <p className="text-[10px] md:text-xs uppercase tracking-wider text-slate-400">Step {step.id}</p>
                <p className="text-xs md:text-sm font-semibold text-slate-100">{step.title}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* MODE SELECT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 max-w-6xl mx-auto"
          role="tablist"
          aria-label="Detection method"
        >
          {modeOptions.map((m, index) => (
            <motion.button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              aria-controls={`${m.id}-panel`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => setMode(m.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`relative text-left px-4 py-3 rounded-xl transition-all duration-200 overflow-hidden border ${
                mode === m.id
                  ? "bg-primary-700/20 text-white border-primary-500/60 shadow-lg shadow-primary-700/20"
                  : "bg-slate-900 text-slate-200 hover:bg-slate-800 border-slate-700"
              }`}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-700/15 -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative flex items-center gap-2 mb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-950/50 border border-slate-600/60 text-slate-200">
                  {getModeIcon(m.id)}
                </span>
                <span className="font-semibold text-sm md:text-base">{m.label}</span>
              </span>
              <p className={`relative text-xs ${mode === m.id ? "text-slate-100" : "text-slate-400"}`}>{m.short}</p>
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-6xl mx-auto mb-12 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-5"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Current Method</p>
              <h3 className="text-lg font-semibold text-slate-100">{activeMode.label}</h3>
              <p className="text-sm text-slate-300">{activeMode.hint}</p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-2">
              Tip: Best results come from one clear input at a time.
            </div>
          </div>
        </motion.div>

        {/* CAMERA MODE */}
        {mode === "camera" && (
          <motion.div
            id="camera-panel"
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

              <div className="mb-6 flex flex-wrap gap-2 justify-center text-xs">
                <span className={`px-3 py-1 rounded-full border ${cameraReady ? "border-emerald-400/40 text-emerald-300" : "border-slate-600 text-slate-400"}`}>
                  {cameraReady ? "Camera Ready" : "Camera Off"}
                </span>
                <span className={`px-3 py-1 rounded-full border ${loading ? "border-violet-400/40 text-violet-300" : "border-slate-600 text-slate-400"}`}>
                  {loading ? "Analyzing" : "Waiting"}
                </span>
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
                  disabled={loading || !cameraReady}
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
            id="voice-panel"
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
                Record audio to use the voice model directly, or use speech-to-text fallback
              </p>

              <div className="mb-6 flex items-center justify-center gap-2 text-xs text-slate-300">
                <span className={`px-3 py-1 rounded-full border ${voiceAudioBase64 ? "border-emerald-400/50 text-emerald-300" : "border-slate-600"}`}>
                  {voiceAudioBase64 ? "Audio Ready" : "No Recording"}
                </span>
                <span className={`px-3 py-1 rounded-full border ${isRecording ? "border-rose-400/60 text-rose-300" : "border-slate-600"}`}>
                  {isRecording ? "Recording" : "Idle"}
                </span>
              </div>
              
              {text && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl backdrop-blur-sm"
                >
                  <p className="text-amber-300 italic text-lg">"{text}"</p>
                </motion.div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isRecording ? stopVoiceCapture : startVoiceRecording}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-rose-600 to-orange-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-rose-500/35 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isRecording ? "Stop Recording" : "Record with Mic"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={analyzeRecordedVoice}
                  disabled={loading || !voiceAudioBase64}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/35 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L4.5 12l5.25-5M14.25 7l5.25 5-5.25 5" />
                  </svg>
                  Analyze Voice
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startVoice}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-violet-500/35 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Speech to Text
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TEXT MODE */}
        {mode === "text" && (
          <motion.div
            id="text-panel"
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
                  Describe your current state in your own words for text-based mood analysis
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
                  aria-label="Express your feelings"
                  className="w-full p-6 md:p-8 rounded-2xl bg-slate-950/80 border-2 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all min-h-[240px] text-base md:text-lg resize-none"
                  placeholder="Share your thoughts and feelings here...\n\nFor example:\n• 'I feel overwhelmed with all the work I have to do today'\n• 'I'm so excited about my upcoming vacation!'\n• 'Feeling peaceful after a good meditation session'"
                />
              </motion.div>

              <div className="mt-4 flex flex-wrap gap-2">
                {textPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setText(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Use: {prompt}
                  </button>
                ))}
              </div>
              
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

        {/* CHAT MODE */}
        {mode === "chat" && (
          <motion.div
            id="chat-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-block mb-4">
                <div className="px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full backdrop-blur-sm">
                  <span className="text-violet-400 font-semibold text-xs tracking-widest uppercase">Guided Conversation</span>
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-100 tracking-tight">
                Guided Mood Interview
              </h2>
              <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Respond to a short set of structured prompts to estimate your current mood from conversation context
              </p>
            </motion.div>
            <MoodChatDetect
              onMoodDetected={(detectedMood) => {
                localStorage.setItem("detected_mood", detectedMood);
                saveMood(detectedMood);
                showToast(`Mood detected: ${detectedMood}`, "success");
                setTimeout(() => navigate("/music"), 1800);
              }}
            />
          </motion.div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            role="alert"
            aria-live="assertive"
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
