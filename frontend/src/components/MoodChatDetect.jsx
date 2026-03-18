import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sanitizeText } from "../utils/sanitize";
import { detectText } from "../api/flask";

// ─── Mood inference engine ───────────────────────────────────────────────────
const MOOD_KEYWORDS = {
  Happy:   ["happy", "great", "good", "wonderful", "fantastic", "amazing", "joyful", "cheerful", "glad", "content", "blessed", "loving it"],
  Excited: ["excited", "pumped", "thrilled", "hyped", "can't wait", "awesome", "stoked", "energized", "wow", "incredible"],
  Calm:    ["calm", "relaxed", "peaceful", "chill", "serene", "fine", "okay", "alright", "settled", "quiet", "easy"],
  Neutral: ["neutral", "meh", "normal", "average", "nothing special", "usual", "whatever", "so so", "not much"],
  Stressed:["stressed", "overwhelmed", "pressure", "deadline", "busy", "so much to do", "can't keep up", "swamped", "chaos"],
  Anxious: ["anxious", "worried", "nervous", "uneasy", "tense", "fear", "scared", "panicking", "overthinking", "what if"],
  Sad:     ["sad", "unhappy", "down", "depressed", "miserable", "crying", "heartbroken", "gloomy", "blue", "low", "miss"],
  Angry:   ["angry", "annoyed", "frustrated", "mad", "furious", "irritated", "rage", "upset", "bothered", "fed up"],
  Lonely:  ["lonely", "alone", "isolated", "no one", "nobody", "left out", "empty", "abandoned", "disconnected"],
  Tired:   ["tired", "exhausted", "sleepy", "drained", "worn out", "no energy", "fatigue", "sluggish", "burnt out"],
};

function inferMood(answers) {
  const combined = answers.join(" ").toLowerCase();
  const scores = {};

  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    scores[mood] = 0;
    for (const kw of keywords) {
      // Count occurrences
      const regex = new RegExp(kw, "gi");
      const matches = combined.match(regex);
      if (matches) scores[mood] += matches.length;
    }
  }

  // Positive / negative sentiment boost
  const positiveWords = ["good", "great", "well", "fine", "okay", "yes", "yeah", "yep"];
  const negativeWords = ["not", "no", "nope", "bad", "terrible", "awful", "never", "worse"];
  const positiveCount = positiveWords.reduce((n, w) => n + (combined.match(new RegExp(`\\b${w}\\b`, "gi")) || []).length, 0);
  const negativeCount = negativeWords.reduce((n, w) => n + (combined.match(new RegExp(`\\b${w}\\b`, "gi")) || []).length, 0);

  if (positiveCount > negativeCount) {
    scores.Happy = (scores.Happy || 0) + positiveCount;
    scores.Calm  = (scores.Calm  || 0) + positiveCount * 0.5;
  } else if (negativeCount > positiveCount) {
    scores.Sad    = (scores.Sad    || 0) + negativeCount;
    scores.Stressed = (scores.Stressed || 0) + negativeCount * 0.5;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore  = sorted[0][1];
  const totalHits = Object.values(scores).reduce((a, b) => a + b, 0);

  const detectedMood = topScore > 0 ? sorted[0][0] : "Neutral";

  // Confidence: proportion of hits for top mood vs total, scaled to 55-95%
  let confidence = 70;
  if (totalHits > 0) {
    confidence = Math.round(55 + (topScore / totalHits) * 40);
    confidence = Math.min(95, Math.max(55, confidence));
  }

  return { mood: detectedMood, confidence };
}

// ─── Static content per mood ─────────────────────────────────────────────────
const MOOD_CONTENT = {
  Happy:    { supportMsg: "Your responses indicate a positive emotional state.", suggestion: "Choose an upbeat playlist to maintain momentum." },
  Excited:  { supportMsg: "You appear to be in a high-energy emotional state.", suggestion: "Use focused, high-tempo tracks to channel this energy productively." },
  Calm:     { supportMsg: "Your responses suggest emotional stability and low tension.", suggestion: "Keep a low-distraction ambient playlist for sustained focus." },
  Neutral:  { supportMsg: "Your current state appears balanced and neutral.", suggestion: "A light instrumental playlist may help improve focus and mood." },
  Stressed: { supportMsg: "Your responses indicate elevated stress.", suggestion: "Try a short breathing exercise, then transition to a calming playlist." },
  Anxious:  { supportMsg: "Your input suggests symptoms of anxiety and cognitive load.", suggestion: "Use slow-paced audio and reduce parallel tasks for the next 10 to 15 minutes." },
  Sad:      { supportMsg: "Your responses reflect a lower mood state.", suggestion: "Consider journaling briefly and selecting supportive, low-intensity audio." },
  Angry:    { supportMsg: "Your input indicates a heightened frustration response.", suggestion: "Pause and use a short reset routine before continuing demanding tasks." },
  Lonely:   { supportMsg: "Your responses indicate social disconnection.", suggestion: "Plan one small social check-in and use calming background audio." },
  Tired:    { supportMsg: "Your input indicates low mental and physical energy.", suggestion: "Prioritize recovery and reduce cognitively heavy work where possible." },
};

// ─── Adaptive conversation engine ────────────────────────────────────────────
const GREETING = "Welcome. I can help assess your current emotional state through a short guided conversation. How has your day been so far?";

function getFollowUp(stepIndex, userMsg) {
  const lower = userMsg.toLowerCase();

  if (stepIndex === 1) {
    // After the user describes their day
    if (/boring|dull|meh|nothing/.test(lower))
      return "Understood. How would you describe your current energy level: stable, low, or elevated?";
    if (/bad|terrible|awful|worst|horrible/.test(lower))
      return "Thank you for sharing that. What is the main factor contributing to that experience today?";
    if (/good|great|amazing|wonderful|fantastic/.test(lower))
      return "Good to hear. What contributed most to that positive experience?";
    if (/stress|busy|overwhelm|deadline|pressure/.test(lower))
      return "That sounds demanding. What has been the primary source of pressure today?";
    if (/tired|exhausted|sleepy|drained/.test(lower))
      return "Noted. Is this mainly mental fatigue, physical fatigue, or both?";
    return "Thanks for sharing. How are your energy levels right now?";
  }

  if (stepIndex === 2) {
    // After the user describes energy / feelings
    if (/sleep|nap|rest|bed/.test(lower))
      return "Understood. Do you expect to rest soon, or do you still have additional commitments?";
    if (/fine|okay|alright|normal/.test(lower))
      return "Understood. Is there any specific concern on your mind right now?";
    if (/drained|low|no energy|exhausted/.test(lower))
      return "Noted. Has anything specific been weighing on your mind today?";
    if (/good|energized|pumped|great/.test(lower))
      return "Good energy level. Is there a specific reason behind it today?";
    if (/anxious|worried|nervous|stress/.test(lower))
      return "When this happens, is it linked to a specific issue or a general pattern?";
    return "Has anything in particular been occupying your thoughts?";
  }

  if (stepIndex === 3) {
    // After user shares thoughts / what's on their mind
    if (/nothing|nah|not really|no|nope/.test(lower))
      return "Understood. Thank you for the input. I will now analyze your current mood.";
    if (/yes|yeah|lot|much|many/.test(lower))
      return "Thank you for sharing. I will now analyze your current mood.";
    return "Thank you for the details. I will now analyze your current mood.";
  }

  return "Thank you. I will now analyze your current mood.";
}

const STEP_PLACEHOLDERS = [
  "Tell me about your day…",
  "Share how you're feeling…",
  "What's been on your mind…",
  "Anything else you'd like to share…",
];
const TOTAL_STEPS = 4;

// ─── Component ───────────────────────────────────────────────────────────────
export default function MoodChatDetect({ onMoodDetected }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Start conversation
  useEffect(() => {
    setTyping(true);
    const timer = setTimeout(() => {
      setMessages([{ role: "ai", text: GREETING }]);
      setTyping(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, result]);

  const sendMessage = () => {
    const clean = sanitizeText(input.trim());
    if (!clean) return;

    const newAnswers = [...answers, clean];
    const newMessages = [
      ...messages,
      { role: "user", text: clean },
    ];

    setInput("");
    setAnswers(newAnswers);

    const nextStep = step + 1;

    if (nextStep < TOTAL_STEPS) {
      // More questions — generate adaptive follow-up
      setMessages(newMessages);
      setStep(nextStep);
      setTyping(true);
      const followUp = getFollowUp(nextStep, clean);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "ai", text: followUp }]);
        setTyping(false);
        inputRef.current?.focus();
      }, 900);
    } else {
      // All questions asked — infer mood
      const finalMsg = getFollowUp(TOTAL_STEPS, clean);
      setMessages([...newMessages, { role: "ai", text: finalMsg }]);
      setTyping(true);
      setTimeout(async () => {
        const mergedText = newAnswers.join(" ").trim();
        let mood;
        let confidence;
        let source;

        try {
          const apiResult = await detectText({ text: mergedText });
          if (apiResult?.mood) {
            mood = apiResult.mood;
            confidence = Math.round(Math.max(0, Math.min(1, Number(apiResult.confidence ?? 0.65))) * 100);
            source = apiResult.source || "ml";
          }
        } catch (err) {
          console.warn("[MoodChatDetect] ML detect-text unavailable, using local inference", err?.message || err);
        }

        if (!mood) {
          const local = inferMood(newAnswers);
          mood = local.mood;
          confidence = local.confidence;
          source = "local_fallback";
        }

        setTyping(false);
        setResult({ mood, confidence, source });
        if (onMoodDetected) onMoodDetected(mood);
      }, 1600);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const restart = () => {
    setMessages([]);
    setStep(0);
    setInput("");
    setAnswers([]);
    setResult(null);
    setTyping(true);
    setTimeout(() => {
      setMessages([{ role: "ai", text: GREETING }]);
      setTyping(false);
    }, 400);
  };

  const currentPlaceholder = result ? "Mood detected!" : (STEP_PLACEHOLDERS[step] ?? "Type your response…");
  const content = result ? MOOD_CONTENT[result.mood] ?? MOOD_CONTENT.Neutral : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Chat window */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-slate-300">Mood Support Assistant</span>
          <span className="ml-auto text-xs text-slate-500">Guided Assessment</span>
        </div>

        {/* Messages */}
        <div className="px-4 py-5 space-y-4 min-h-[320px] max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mr-2 shrink-0 mt-0.5 shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm"
                      : "bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/30"
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/30 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 rounded-full bg-violet-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!result && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 flex gap-3 items-end">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentPlaceholder}
              disabled={typing}
              className="flex-1 bg-slate-800/70 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={typing || !input.trim()}
              className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>

      {/* Progress dots */}
      {!result && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < step ? "bg-violet-500" : i === step ? "bg-violet-400 scale-125" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      )}

      {/* Result card */}
      <AnimatePresence>
        {result && content && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
            className="bg-slate-900/70 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-6 shadow-2xl shadow-violet-500/10"
          >
            {/* Mood + Confidence */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-0.5">Detected Mood</p>
                  <p className="text-2xl font-black text-white">{result.mood}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Source: {result.source || "unknown"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Confidence</p>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9155" fill="none"
                      stroke="url(#confGrad)" strokeWidth="3"
                      strokeDasharray={`${result.confidence} ${100 - result.confidence}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-300">{result.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-5" />

            {/* Support message */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-2">Support Message</p>
              <p className="text-slate-300 text-sm leading-relaxed">{content.supportMsg}</p>
            </div>

            {/* Suggestion */}
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 mb-5">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-1">Suggestion</p>
              <p className="text-slate-300 text-sm">{content.suggestion}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMoodDetected && onMoodDetected(result.mood)}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-shadow"
              >
                Get Music Recommendations →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={restart}
                className="px-4 py-3 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-700/80 transition-colors"
              >
                Restart
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
