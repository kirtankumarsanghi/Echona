import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../api/axiosInstance";

function MusicIntelligencePanel({ currentMood, onPlaySong, currentlyPlaying }) {
  const [transition, setTransition] = useState(null);
  const [rescueMix, setRescueMix] = useState(null);
  const [weeklyImpact, setWeeklyImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("Healing Room");
  const [room, setRoom] = useState(null);
  const [message, setMessage] = useState("");

  const [lastPlayEventId, setLastPlayEventId] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [savingControls, setSavingControls] = useState(false);
  const [recControls, setRecControls] = useState({
    diversityTarget: 70,
    dedupeArtist: true,
    dedupeGenre: true,
  });

  useEffect(() => {
    fetchWeeklyImpact();
    fetchRecommendationControls();
    autoJoinRoomFromLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentlyPlaying) return;
    logPlay(currentlyPlaying);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentlyPlaying?.youtubeId]);

  const fetchWeeklyImpact = async () => {
    try {
      const { data } = await axiosInstance.get("/api/music-intel/impact/weekly");
      if (data?.success) setWeeklyImpact(data.report);
    } catch {
      // keep silent; panel should still work
    }
  };

  const apiError = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;

  const fetchRecommendationControls = async () => {
    try {
      const { data } = await axiosInstance.get("/api/music-intel/recommendation-controls");
      if (data?.success && data?.controls) {
        setRecControls(data.controls);
      }
    } catch {
      // keep defaults if request fails
    }
  };

  const saveRecommendationControls = async () => {
    try {
      setSavingControls(true);
      const { data } = await axiosInstance.put("/api/music-intel/recommendation-controls", recControls);
      if (data?.success && data?.controls) {
        setRecControls(data.controls);
        setFeedbackStatus("Recommendation controls saved");
      }
    } catch (err) {
      setError(apiError(err, "Could not save recommendation controls"));
    } finally {
      setSavingControls(false);
    }
  };

  const autoJoinRoomFromLink = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = (params.get("room") || "").trim().toUpperCase();
      if (!code) return;
      setRoomCode(code);
      const { data } = await axiosInstance.post("/api/music-intel/rooms/join", { code });
      if (data?.success) {
        setRoom(data.room);
        setInviteStatus(`Joined room ${code} from invite link`);
      }
    } catch {
      // ignore auto-join errors and keep manual join available
    }
  };

  const generateTransition = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosInstance.get("/api/music-intel/transition", {
        params: {
          fromMood: currentMood || "Neutral",
          diversityTarget: recControls.diversityTarget,
          dedupeArtist: recControls.dedupeArtist,
          dedupeGenre: recControls.dedupeGenre,
        },
      });
      if (data?.success) setTransition(data);
    } catch (err) {
      setError(apiError(err, "Failed to generate transition playlist"));
    } finally {
      setLoading(false);
    }
  };

  const generateRescueMix = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosInstance.post("/api/music-intel/rescue", {
        mood: currentMood || "Stressed",
        diversityTarget: recControls.diversityTarget,
        dedupeArtist: recControls.dedupeArtist,
        dedupeGenre: recControls.dedupeGenre,
      });
      if (data?.success) setRescueMix(data);
    } catch (err) {
      setError(apiError(err, "Failed to generate rescue mix"));
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    try {
      const { data } = await axiosInstance.post("/api/music-intel/rooms/create", { name: roomName });
      if (data?.success) {
        setRoom(data.room);
        setRoomCode(data.room?.code || "");
      }
    } catch (err) {
      setError(apiError(err, "Failed to create room"));
    }
  };

  const joinRoom = async () => {
    try {
      const { data } = await axiosInstance.post("/api/music-intel/rooms/join", { code: roomCode });
      if (data?.success) setRoom(data.room);
    } catch (err) {
      setError(apiError(err, "Failed to join room"));
    }
  };

  const sendMessage = async () => {
    if (!room?.code || !message.trim()) return;
    try {
      const { data } = await axiosInstance.post(`/api/music-intel/rooms/${room.code}/message`, {
        text: message.trim(),
      });
      if (data?.success) {
        setRoom(data.room);
        setMessage("");
      }
    } catch (err) {
      setError(apiError(err, "Failed to send room message"));
    }
  };

  const copyInviteLink = async () => {
    if (!room?.inviteLink) return;
    try {
      await navigator.clipboard.writeText(room.inviteLink);
      setInviteStatus("Invite link copied");
    } catch {
      setInviteStatus("Copy failed. You can still share the link manually.");
    }
  };

  const logPlay = async (song) => {
    try {
      setFeedbackStatus("");
      const { data } = await axiosInstance.post("/api/music-intel/impact/log-play", {
        title: song.title,
        artist: song.artist,
        genre: song.genre || song.language || "unknown",
        moodBefore: currentMood || "Neutral",
      });
      if (data?.success) setLastPlayEventId(data.eventId);
    } catch {
      // non-blocking
    }
  };

  const sendFeedback = async (feedback) => {
    if (!lastPlayEventId) return;
    try {
      await axiosInstance.post("/api/music-intel/impact/feedback", {
        eventId: lastPlayEventId,
        feedback,
      });
      setFeedbackStatus(`Saved: ${feedback}`);
      fetchWeeklyImpact();
    } catch {
      setFeedbackStatus("Could not save feedback");
    }
  };

  return (
    <section className="space-y-4 mb-6" aria-label="Music intelligence features">
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="xl:col-span-2 bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-200">Recommendation Controls</h4>
            <button onClick={saveRecommendationControls} disabled={savingControls} className="btn-secondary text-xs">
              {savingControls ? "Saving..." : "Save Controls"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-3">
              <p className="text-[11px] text-neutral-400 mb-1">Diversity Target: {recControls.diversityTarget}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={recControls.diversityTarget}
                onChange={(e) => setRecControls((prev) => ({ ...prev, diversityTarget: Number(e.target.value) }))}
                className="w-full"
              />
            </label>

            <label className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-300">Artist Dedupe</span>
              <input
                type="checkbox"
                checked={recControls.dedupeArtist}
                onChange={(e) => setRecControls((prev) => ({ ...prev, dedupeArtist: e.target.checked }))}
              />
            </label>

            <label className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-3 flex items-center justify-between gap-2">
              <span className="text-[11px] text-neutral-300">Genre Dedupe</span>
              <input
                type="checkbox"
                checked={recControls.dedupeGenre}
                onChange={(e) => setRecControls((prev) => ({ ...prev, dedupeGenre: e.target.checked }))}
              />
            </label>
          </div>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-200">Mood Transition Playlists</h4>
            <button onClick={generateTransition} disabled={loading} className="btn-secondary text-xs">
              {loading ? "Generating..." : "Generate 3-Stage Flow"}
            </button>
          </div>

          {transition?.stages ? (
            <div className="space-y-3">
              {transition.stages.map((stage) => (
                <div key={stage.stage} className="rounded-xl border border-neutral-700/60 bg-neutral-900/60 p-3">
                  <p className="text-xs uppercase tracking-wider text-indigo-300 mb-2">Stage {stage.stage}: {stage.title} ({stage.mood})</p>
                  <p className="text-[11px] text-neutral-500 mb-2">Diversity Score: {stage.diversityScore ?? 0}</p>
                  <div className="space-y-1.5">
                    {stage.tracks.map((track) => (
                      <button
                        key={`${stage.stage}-${track.youtubeId}`}
                        onClick={() => onPlaySong(track)}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-800/80 transition-colors"
                      >
                        <p className="text-sm text-neutral-200 truncate">{track.title}</p>
                        <p className="text-[11px] text-neutral-500 truncate">{track.artist}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Generates a flow like anxious to calm to focused using ML-guided stage progression and anti-repeat picks.</p>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-neutral-200">Rescue Mix</h4>
            <button onClick={generateRescueMix} disabled={loading} className="btn-primary text-xs">
              One-Click Rescue
            </button>
          </div>

          {rescueMix?.tracks ? (
            <div>
              <p className="text-xs text-neutral-400 mb-2">Profile: tempo {rescueMix.profile?.tempo} • valence {rescueMix.profile?.valence}</p>
              <p className="text-[11px] text-neutral-500 mb-2">Diversity Score: {rescueMix.diversityScore ?? 0}</p>
              <div className="space-y-1.5">
                {rescueMix.tracks.map((track) => (
                  <button
                    key={`rescue-${track.youtubeId}`}
                    onClick={() => onPlaySong(track)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-800/80 transition-colors"
                  >
                    <p className="text-sm text-neutral-200 truncate">{track.title}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{track.artist}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500">Emergency low-friction set with low-arousal defaults for stressed moments.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-neutral-200 mb-3">Collaborative Healing Rooms</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100"
            />
            <button onClick={createRoom} className="btn-secondary text-xs">Create Private Room</button>
            <input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100"
            />
            <button onClick={joinRoom} className="btn-secondary text-xs">Join Room</button>
          </div>

          {room && (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900/70 p-3">
              <p className="text-xs text-neutral-400 mb-2">Code: <span className="text-neutral-200 font-semibold">{room.code}</span> • {room.participants.length} members</p>
              <div className="flex gap-2 mb-2">
                <input
                  value={room.inviteLink || ""}
                  readOnly
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-[11px] text-neutral-300"
                />
                <button onClick={copyInviteLink} className="btn-secondary text-xs">Copy Invite</button>
              </div>
              {inviteStatus && <p className="text-[11px] text-neutral-500 mb-2">{inviteStatus}</p>}
              <div className="h-32 overflow-y-auto space-y-1 mb-2">
                {room.messages.map((msg) => (
                  <div key={msg.id} className="text-xs px-2 py-1 rounded bg-neutral-800/80 text-neutral-300">
                    <span className="text-neutral-500">{msg.sender}: </span>{msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send support message"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-100"
                />
                <button onClick={sendMessage} className="btn-secondary text-xs">Send</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4">
          <h4 className="text-sm font-semibold text-neutral-200 mb-3">Weekly Music Impact Report</h4>
          {weeklyImpact ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2">
                  <p className="text-[10px] text-neutral-500">Avg Mood Lift</p>
                  <p className="text-sm font-semibold text-emerald-300">{weeklyImpact.avgMoodLift}</p>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2">
                  <p className="text-[10px] text-neutral-500">Feedback Samples</p>
                  <p className="text-sm font-semibold text-neutral-100">{weeklyImpact.samples}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Leaderboard title="Top Genres" rows={weeklyImpact.topGenres} keyField="genre" />
                <Leaderboard title="Top Artists" rows={weeklyImpact.topArtists} keyField="artist" />
                <Leaderboard title="Best Hours" rows={weeklyImpact.bestHours} keyField="hour" format={(v) => `${String(v).padStart(2, "0")}:00`} />
              </div>

              {currentlyPlaying && (
                <div className="mt-3 rounded-lg border border-neutral-700 bg-neutral-900/70 p-2">
                  <p className="text-[11px] text-neutral-400 mb-2">Did this track help your mood?</p>
                  <div className="flex gap-2">
                    <button onClick={() => sendFeedback("better")} className="px-2 py-1 rounded-md text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Better</button>
                    <button onClick={() => sendFeedback("same")} className="px-2 py-1 rounded-md text-[11px] bg-slate-500/15 text-slate-300 border border-slate-500/30">Same</button>
                    <button onClick={() => sendFeedback("worse")} className="px-2 py-1 rounded-md text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30">Worse</button>
                    {feedbackStatus && <span className="text-[11px] text-neutral-400 self-center">{feedbackStatus}</span>}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-neutral-500">Play tracks and submit quick feedback to unlock impact analytics.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Leaderboard({ title, rows, keyField, format }) {
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/70 p-2">
      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">{title}</p>
      {rows?.length ? rows.slice(0, 3).map((row) => (
        <div key={`${title}-${row[keyField]}`} className="flex items-center justify-between text-xs py-0.5">
          <span className="text-neutral-300 truncate max-w-[65%]">{format ? format(row[keyField]) : row[keyField]}</span>
          <span className={row.avgDelta >= 0 ? "text-emerald-300" : "text-rose-300"}>{row.avgDelta.toFixed(2)}</span>
        </div>
      )) : <p className="text-[11px] text-neutral-500">Not enough data</p>}
    </div>
  );
}

export default MusicIntelligencePanel;
