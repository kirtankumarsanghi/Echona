import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

function SurpriseMe() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [surpriseData, setSurpriseData] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleSurpriseMe = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo({ status: 'Starting...', timestamp: new Date().toLocaleTimeString() });
    
    try {
      // 🎭 PHASE 4: Get detected emotion from localStorage
      const detectedEmotion = localStorage.getItem('detected_mood');
      console.log('[SurpriseMe] Detected emotion from localStorage:', detectedEmotion);
      
      setDebugInfo({ 
        status: 'Emotion check', 
        emotion: detectedEmotion || 'None',
        phase: detectedEmotion ? 'Phase 4 (Emotion + Context)' : 'Phase 3 (Context Only)',
        timestamp: new Date().toLocaleTimeString()
      });
      
      let response;
      
      if (detectedEmotion) {
        // POST with emotion (Phase 4: Emotion + Context)
        console.log('🎭 Phase 4: Using detected emotion:', detectedEmotion);
        console.log('[SurpriseMe] Sending POST to /api/surprise with body:', { mlEmotion: detectedEmotion });
        
        setDebugInfo(prev => ({ ...prev, status: 'Sending POST request...', method: 'POST', endpoint: '/api/surprise' }));
        
        response = await axiosInstance.post("/api/surprise", {
          mlEmotion: detectedEmotion
        });
        
        console.log('[SurpriseMe] Phase 4 Response:', response.data);
      } else {
        // GET without emotion (Phase 3: Context only)
        console.log('🌍 Phase 3: Using context only (no emotion detected)');
        console.log('[SurpriseMe] Sending GET to /api/surprise');
        
        setDebugInfo(prev => ({ ...prev, status: 'Sending GET request...', method: 'GET', endpoint: '/api/surprise' }));
        
        response = await axiosInstance.get("/api/surprise");
        
        console.log('[SurpriseMe] Phase 3 Response:', response.data);
      }
      
      console.log('[SurpriseMe] Response status:', response.status);
      console.log('[SurpriseMe] Response data:', response.data);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        status: 'Response received', 
        responseStatus: response.status,
        success: response.data?.success,
        mood: response.data?.context?.moodUsed,
        song: response.data?.track?.title
      }));
      
      if (response.data && response.data.success) {
        console.log('[SurpriseMe] Success! Setting surprise data...');
        setSurpriseData(response.data);
        setShowResult(true);
        setDebugInfo(null); // Clear debug on success
        
        // Auto-play the song
        if (response.data.track?.youtubeId) {
          console.log('[SurpriseMe] Opening YouTube:', response.data.track.youtubeId);
          window.open(`https://www.youtube.com/watch?v=${response.data.track.youtubeId}`, '_blank');
        }
      } else {
        console.error('[SurpriseMe] Failed - response.data.success is false');
        setError("Failed to get surprise recommendation");
        setDebugInfo(prev => ({ ...prev, status: 'Failed', error: 'success=false' }));
      }
    } catch (err) {
      console.error("[SurpriseMe] Error caught:", err);
      console.error("[SurpriseMe] Error details:", {
        message: err.message,
        response: err.response,
        request: err.request
      });
      setError(`Unable to connect: ${err.message || 'Network error'}`);
      setDebugInfo(prev => ({ 
        ...prev, 
        status: 'Error', 
        error: err.message,
        responseStatus: err.response?.status,
        responseData: err.response?.data
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setSurpriseData(null);
  };

  const getContextText = (context) => {
    if (!context) return "";
    
    const { time, weather } = context;
    let text = "";
    
    if (time === "morning") text = "MORNING";
    else if (time === "afternoon") text = "AFTERNOON";
    else if (time === "evening") text = "EVENING";
    else if (time === "night") text = "NIGHT";
    
    if (weather === "rainy") text += " • RAINY";
    else if (weather === "sunny") text += " • SUNNY";
    else if (weather === "cloudy") text += " • CLOUDY";
    else if (weather === "stormy") text += " • STORMY";
    else if (weather === "snowy") text += " • SNOWY";
    else if (weather === "mist" || weather === "haze") text += " • MISTY";
    else if (weather === "clear") text += " • CLEAR";
    
    return text;
  };

  const getEmotionText = (mlEmotion) => {
    if (!mlEmotion) return null;
    return mlEmotion.toUpperCase();
  };

  const getMoodColor = (mood) => {
    const colors = {
      Happy: "from-amber-500 to-yellow-500",
      Calm: "from-teal-500 to-emerald-500",
      Excited: "from-orange-500 to-rose-500",
      Sad: "from-blue-500 to-indigo-500",
      Angry: "from-rose-600 to-red-600",
      Anxious: "from-purple-500 to-pink-500"
    };
    return colors[mood] || "from-gray-500 to-gray-700";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 p-8 rounded-2xl shadow-2xl mt-10 max-w-4xl mx-auto text-center"
      >
        <div className="inline-block px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
          <span className="text-white font-bold text-xs tracking-wider">INTELLIGENT RECOMMENDATION</span>
        </div>
        
        <h3 className="text-3xl font-bold text-neutral-100 mb-3">Context-Aware Music</h3>
        <p className="text-neutral-400 mb-6 max-w-2xl mx-auto">
          {localStorage.getItem('detected_mood') 
            ? "🎭 Using your detected emotion + current environment (time & weather) to recommend the perfect song."
            : "🌍 Analyzing your current environment (time of day & weather) to recommend the perfect song for this moment."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          {localStorage.getItem('detected_mood') && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/40 backdrop-blur-sm rounded-lg border border-purple-500/40">
              <span className="text-purple-300 font-bold text-sm">🎭 YOUR EMOTION</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-neutral-600/30">
            <span className="text-neutral-300 font-bold text-sm">TIME</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-neutral-600/30">
            <span className="text-neutral-300 font-bold text-sm">WEATHER</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-800/60 backdrop-blur-sm rounded-lg border border-neutral-600/30">
            <span className="text-neutral-300 font-bold text-sm">MOOD</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-rose-900/30 backdrop-blur-sm border border-rose-500/40 rounded-lg">
            <p className="text-rose-300 font-semibold">{error}</p>
          </div>
        )}

        {/* Debug Info Panel */}
        {debugInfo && (
          <div className="mb-4 p-4 bg-blue-900/30 backdrop-blur-sm border border-blue-500/40 rounded-lg text-left text-sm font-mono">
            <div className="font-bold text-blue-300 mb-2">🔍 Debug Info:</div>
            <div className="space-y-1 text-neutral-300">
              <div><strong>Status:</strong> {debugInfo.status}</div>
              {debugInfo.emotion !== undefined && <div><strong>Emotion:</strong> {debugInfo.emotion}</div>}
              {debugInfo.phase && <div><strong>Phase:</strong> {debugInfo.phase}</div>}
              {debugInfo.method && <div><strong>Method:</strong> {debugInfo.method}</div>}
              {debugInfo.endpoint && <div><strong>Endpoint:</strong> {debugInfo.endpoint}</div>}
              {debugInfo.responseStatus && <div><strong>Response Status:</strong> {debugInfo.responseStatus}</div>}
              {debugInfo.success !== undefined && <div><strong>Success:</strong> {debugInfo.success ? '✅ Yes' : '❌ No'}</div>}
              {debugInfo.mood && <div><strong>Mood Used:</strong> {debugInfo.mood}</div>}
              {debugInfo.song && <div><strong>Song:</strong> {debugInfo.song}</div>}
              {debugInfo.error && <div className="text-red-400"><strong>Error:</strong> {debugInfo.error}</div>}
              <div className="text-neutral-500 text-xs mt-2 pt-2 border-t border-neutral-700">{debugInfo.timestamp}</div>
            </div>
          </div>
        )}
        
        <motion.button
          onClick={handleSurpriseMe}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
          className={`px-10 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl ${
            isLoading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-3 justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              ANALYZING CONTEXT...
            </span>
          ) : (
            "SURPRISE ME"
          )}
        </motion.button>

        <p className="text-neutral-500 text-sm mt-4">
          No input required - Echona makes the choice for you
        </p>
      </motion.div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && surpriseData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeResult}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header with Context */}
              <div className={`bg-gradient-to-r ${getMoodColor(surpriseData.context.moodUsed)} p-6`}>
                <div className="text-white text-center">
                  <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                    <span className="text-xs font-bold tracking-wider">
                      {surpriseData.mlEmotion ? "🎭 EMOTION + CONTEXT AWARE" : "🌍 CONTEXT AWARE"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Perfect Match Found!</h3>
                  {surpriseData.mlEmotion && (
                    <p className="text-white/90 text-xs font-semibold mb-1">
                      Detected Emotion: {getEmotionText(surpriseData.mlEmotion)}
                    </p>
                  )}
                  <p className="text-white/90 text-sm font-semibold">
                    {getContextText(surpriseData.context)}
                  </p>
                </div>
              </div>

              {/* Song Details */}
              <div className="p-8 bg-neutral-900">
                <div className="text-center mb-6">
                  <div className={`inline-block px-4 py-2 bg-gradient-to-r ${getMoodColor(surpriseData.context.moodUsed)} rounded-full mb-4`}>
                    <span className="text-white font-bold text-sm">{surpriseData.context.moodUsed.toUpperCase()} MOOD</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-neutral-100 mb-2">
                    {surpriseData.track.title}
                  </h2>
                  <p className="text-neutral-400 text-lg">
                    {surpriseData.track.artist}
                  </p>
                  <span className="inline-block px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-neutral-300 text-sm font-semibold mt-3">
                    {surpriseData.track.genre}
                  </span>
                </div>

                {/* Context Explanation */}
                <div className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-neutral-100 mb-2">
                    {surpriseData.mlEmotion ? "🎭 Why This Song?" : "🌍 Why This Song?"}
                  </h4>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {surpriseData.mlEmotion && (
                      <span className="block font-semibold text-purple-400 mb-1">
                        Your {surpriseData.mlEmotion} emotion guided this choice. 
                      </span>
                    )}
                    {surpriseData.context.time === "morning" && "Morning energy calls for uplifting music to start your day right."}
                    {surpriseData.context.time === "afternoon" && "Afternoon vibes match well with this mood to keep you going."}
                    {surpriseData.context.time === "evening" && "Evening time is perfect for winding down with this selection."}
                    {surpriseData.context.time === "night" && "Late night atmosphere pairs beautifully with this track."}
                    {(surpriseData.context.weather === "rainy" || surpriseData.context.weather === "mist") && " Rainy weather enhances the calming effect of this music."}
                    {surpriseData.context.weather === "sunny" && " Sunny weather amplifies the positive energy of this song."}
                    {surpriseData.context.weather === "cloudy" && " Cloudy skies create the perfect backdrop for this mood."}
                    {surpriseData.context.weather === "stormy" && " Stormy weather matches the intensity of this selection."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.a
                    href={`https://www.youtube.com/watch?v=${surpriseData.track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                  >
                    PLAY NOW
                  </motion.a>
                  <motion.button
                    onClick={closeResult}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl font-bold hover:bg-neutral-700 transition-all"
                  >
                    CLOSE
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => {
                    closeResult();
                    setTimeout(() => handleSurpriseMe(), 300);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-3 py-3 border-2 border-teal-500/60 text-teal-400 rounded-xl font-bold hover:bg-teal-500/10 transition-all"
                >
                  TRY ANOTHER
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SurpriseMe;
