const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const crypto = require("crypto");
const config = require("../config");
const { authMiddleware } = require("../middleware/authMiddleware");
const mockMusic = require("../mockMusic");

const router = express.Router();

let User;
try {
  User = require("../models/User");
} catch {
  User = null;
}

let HealingRoom;
try {
  HealingRoom = require("../models/HealingRoom");
} catch {
  HealingRoom = null;
}

const roomStore = new Map();
const userMemory = new Map();

const STAGE_PATHS = {
  Anxious: ["Calm", "Calm", "Focused"],
  Stressed: ["Calm", "Neutral", "Focused"],
  Sad: ["Sad", "Calm", "Happy"],
  Angry: ["Angry", "Calm", "Focused"],
  Lonely: ["Calm", "Happy", "Connected"],
  Tired: ["Calm", "Neutral", "Focused"],
  Happy: ["Happy", "Excited", "Focused"],
  Excited: ["Excited", "Happy", "Focused"],
  Calm: ["Calm", "Calm", "Focused"],
  Neutral: ["Neutral", "Calm", "Focused"],
};

const STAGE_MOOD_ALIAS = {
  Focused: "Calm",
  Connected: "Happy",
};

function useMongo() {
  return Boolean(User) && mongoose.connection.readyState === 1;
}

function normalizeMood(mood) {
  const raw = String(mood || "Neutral").trim();
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function buildDefaultMusicData() {
  return {
    recommendationControls: {
      diversityTarget: 70,
      dedupeArtist: true,
      dedupeGenre: true,
    },
    recentRecommendations: [],
    playEvents: [],
  };
}

function normalizeRecommendationControls(raw = {}) {
  const diversityRaw = Number(raw.diversityTarget);
  const diversityTarget = Number.isFinite(diversityRaw)
    ? Math.max(0, Math.min(100, Math.round(diversityRaw)))
    : 70;

  return {
    diversityTarget,
    dedupeArtist: raw.dedupeArtist !== undefined ? Boolean(raw.dedupeArtist) : true,
    dedupeGenre: raw.dedupeGenre !== undefined ? Boolean(raw.dedupeGenre) : true,
  };
}

function parseBooleanParam(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function resolveRecommendationControls(data, overrides = {}) {
  const stored = normalizeRecommendationControls(data?.recommendationControls || {});
  const next = {
    diversityTarget:
      overrides.diversityTarget !== undefined ? Number(overrides.diversityTarget) : stored.diversityTarget,
    dedupeArtist:
      overrides.dedupeArtist !== undefined ? overrides.dedupeArtist : stored.dedupeArtist,
    dedupeGenre:
      overrides.dedupeGenre !== undefined ? overrides.dedupeGenre : stored.dedupeGenre,
  };
  return normalizeRecommendationControls(next);
}

async function getMusicData(userId) {
  if (useMongo()) {
    const user = await User.findById(userId).select("wellnessData");
    if (!user) return buildDefaultMusicData();
    return {
      ...buildDefaultMusicData(),
      ...(user.wellnessData?.musicData || {}),
      recommendationControls: normalizeRecommendationControls(user.wellnessData?.musicData?.recommendationControls || {}),
      recentRecommendations: user.wellnessData?.musicData?.recentRecommendations || [],
      playEvents: user.wellnessData?.musicData?.playEvents || [],
    };
  }

  return userMemory.get(userId) || buildDefaultMusicData();
}

async function saveMusicData(userId, musicData) {
  const safe = {
    recommendationControls: normalizeRecommendationControls(musicData.recommendationControls || {}),
    recentRecommendations: (musicData.recentRecommendations || []).slice(-200),
    playEvents: (musicData.playEvents || []).slice(-500),
  };

  if (useMongo()) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        "wellnessData.musicData": safe,
      },
    });
    return;
  }

  userMemory.set(userId, safe);
}

function getPoolForMood(mood) {
  const normalized = normalizeMood(mood);
  const mapped = STAGE_MOOD_ALIAS[normalized] || normalized;
  return mockMusic.filter((track) => normalizeMood(track.mood) === mapped);
}

function trackKey(track) {
  return `${String(track.title || "").toLowerCase()}::${String(track.artist || "").toLowerCase()}`;
}

function artistKey(track) {
  return String(track.artist || "unknown").trim().toLowerCase();
}

function genreKey(track) {
  return String(track.genre || "unknown").trim().toLowerCase();
}

function computeDiversityScore(tracks = []) {
  if (!tracks.length) return 0;
  const artists = new Set(tracks.map((t) => artistKey(t))).size;
  const genres = new Set(tracks.map((t) => genreKey(t))).size;
  const languages = new Set(tracks.map((t) => String(t.language || "unknown").toLowerCase())).size;
  const total = tracks.length;
  const score = ((artists / total) * 0.45 + (genres / total) * 0.35 + (languages / total) * 0.2) * 100;
  return Number(score.toFixed(1));
}

function pickDiverseTracks(pool, recentKeys, count, controls) {
  const fresh = pool.filter((track) => !recentKeys.has(trackKey(track)));
  const source = fresh.length >= count ? fresh : pool;

  const pickOnePass = () => {
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const selected = [];
    const seenArtists = new Set();
    const seenGenres = new Set();

    for (const track of shuffled) {
      if (selected.length >= count) break;

      const artist = artistKey(track);
      const genre = genreKey(track);

      if (controls.dedupeArtist && seenArtists.has(artist)) continue;
      if (controls.dedupeGenre && seenGenres.has(genre)) continue;

      selected.push(track);
      seenArtists.add(artist);
      seenGenres.add(genre);
    }

    if (selected.length < count) {
      for (const track of shuffled) {
        if (selected.length >= count) break;
        if (selected.some((item) => trackKey(item) === trackKey(track))) continue;
        selected.push(track);
      }
    }

    return selected.slice(0, Math.min(count, shuffled.length));
  };

  const attempts = Math.max(1, Math.min(10, Math.ceil((controls.diversityTarget || 70) / 15)));
  let best = [];
  let bestScore = -1;

  for (let i = 0; i < attempts; i += 1) {
    const candidate = pickOnePass();
    const score = computeDiversityScore(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
    if (score >= (controls.diversityTarget || 70)) break;
  }

  return best;
}

async function fetchMlRecommendations(emotion, count = 3, energy = "") {
  try {
    const response = await axios.get(`${config.mlServiceUrl}/recommend`, {
      params: { emotion, count, energy: energy || undefined },
      timeout: config.requestTimeoutMs || 12000,
    });
    if (response.data?.success) {
      return response.data;
    }
  } catch (error) {
    console.warn("[music-intel] ML recommend failed:", error.message);
  }
  return null;
}

function buildWeeklyImpact(playEvents) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = (playEvents || []).filter((event) => new Date(event.createdAt).getTime() >= weekAgo);
  const withFeedback = recent.filter((event) => Number.isFinite(Number(event.feedbackDelta)));

  const byGenre = {};
  const byArtist = {};
  const byHour = {};

  withFeedback.forEach((event) => {
    const delta = Number(event.feedbackDelta);

    byGenre[event.genre] = byGenre[event.genre] || { total: 0, count: 0 };
    byGenre[event.genre].total += delta;
    byGenre[event.genre].count += 1;

    byArtist[event.artist] = byArtist[event.artist] || { total: 0, count: 0 };
    byArtist[event.artist].total += delta;
    byArtist[event.artist].count += 1;

    byHour[event.hour] = byHour[event.hour] || { total: 0, count: 0 };
    byHour[event.hour].total += delta;
    byHour[event.hour].count += 1;
  });

  const toLeaderboard = (obj, keyLabel) =>
    Object.entries(obj)
      .map(([key, val]) => ({
        [keyLabel]: key,
        avgDelta: Number((val.total / val.count).toFixed(2)),
        samples: val.count,
      }))
      .sort((a, b) => b.avgDelta - a.avgDelta)
      .slice(0, 5);

  const summary = withFeedback.length
    ? withFeedback.reduce((sum, item) => sum + Number(item.feedbackDelta), 0) / withFeedback.length
    : 0;

  return {
    samples: withFeedback.length,
    avgMoodLift: Number(summary.toFixed(2)),
    topGenres: toLeaderboard(byGenre, "genre"),
    topArtists: toLeaderboard(byArtist, "artist"),
    bestHours: toLeaderboard(byHour, "hour"),
  };
}

function useMongoRooms() {
  return useMongo() && Boolean(HealingRoom);
}

function buildInviteLink(req, code) {
  const safeCode = String(code || "").toUpperCase();
  let origin = config.frontendUrl;

  const referer = req.get("referer");
  if (referer) {
    try {
      origin = new URL(referer).origin;
    } catch {
      // keep configured frontend origin
    }
  }

  return `${String(origin).replace(/\/$/, "")}/music?room=${encodeURIComponent(safeCode)}`;
}

async function getRoom(code) {
  const safeCode = String(code || "").toUpperCase();
  if (!safeCode) return null;

  if (useMongoRooms()) {
    return HealingRoom.findOne({ code: safeCode }).lean();
  }

  return roomStore.get(safeCode) || null;
}

async function saveRoom(room) {
  if (useMongoRooms()) {
    const next = {
      ...room,
      participants: (room.participants || []).slice(-100),
      messages: (room.messages || []).slice(-100),
      lastActiveAt: new Date(),
    };

    await HealingRoom.findOneAndUpdate(
      { code: next.code },
      { $set: next },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return;
  }

  roomStore.set(room.code, {
    ...room,
    participants: (room.participants || []).slice(-100),
    messages: (room.messages || []).slice(-100),
    lastActiveAt: new Date().toISOString(),
  });
}

async function deleteRoom(code) {
  const safeCode = String(code || "").trim().toUpperCase();
  if (!safeCode) return;

  if (useMongoRooms()) {
    await HealingRoom.deleteOne({ code: safeCode });
    return;
  }

  roomStore.delete(safeCode);
}

function safeRoom(room, req) {
  return {
    code: room.code,
    name: room.name,
    ownerId: room.ownerId,
    private: true,
    createdAt: room.createdAt,
    inviteLink: buildInviteLink(req, room.code),
    participants: room.participants,
    messages: (room.messages || []).slice(-50),
  };
}

function inferMoodFromMetadata(text = "") {
  const content = String(text || "").toLowerCase();
  if (!content) return "Neutral";

  const hasAny = (arr) => arr.some((k) => content.includes(k));

  if (hasAny(["sad", "broken", "heartbreak", "lonely", "cry", "pain", "melancholy"])) return "Sad";
  if (hasAny(["calm", "peace", "relax", "chill", "sleep", "ambient", "meditation", "lofi", "lo-fi"])) return "Calm";
  if (hasAny(["angry", "rage", "fight", "revenge"])) return "Angry";
  if (hasAny(["anxious", "anxiety", "stress", "overthink", "panic"])) return "Anxious";
  if (hasAny(["party", "dance", "energy", "hype", "workout", "pump", "celebration"])) return "Excited";
  if (hasAny(["happy", "joy", "smile", "sunshine", "good vibes", "feel good"])) return "Happy";

  return "Neutral";
}

function inferLanguageHint(text = "") {
  const content = String(text || "").toLowerCase();
  if (!content) return "Unknown";

  if (/(hindi|bollywood|punjabi|indian)/i.test(content)) return "Hindi";
  if (/(tamil|kollywood)/i.test(content)) return "Tamil";
  if (/(telugu|tollywood)/i.test(content)) return "Telugu";
  if (/(instrumental|lofi|lo-fi|ambient|classical)/i.test(content)) return "Instrumental";
  if (/(english|official lyric|official video)/i.test(content)) return "English";

  return "Unknown";
}

const QUERY_MOOD_KEYWORDS = {
  Happy: ["happy", "joy", "cheerful", "good mood", "feel good", "smile", "positive", "fun"],
  Sad: ["sad", "down", "depressed", "heartbreak", "cry", "low", "alone", "lonely"],
  Stressed: ["stressed", "stress", "overwhelmed", "burnout", "pressure", "deadline", "tired"],
  Anxious: ["anxious", "anxiety", "panic", "nervous", "worried", "restless", "uneasy"],
  Angry: ["angry", "mad", "rage", "furious", "irritated", "annoyed"],
  Calm: ["calm", "relax", "relaxing", "peace", "chill", "soothing", "meditation", "sleep"],
  Excited: ["excited", "hype", "energetic", "pump", "party", "celebrate", "motivation", "workout"],
  Neutral: ["music", "songs", "playlist", "youtube", "tracks"],
};

const ML_MOOD_ALIAS = {
  Stress: "Stressed",
  stressed: "Stressed",
  stress: "Stressed",
  tired: "Stressed",
  anxiety: "Anxious",
  worried: "Anxious",
  fear: "Anxious",
  neutral: "Neutral",
  calm: "Calm",
  happy: "Happy",
  joy: "Happy",
  sadness: "Sad",
  sad: "Sad",
  angry: "Angry",
  anger: "Angry",
  excited: "Excited",
};

const MOOD_SEARCH_SEEDS = {
  Happy: ["upbeat songs", "feel good music", "party hits", "happy bollywood songs"],
  Sad: ["uplifting songs", "comfort songs", "feel good music", "hopeful acoustic songs"],
  Stressed: ["calming music", "lofi beats", "stress relief music", "relaxing instrumental"],
  Anxious: ["anxiety relief music", "peaceful piano", "calm ambient music", "slow breathing music"],
  Angry: ["intense rap songs", "rock workout tracks", "cool down music", "focus beats"],
  Calm: ["chill relaxing music", "acoustic calm songs", "meditation music", "soft bollywood unplugged"],
  Excited: ["energetic songs", "dance playlist", "party songs", "high energy bollywood"],
  Neutral: ["trending songs 2026", "popular songs playlist", "top hits", "new music mix"],
};

const MOOD_MESSAGES = {
  Happy: "You seem to be in a positive mood. Here are tracks that match your upbeat vibe.",
  Sad: "It seems like you may be feeling low. Here are songs selected to gently lift your mood.",
  Stressed: "You might be feeling stressed. These songs are chosen to help you unwind.",
  Anxious: "You appear to be feeling anxious. Here are calming tracks to support a steadier rhythm.",
  Angry: "You may be feeling frustrated. These recommendations can help channel and release that intensity.",
  Calm: "You appear to be in a relaxed mood. Here are songs that preserve that calm energy.",
  Excited: "You seem energized. Here are tracks that match your momentum.",
  Neutral: "Your mood appears balanced. Here is a diverse set of songs to explore.",
};

function shuffleList(list = []) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function moodToApiValue(mood) {
  return String(mood || "Neutral").trim().toLowerCase();
}

function mapToSupportedMood(rawMood = "") {
  const normalized = String(rawMood || "").trim();
  if (!normalized) return "Neutral";

  if (ML_MOOD_ALIAS[normalized]) return ML_MOOD_ALIAS[normalized];

  const titled = normalizeMood(normalized);
  if (QUERY_MOOD_KEYWORDS[titled]) return titled;

  return "Neutral";
}

function buildMoodMessage(mood) {
  return MOOD_MESSAGES[mood] || MOOD_MESSAGES.Neutral;
}

function scoreMoodFromKeywords(query = "") {
  const text = String(query || "").toLowerCase();
  if (!text) return { mood: "Neutral", confidence: 0.5, source: "keyword-fallback" };

  const scoreBoard = Object.entries(QUERY_MOOD_KEYWORDS).map(([mood, words]) => {
    let score = 0;
    for (const keyword of words) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      const matches = text.match(regex);
      if (matches?.length) {
        score += matches.length;
      }
    }
    return { mood, score };
  });

  const ranked = scoreBoard.sort((a, b) => b.score - a.score);
  if (!ranked[0]?.score) {
    return { mood: "Neutral", confidence: 0.56, source: "keyword-fallback" };
  }

  const top = ranked[0];
  const total = ranked.reduce((sum, item) => sum + item.score, 0) || 1;
  const confidence = Math.min(0.92, Math.max(0.58, top.score / total + 0.45));
  return { mood: top.mood, confidence: Number(confidence.toFixed(2)), source: "keyword-fallback" };
}

async function detectMoodFromQuery(query = "") {
  const clean = String(query || "").trim();
  if (!clean) {
    return { mood: "Neutral", confidence: 0.5, source: "keyword-fallback" };
  }

  try {
    const ml = await axios.post(
      `${config.mlServiceUrl}/detect-text`,
      { text: clean },
      { timeout: Math.min(config.mlTimeoutMs || 15000, 4500) }
    );

    const payload = ml?.data || {};
    if (payload?.success && payload?.emotion) {
      const mood = mapToSupportedMood(payload.emotion);
      const confRaw = Number(payload.confidence);
      const confidence = Number.isFinite(confRaw)
        ? Math.max(0.45, Math.min(0.99, confRaw))
        : 0.72;

      if (mood) {
        return {
          mood,
          confidence: Number(confidence.toFixed(2)),
          source: payload.source || "ml-model",
        };
      }
    }
  } catch {
    // Keyword fallback handles model outages or timeout.
  }

  return scoreMoodFromKeywords(clean);
}

function parseCsvParam(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function rankByPreferences(videos = [], preferredGenres = [], preferredLanguages = [], detectedMood = "Neutral") {
  const genreSet = new Set(preferredGenres.map((item) => item.toLowerCase()));
  const languageSet = new Set(preferredLanguages.map((item) => item.toLowerCase()));
  const moodNorm = normalizeMood(detectedMood);

  return videos
    .map((item) => {
      const title = String(item.title || "").toLowerCase();
      const artist = String(item.artist || "").toLowerCase();
      const channel = String(item.channel || "").toLowerCase();
      const language = String(item.language || "").toLowerCase();

      let score = 0;
      if (normalizeMood(item.sourceMood) === moodNorm || normalizeMood(item.detectedMood) === moodNorm) score += 4;
      if (languageSet.has(language)) score += 2;

      for (const genre of genreSet) {
        if (title.includes(genre) || artist.includes(genre) || channel.includes(genre)) {
          score += 2;
          break;
        }
      }

      return {
        ...item,
        _rankScore: score + Math.random() * 0.35,
      };
    })
    .sort((a, b) => b._rankScore - a._rankScore)
    .map(({ _rankScore, ...rest }) => rest);
}

function buildMoodQueries(baseQuery, mood, language = "Any") {
  const cleanBase = String(baseQuery || "").trim();
  const safeMood = normalizeMood(mood || "Neutral");
  const seeds = shuffleList(MOOD_SEARCH_SEEDS[safeMood] || MOOD_SEARCH_SEEDS.Neutral);

  const queries = [cleanBase, ...seeds.slice(0, 2)].filter(Boolean);
  const withLanguage = queries.map((q) => {
    if (!language || language === "Any") return q;
    return `${q} ${language}`;
  });

  return Array.from(new Set(withLanguage)).slice(0, 3);
}

async function buildMoodAwareRecommendations({ query, language, maxResults, preferredGenres, preferredLanguages }) {
  const detection = await detectMoodFromQuery(query);
  const mood = detection.mood || "Neutral";
  const message = buildMoodMessage(mood);
  const searchQueries = buildMoodQueries(query, mood, language);

  const chunks = await Promise.all(
    searchQueries.map(async (searchQuery) => {
      try {
        return await scrapeYoutubeSearch(searchQuery, Math.max(8, maxResults));
      } catch {
        return [];
      }
    })
  );

  const flattened = chunks.flat();
  const dedupMap = new Map();
  for (const video of flattened) {
    if (!video?.youtubeId || dedupMap.has(video.youtubeId)) continue;
    dedupMap.set(video.youtubeId, video);
  }

  let merged = Array.from(dedupMap.values());
  if (!merged.length) {
    merged = await scrapeYoutubeSearch(language && language !== "Any" ? `trending songs ${language}` : "trending songs", maxResults);
  }

  if (language && language !== "Any") {
    merged = merged.filter((item) => item.language === language || item.language === "Unknown");
  }

  const ranked = rankByPreferences(merged, preferredGenres, preferredLanguages, mood);
  const finalResults = ranked.slice(0, maxResults);

  return {
    mood,
    confidence: Number(Math.max(0.45, Math.min(0.99, detection.confidence || 0.62)).toFixed(2)),
    source: detection.source,
    message,
    results: finalResults,
    videos: finalResults.map((item) => ({
      title: item.title,
      artist: item.artist,
      language: item.language,
      thumbnail: item.thumbnail,
      youtubeId: item.youtubeId,
      url: `https://www.youtube.com/watch?v=${item.youtubeId}`,
    })),
  };
}

function safeDecodeHtml(text = "") {
  return String(text || "")
    .replace(/\\u0026/g, "&")
    .replace(/\\u003c/g, "<")
    .replace(/\\u003e/g, ">")
    .replace(/\\"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}

function normalizeWhitespace(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function cleanArtistName(value = "") {
  let name = normalizeWhitespace(safeDecodeHtml(value));
  if (!name) return "";

  name = name.replace(/\s*[-–—]\s*topic$/i, "").trim();
  name = name.replace(/\s*\(official\)$/i, "").trim();
  return name;
}

function isWeakArtistName(value = "") {
  const name = normalizeWhitespace(value).toLowerCase();
  if (!name) return true;
  return ["youtube", "youtube music", "music", "video", "official video"].includes(name);
}

function inferArtistFromTitle(title = "") {
  const cleanTitle = normalizeWhitespace(title);
  if (!cleanTitle) return "";

  const byMatch = cleanTitle.match(/\bby\s+([^|\-–—]+)$/i);
  if (byMatch?.[1]) {
    return cleanArtistName(byMatch[1]);
  }

  const separators = [" - ", " – ", " — ", " | ", ": "];
  for (const sep of separators) {
    if (!cleanTitle.includes(sep)) continue;

    const [left, right] = cleanTitle.split(sep);
    const leftName = cleanArtistName(left);
    const rightName = cleanArtistName(right);

    // Most music uploads follow "Artist - Song" format.
    if (leftName && leftName.split(" ").length <= 6) return leftName;
    if (rightName && rightName.split(" ").length <= 6) return rightName;
  }

  return "";
}

function pickBestArtist({ channel = "", title = "" } = {}) {
  const channelName = cleanArtistName(channel);
  if (!isWeakArtistName(channelName)) return channelName;

  const titleInferred = inferArtistFromTitle(title);
  if (!isWeakArtistName(titleInferred)) return titleInferred;

  return channelName || titleInferred || "Unknown Artist";
}

function extractTextNode(node) {
  if (!node) return "";
  if (typeof node.simpleText === "string") return node.simpleText;
  if (Array.isArray(node.runs)) {
    return node.runs.map((run) => run?.text || "").join("");
  }
  return "";
}

function extractYoutubeVideoRenderers(initialData, maxResults) {
  const renderers = [];
  const stack = [initialData];

  while (stack.length && renderers.length < maxResults) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    if (current.videoRenderer?.videoId) {
      renderers.push(current.videoRenderer);
    }

    for (const key of Object.keys(current)) {
      const child = current[key];
      if (!child) continue;
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i += 1) {
          if (child[i] && typeof child[i] === "object") stack.push(child[i]);
        }
      } else if (typeof child === "object") {
        stack.push(child);
      }
    }
  }

  return renderers;
}

function mapRendererToVideo(renderer) {
  const youtubeId = renderer?.videoId;
  if (!youtubeId) return null;

  const title = normalizeWhitespace(safeDecodeHtml(extractTextNode(renderer.title) || "YouTube Video"));
  const channel = normalizeWhitespace(
    safeDecodeHtml(
      extractTextNode(renderer.ownerText) ||
      extractTextNode(renderer.longBylineText) ||
      extractTextNode(renderer.shortBylineText) ||
      ""
    )
  );
  const artist = pickBestArtist({ channel, title });
  const duration = normalizeWhitespace(extractTextNode(renderer.lengthText));
  const viewsRaw = normalizeWhitespace(extractTextNode(renderer.viewCountText));
  const publishedAt = normalizeWhitespace(
    extractTextNode(renderer.publishedTimeText) || extractTextNode(renderer.publishedTimeText?.simpleText)
  );
  const combinedText = `${title} ${artist} ${channel}`;

  const viewsNumber = Number(String(viewsRaw).replace(/[^\d]/g, "")) || 0;

  return {
    title,
    artist,
    channel: channel || artist,
    youtubeId,
    duration,
    views: viewsNumber,
    publishedAt,
    thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    sourceMood: inferMoodFromMetadata(combinedText),
    detectedMood: inferMoodFromMetadata(combinedText),
    language: inferLanguageHint(combinedText),
    source: "youtube-search",
  };
}

function extractInitialDataJson(html = "") {
  const text = String(html || "");
  const marker = "var ytInitialData = ";
  const idx = text.indexOf(marker);
  if (idx === -1) return null;

  const start = idx + marker.length;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let started = false;
  let end = -1;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (!started) {
      if (ch === "{") {
        started = true;
        depth = 1;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;

    if (depth === 0) {
      end = i + 1;
      break;
    }
  }

  if (end === -1) return null;

  const json = text.slice(text.indexOf("{", start), end);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function scrapeYoutubeSearch(query, maxResults) {
  const response = await axios.get("https://www.youtube.com/results", {
    params: {
      search_query: query,
      sp: "EgIQAQ%253D%253D", // videos only
    },
    timeout: config.requestTimeoutMs || 12000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const html = String(response.data || "");
  const initialData = extractInitialDataJson(html);

  if (initialData) {
    const renderers = extractYoutubeVideoRenderers(initialData, maxResults * 2);
    const mapped = [];
    const seen = new Set();

    for (const renderer of renderers) {
      const item = mapRendererToVideo(renderer);
      if (!item?.youtubeId || seen.has(item.youtubeId)) continue;
      seen.add(item.youtubeId);
      mapped.push(item);
      if (mapped.length >= maxResults) break;
    }

    if (mapped.length) return mapped;
  }

  const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  const ids = [];
  const seen = new Set();

  let match;
  while ((match = idRegex.exec(html)) !== null && ids.length < maxResults) {
    const id = match[1];
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return ids.map((id) => {
    const near = html.slice(Math.max(0, html.indexOf(`"videoId":"${id}"`) - 200), html.indexOf(`"videoId":"${id}"`) + 1200);

    const titleMatch = near.match(/"title":\{"runs":\[\{"text":"([^\"]+)"/) || near.match(/"title":\{"simpleText":"([^\"]+)"/);
    const channelMatch = near.match(/"ownerText":\{"runs":\[\{"text":"([^\"]+)"/) || near.match(/"longBylineText":\{"runs":\[\{"text":"([^\"]+)"/);
    const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    const title = normalizeWhitespace(safeDecodeHtml(titleMatch?.[1] || "YouTube Video"));
    const channel = normalizeWhitespace(safeDecodeHtml(channelMatch?.[1] || ""));
    const artist = pickBestArtist({ channel, title });
    const combinedText = `${title} ${artist} ${channel}`;

    return {
      title,
      artist,
      channel: channel || artist,
      youtubeId: id,
      duration: "",
      views: 0,
      publishedAt: "",
      thumbnail: thumb,
      sourceMood: inferMoodFromMetadata(combinedText),
      detectedMood: inferMoodFromMetadata(combinedText),
      language: inferLanguageHint(combinedText),
      source: "youtube-search",
    };
  });
}

router.use((req, res, next) => {
  if (req.path === "/search") return next();
  return authMiddleware(req, res, next);
});

router.get("/search", async (req, res) => {
  try {
    const query = String(req.query?.q || "").trim();
    if (!query) {
      return res.status(400).json({ success: false, error: "Search query is required" });
    }

    const language = String(req.query?.language || "Any").trim();
    const maxResults = Math.min(50, Math.max(5, Number(req.query?.maxResults) || 10));
    const preferredGenres = parseCsvParam(req.query?.preferredGenres);
    const preferredLanguages = parseCsvParam(req.query?.preferredLanguages);

    const recommendation = await buildMoodAwareRecommendations({
      query,
      language,
      maxResults,
      preferredGenres,
      preferredLanguages,
    });

    return res.json({
      success: true,
      query,
      language,
      mood: moodToApiValue(recommendation.mood),
      confidence: recommendation.confidence,
      message: recommendation.message,
      source: recommendation.source,
      maxResults,
      count: recommendation.results.length,
      videos: recommendation.videos,
      results: recommendation.results,
      personalization: {
        preferredGenres,
        preferredLanguages,
        applied: preferredGenres.length > 0 || preferredLanguages.length > 0,
      },
      nextPageToken: null,
      prevPageToken: null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message || "Search failed" });
  }
});

router.get("/recommendation-controls", async (req, res) => {
  try {
    const data = await getMusicData(req.user.id);
    const controls = resolveRecommendationControls(data);
    data.recommendationControls = controls;
    await saveMusicData(req.user.id, data);
    return res.json({ success: true, controls });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/recommendation-controls", async (req, res) => {
  try {
    const data = await getMusicData(req.user.id);
    const controls = resolveRecommendationControls(data, {
      diversityTarget: req.body?.diversityTarget,
      dedupeArtist: parseBooleanParam(req.body?.dedupeArtist),
      dedupeGenre: parseBooleanParam(req.body?.dedupeGenre),
    });
    data.recommendationControls = controls;
    await saveMusicData(req.user.id, data);
    return res.json({ success: true, controls });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/transition", async (req, res) => {
  try {
    const fromMood = normalizeMood(req.query.fromMood || "Neutral");
    const path = STAGE_PATHS[fromMood] || STAGE_PATHS.Neutral;

    const data = await getMusicData(req.user.id);
    const controls = resolveRecommendationControls(data, {
      diversityTarget: req.query.diversityTarget,
      dedupeArtist: parseBooleanParam(req.query.dedupeArtist),
      dedupeGenre: parseBooleanParam(req.query.dedupeGenre),
    });
    data.recommendationControls = controls;
    const recentKeys = new Set((data.recentRecommendations || []).slice(-30).map((x) => x.trackKey));

    const stages = [];
    for (let i = 0; i < path.length; i += 1) {
      const stageMood = path[i];
      const mlMood = STAGE_MOOD_ALIAS[stageMood] || stageMood;
      const ml = await fetchMlRecommendations(mlMood, 3, i === 0 ? "low" : i === 2 ? "medium" : "");

      const pool = getPoolForMood(stageMood);
      const picks = pickDiverseTracks(pool, recentKeys, 3, controls);
      const diversityScore = computeDiversityScore(picks);

      picks.forEach((track) => {
        recentKeys.add(trackKey(track));
        data.recentRecommendations.push({
          type: "transition",
          stage: i + 1,
          trackKey: trackKey(track),
          createdAt: new Date().toISOString(),
        });
      });

      stages.push({
        stage: i + 1,
        title: i === 0 ? "Decompress" : i === 1 ? "Stabilize" : "Refocus",
        mood: stageMood,
        tracks: picks,
        diversityScore,
        mlSeeds: ml?.songs || [],
        therapy: ml?.therapy || null,
      });
    }

    await saveMusicData(req.user.id, data);
    return res.json({ success: true, fromMood, controls, stages });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rescue", async (req, res) => {
  try {
    const mood = normalizeMood(req.body?.mood || "Stressed");
    const rescueMood = ["Anxious", "Stressed", "Angry", "Sad"].includes(mood) ? "Calm" : "Happy";

    const data = await getMusicData(req.user.id);
    const controls = resolveRecommendationControls(data, {
      diversityTarget: req.body?.diversityTarget,
      dedupeArtist: parseBooleanParam(req.body?.dedupeArtist),
      dedupeGenre: parseBooleanParam(req.body?.dedupeGenre),
    });
    data.recommendationControls = controls;
    const recentKeys = new Set((data.recentRecommendations || []).slice(-30).map((x) => x.trackKey));

    const ml = await fetchMlRecommendations(rescueMood, 6, "low");
    const pool = getPoolForMood(rescueMood);
    const picks = pickDiverseTracks(pool, recentKeys, 6, controls);
    const diversityScore = computeDiversityScore(picks);

    picks.forEach((track) => {
      data.recentRecommendations.push({
        type: "rescue",
        trackKey: trackKey(track),
        createdAt: new Date().toISOString(),
      });
    });

    await saveMusicData(req.user.id, data);

    return res.json({
      success: true,
      mood,
      rescueMood,
      profile: {
        tempo: "60-95 bpm",
        valence: "warm-positive",
        skipFriction: "low",
      },
      controls,
      diversityScore,
      tracks: picks,
      mlSeeds: ml?.songs || [],
      therapy: ml?.therapy || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/impact/log-play", async (req, res) => {
  try {
    const { title, artist, genre, moodBefore, createdAt } = req.body || {};
    if (!title || !artist) {
      return res.status(400).json({ success: false, error: "title and artist are required" });
    }

    const data = await getMusicData(req.user.id);
    const eventId = crypto.randomUUID();
    const created = createdAt ? new Date(createdAt) : new Date();

    data.playEvents.push({
      id: eventId,
      title: String(title).slice(0, 120),
      artist: String(artist).slice(0, 120),
      genre: String(genre || "unknown").slice(0, 60),
      moodBefore: normalizeMood(moodBefore || "Neutral"),
      hour: created.getHours(),
      feedbackDelta: null,
      createdAt: created.toISOString(),
    });

    await saveMusicData(req.user.id, data);
    return res.json({ success: true, eventId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/impact/feedback", async (req, res) => {
  try {
    const { eventId, feedback } = req.body || {};
    if (!eventId || !["better", "same", "worse"].includes(String(feedback))) {
      return res.status(400).json({ success: false, error: "eventId and valid feedback are required" });
    }

    const deltaMap = { better: 1, same: 0, worse: -1 };
    const data = await getMusicData(req.user.id);
    const idx = data.playEvents.findIndex((event) => event.id === eventId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Playback event not found" });
    }

    data.playEvents[idx].feedback = feedback;
    data.playEvents[idx].feedbackDelta = deltaMap[feedback];
    data.playEvents[idx].feedbackAt = new Date().toISOString();

    await saveMusicData(req.user.id, data);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/impact/weekly", async (req, res) => {
  try {
    const data = await getMusicData(req.user.id);
    const report = buildWeeklyImpact(data.playEvents || []);
    return res.json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rooms/create", async (req, res) => {
  try {
    const name = String(req.body?.name || "Healing Room").trim().slice(0, 50) || "Healing Room";
    let code = "";

    for (let i = 0; i < 8; i += 1) {
      const candidate = crypto.randomBytes(3).toString("hex").toUpperCase();
      const existing = await getRoom(candidate);
      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return res.status(500).json({ success: false, error: "Unable to allocate room code" });
    }

    const room = {
      code,
      name,
      ownerId: req.user.id,
      createdAt: new Date().toISOString(),
      invitePath: `/music?room=${encodeURIComponent(code)}`,
      participants: [{ id: req.user.id, name: req.user.email || "User", joinedAt: new Date().toISOString() }],
      messages: [
        {
          id: crypto.randomUUID(),
          sender: "system",
          text: "Room created. Share the invite link with trusted friends.",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    await saveRoom(room);
    return res.json({ success: true, room: safeRoom(room, req) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rooms/join", async (req, res) => {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const room = await getRoom(code);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!room.participants.some((p) => p.id === req.user.id)) {
      room.participants.push({ id: req.user.id, name: req.user.email || "User", joinedAt: new Date().toISOString() });
      room.messages.push({
        id: crypto.randomUUID(),
        sender: "system",
        text: `${req.user.email || "A user"} joined the room.`,
        createdAt: new Date().toISOString(),
      });
      await saveRoom(room);
    }

    return res.json({ success: true, room: safeRoom(room, req) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/rooms/:code", async (req, res) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!room.participants.some((p) => p.id === req.user.id)) {
      return res.status(403).json({ success: false, error: "Join the room first" });
    }

    return res.json({ success: true, room: safeRoom(room, req) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rooms/:code/message", async (req, res) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (!room.participants.some((p) => p.id === req.user.id)) {
      return res.status(403).json({ success: false, error: "Join the room first" });
    }

    const text = String(req.body?.text || "").trim().slice(0, 280);
    if (!text) {
      return res.status(400).json({ success: false, error: "Message text is required" });
    }

    room.messages.push({
      id: crypto.randomUUID(),
      sender: req.user.email || "User",
      text,
      createdAt: new Date().toISOString(),
    });

    await saveRoom(room);
    return res.json({ success: true, room: safeRoom(room, req) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/rooms/:code/close", async (req, res) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    if (String(room.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, error: "Only the room owner can close this room" });
    }

    await deleteRoom(room.code);
    return res.json({ success: true, code: room.code });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
