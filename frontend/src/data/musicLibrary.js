// ===============================
// YOUTUBE THUMBNAIL (always works)
// ===============================
export const getYoutubeThumbnail = (youtubeId) => {
  return `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`;
};

// Fallback placeholder for broken thumbnails
export const THUMBNAIL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 90' fill='%231e293b'%3E%3Crect width='120' height='90'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14'%3E♪%3C/text%3E%3C/svg%3E";

// ===============================
// ROTATION / ANTI-REPEAT
// ===============================
const RECENT_KEY = "echona_recent_songs";
const MAX_RECENT = 10;

function getRecentHistory() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}

function addToRecentHistory(songId) {
  const history = getRecentHistory();
  const updated = [songId, ...history.filter(id => id !== songId)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

/**
 * Returns a balanced playlist of 6-8 songs from the mood's library.
 * Strategy: 2 English, 2 Bollywood, 1-2 South Indian, 1 Instrumental/Lo-fi.
 * Avoids songs from the last 10 recommendations.
 */
export function getPlaylist(mood) {
  const pool = musicLibrary[mood] || musicLibrary.Happy;
  const recent = new Set(getRecentHistory());

  const pick = (arr, count) => {
    const available = arr.filter(s => !recent.has(s.youtubeId));
    const source = available.length >= count ? available : arr;
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const english = pool.filter(s => s.language === "English");
  const bollywood = pool.filter(s => s.language === "Hindi");
  const southIndian = pool.filter(s => s.language === "Telugu" || s.language === "Tamil");
  const instrumental = pool.filter(s => s.genre === "Instrumental" || s.genre === "Lo-fi" || s.genre === "Ambient");

  const playlist = [
    ...pick(english, 2),
    ...pick(bollywood, 2),
    ...pick(southIndian, 1),
    ...pick(instrumental, 1),
  ];

  // If less than 6, fill from full pool
  if (playlist.length < 6) {
    const ids = new Set(playlist.map(s => s.youtubeId));
    const remaining = pool.filter(s => !ids.has(s.youtubeId));
    playlist.push(...pick(remaining, 6 - playlist.length));
  }

  // Record in history
  playlist.forEach(s => addToRecentHistory(s.youtubeId));

  return playlist.sort(() => Math.random() - 0.5);
}

// ===============================
// MUSIC LIBRARY — 10 MOODS × MULTI-LANGUAGE
// Each song: { title, artist, youtubeId, language, genre, energy }
// ===============================
const musicLibrary = {
  Happy: [
    // English
    { title: "Happy", artist: "Pharrell Williams", youtubeId: "ZbZSe6N_BXs", language: "English", genre: "Pop", energy: "high" },
    { title: "Uptown Funk", artist: "Bruno Mars", youtubeId: "OPf0YbXqDm0", language: "English", genre: "Pop", energy: "high" },
    { title: "Can't Stop The Feeling", artist: "Justin Timberlake", youtubeId: "ru0K8uYEZWw", language: "English", genre: "Pop", energy: "high" },
    { title: "Shake It Off", artist: "Taylor Swift", youtubeId: "nfWlot6h_JM", language: "English", genre: "Pop", energy: "high" },
    { title: "Blinding Lights", artist: "The Weeknd", youtubeId: "4NRXx6U8ABQ", language: "English", genre: "Pop", energy: "high" },
    // Bollywood
    { title: "Gallan Goodiyaan", artist: "Yashita Sharma", youtubeId: "jCEdTq3j-0U", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Badtameez Dil", artist: "Benny Dayal", youtubeId: "II2EO3Nw4Q0", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "London Thumakda", artist: "Labh Janjua", youtubeId: "udra3Mfw2oo", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Balam Pichkari", artist: "Vishal Dadlani", youtubeId: "0WtRNGF2kRg", language: "Hindi", genre: "Bollywood", energy: "high" },
    // South Indian
    { title: "Vaathi Coming", artist: "Anirudh", youtubeId: "fYFnFMGMEyI", language: "Tamil", genre: "Kollywood", energy: "high" },
    { title: "Butta Bomma", artist: "Armaan Malik", youtubeId: "4sy5MCSaSTg", language: "Telugu", genre: "Tollywood", energy: "medium" },
    // Instrumental / Lo-fi
    { title: "Happy Lo-fi Beats", artist: "Lofi Girl", youtubeId: "jfKfPfyJRdk", language: "Instrumental", genre: "Lo-fi", energy: "medium" },
    { title: "Morning Coffee Jazz", artist: "Cafe Music BGM", youtubeId: "sPlhKP0nZII", language: "Instrumental", genre: "Lo-fi", energy: "medium" },
  ],

  Sad: [
    // English
    { title: "Someone Like You", artist: "Adele", youtubeId: "hLQl3WQQoQ0", language: "English", genre: "Pop", energy: "low" },
    { title: "Let Her Go", artist: "Passenger", youtubeId: "RBumgq5yVrA", language: "English", genre: "Indie", energy: "low" },
    { title: "Fix You", artist: "Coldplay", youtubeId: "k4V3Mo61fJM", language: "English", genre: "Alternative", energy: "low" },
    { title: "Someone You Loved", artist: "Lewis Capaldi", youtubeId: "zABLecsR5UE", language: "English", genre: "Pop", energy: "low" },
    { title: "The Night We Met", artist: "Lord Huron", youtubeId: "KtlgYxa6BMU", language: "English", genre: "Indie", energy: "low" },
    // Bollywood
    { title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh", youtubeId: "BXcFEhl7ynQ", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Channa Mereya", artist: "Arijit Singh", youtubeId: "284Ov7yGfz0", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Agar Tum Saath Ho", artist: "Arijit Singh & Alka Yagnik", youtubeId: "sK7riqg2mr4", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Phir Bhi Tumko Chaahunga", artist: "Arijit Singh", youtubeId: "huJFjcOTjfY", language: "Hindi", genre: "Bollywood", energy: "low" },
    // South Indian
    { title: "Kanave Kanave", artist: "Anirudh", youtubeId: "IvwLEbCmjCg", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Emai Poyave", artist: "Sid Sriram", youtubeId: "Uq-Fg1XiZbk", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "River Flows In You", artist: "Yiruma", youtubeId: "7maJOI3QMu0", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Comptine d'un autre été", artist: "Yann Tiersen", youtubeId: "NvryolGa19A", language: "Instrumental", genre: "Instrumental", energy: "low" },
  ],

  Angry: [
    // English
    { title: "Lose Yourself", artist: "Eminem", youtubeId: "_Yhyp-_hX2s", language: "English", genre: "Hip-Hop", energy: "high" },
    { title: "In The End", artist: "Linkin Park", youtubeId: "eVTXPUF4Oz4", language: "English", genre: "Rock", energy: "high" },
    { title: "Numb", artist: "Linkin Park", youtubeId: "kXYiU_JCYtU", language: "English", genre: "Rock", energy: "high" },
    { title: "Believer", artist: "Imagine Dragons", youtubeId: "7wtfhZwyrcc", language: "English", genre: "Rock", energy: "high" },
    { title: "Eye of the Tiger", artist: "Survivor", youtubeId: "btPJPFnesV4", language: "English", genre: "Rock", energy: "high" },
    // Bollywood
    { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh", youtubeId: "OGBM3wMaIlE", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Sultan", artist: "Sukhwinder Singh", youtubeId: "fds2HOKv2QA", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Dangal", artist: "Daler Mehndi", youtubeId: "4R-WaBfuOJc", language: "Hindi", genre: "Bollywood", energy: "high" },
    // South Indian
    { title: "Aalaporan Tamizhan", artist: "A.R. Rahman", youtubeId: "c5RKiBQJPa0", language: "Tamil", genre: "Kollywood", energy: "high" },
    { title: "Saahore Baahubali", artist: "MM Keeravani", youtubeId: "sOsB6EFiMIo", language: "Telugu", genre: "Tollywood", energy: "high" },
    // Instrumental
    { title: "Kashmir", artist: "Led Zeppelin", youtubeId: "tzVJPgCn-Z8", language: "Instrumental", genre: "Instrumental", energy: "high" },
  ],

  Calm: [
    // English
    { title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", language: "English", genre: "Ambient", energy: "low" },
    { title: "A Thousand Years", artist: "Christina Perri", youtubeId: "rtOvBOTyX00", language: "English", genre: "Pop", energy: "low" },
    { title: "Perfect", artist: "Ed Sheeran", youtubeId: "2Vv-BfVoq4g", language: "English", genre: "Pop", energy: "low" },
    { title: "Sunset Lover", artist: "Petit Biscuit", youtubeId: "wuCK-oiE3rM", language: "English", genre: "Electronic", energy: "low" },
    // Bollywood
    { title: "Kal Ho Naa Ho", artist: "Sonu Nigam", youtubeId: "3pep1EvSbEk", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Tum Hi Ho", artist: "Arijit Singh", youtubeId: "IJq0yyWug1k", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Raabta", artist: "Arijit Singh", youtubeId: "2iwMnQLQJxg", language: "Hindi", genre: "Bollywood", energy: "low" },
    // South Indian
    { title: "Nee Himamazhayayi", artist: "Vineeth Sreenivasan", youtubeId: "n9qXrBJEgGU", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Inkem Inkem", artist: "Sid Sriram", youtubeId: "eFbKGGEoAvU", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "Clair de Lune", artist: "Debussy", youtubeId: "CvFH_6DNRCY", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Una Mattina", artist: "Ludovico Einaudi", youtubeId: "ORtJSiegvow", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Calm Lo-fi Study Beats", artist: "Lofi Girl", youtubeId: "jfKfPfyJRdk", language: "Instrumental", genre: "Lo-fi", energy: "low" },
  ],

  Excited: [
    // English
    { title: "24K Magic", artist: "Bruno Mars", youtubeId: "UqyT8IEBkvY", language: "English", genre: "Pop", energy: "high" },
    { title: "Shut Up and Dance", artist: "Walk The Moon", youtubeId: "6JCLY0Rlx6Q", language: "English", genre: "Pop", energy: "high" },
    { title: "Dance Monkey", artist: "Tones and I", youtubeId: "q0hyYWKXF0Q", language: "English", genre: "Pop", energy: "high" },
    { title: "High Hopes", artist: "Panic! At The Disco", youtubeId: "IPXIgEAGe4U", language: "English", genre: "Pop", energy: "high" },
    { title: "Party Rock Anthem", artist: "LMFAO", youtubeId: "KQ6zr6kCPj8", language: "English", genre: "Electronic", energy: "high" },
    // Bollywood
    { title: "Kar Gayi Chull", artist: "Badshah & Neha Kakkar", youtubeId: "NTHz9ephYTw", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Nashe Si Chadh Gayi", artist: "Arijit Singh", youtubeId: "Wd2B8OAotU8", language: "Hindi", genre: "Bollywood", energy: "high" },
    { title: "Abhi Toh Party Shuru Hui Hai", artist: "Badshah", youtubeId: "8FhMPemGcWE", language: "Hindi", genre: "Bollywood", energy: "high" },
    // South Indian
    { title: "Rowdy Baby", artist: "Dhanush & Dhee", youtubeId: "x6Q7c9RyMzk", language: "Tamil", genre: "Kollywood", energy: "high" },
    { title: "Top Lesi Poddi", artist: "Benny Dayal", youtubeId: "7KZFZdS3c6s", language: "Telugu", genre: "Tollywood", energy: "high" },
    // Instrumental
    { title: "Levels", artist: "Avicii", youtubeId: "_ovdm2yX4MA", language: "Instrumental", genre: "Electronic", energy: "high" },
  ],

  Anxious: [
    // English
    { title: "Breathe Me", artist: "Sia", youtubeId: "SFGvmrJ5rjM", language: "English", genre: "Pop", energy: "low" },
    { title: "Lovely", artist: "Billie Eilish", youtubeId: "V1Pl8CzNzCw", language: "English", genre: "Pop", energy: "low" },
    { title: "Chasing Cars", artist: "Snow Patrol", youtubeId: "GemKqzILV4w", language: "English", genre: "Alternative", energy: "low" },
    { title: "How to Save a Life", artist: "The Fray", youtubeId: "cjVQ36NhbMk", language: "English", genre: "Alternative", energy: "low" },
    // Bollywood
    { title: "Khairiyat", artist: "Arijit Singh", youtubeId: "hoNb6HuNmU0", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Tera Ban Jaunga", artist: "Akhil Sachdeva & Tulsi Kumar", youtubeId: "MBa0yqHdR9M", language: "Hindi", genre: "Bollywood", energy: "low" },
    // South Indian
    { title: "Ennodu Nee Irundhaal", artist: "A.R. Rahman", youtubeId: "wgQJ2tMFOSU", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Evare", artist: "Chinmayi", youtubeId: "gHLpCZn1hrs", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "Weightless", artist: "Marconi Union", youtubeId: "UfcAVejslrU", language: "Instrumental", genre: "Ambient", energy: "low" },
    { title: "Experience", artist: "Ludovico Einaudi", youtubeId: "_VONMkKkdf4", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Spa Relaxing Music", artist: "Soothing Relaxation", youtubeId: "lFcSrYw-ARY", language: "Instrumental", genre: "Ambient", energy: "low" },
  ],

  Stressed: [
    // English
    { title: "Breathe", artist: "Télépopmusik", youtubeId: "vyut3GyQtn0", language: "English", genre: "Electronic", energy: "low" },
    { title: "Orinoco Flow", artist: "Enya", youtubeId: "LTrk4X9ACtw", language: "English", genre: "New Age", energy: "low" },
    { title: "Only Time", artist: "Enya", youtubeId: "7wfYIMyS_dI", language: "English", genre: "New Age", energy: "low" },
    { title: "Here Comes The Sun", artist: "The Beatles", youtubeId: "KQetemT1sWc", language: "English", genre: "Rock", energy: "medium" },
    // Bollywood
    { title: "Kun Faya Kun", artist: "A.R. Rahman", youtubeId: "T94PHkuydcw", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", youtubeId: "6FURuLYrR_Q", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Ilahi", artist: "Arijit Singh", youtubeId: "GRi-FgVBjKI", language: "Hindi", genre: "Bollywood", energy: "medium" },
    // South Indian
    { title: "Minnale Nee", artist: "Bombay Jayashri", youtubeId: "TP_JhK4sTIE", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Samajavaragamana", artist: "Sid Sriram", youtubeId: "z8n153VKqUI", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "Clair de Lune", artist: "Debussy", youtubeId: "CvFH_6DNRCY", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Deep Sleep Lo-fi", artist: "Sleepy Fish", youtubeId: "DWcJFNfaw9c", language: "Instrumental", genre: "Lo-fi", energy: "low" },
  ],

  Lonely: [
    // English
    { title: "All By Myself", artist: "Celine Dion", youtubeId: "NGrLb6W5YOM", language: "English", genre: "Pop", energy: "low" },
    { title: "Everybody Hurts", artist: "R.E.M.", youtubeId: "5rOiW_xY-kc", language: "English", genre: "Alternative", energy: "low" },
    { title: "Mad World", artist: "Gary Jules", youtubeId: "4N3N1MlvVc4", language: "English", genre: "Alternative", energy: "low" },
    { title: "Unsteady", artist: "X Ambassadors", youtubeId: "V0lw3qylVfY", language: "English", genre: "Pop", energy: "low" },
    // Bollywood
    { title: "Tum Se Hi", artist: "Mohit Chauhan", youtubeId: "bv_kEG-dEiI", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Janam Janam", artist: "Arijit Singh", youtubeId: "6VyVm4bgDV4", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Kabira", artist: "Arijit Singh & Tochi Raina", youtubeId: "jHNNMj5bNQw", language: "Hindi", genre: "Bollywood", energy: "low" },
    // South Indian
    { title: "Vinnaithaandi Varuvaaya", artist: "A.R. Rahman", youtubeId: "8h_xEfm-wqE", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Ye Maaya Chesave", artist: "A.R. Rahman", youtubeId: "v8TNFVZ7eBo", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "Gymnopédie No.1", artist: "Erik Satie", youtubeId: "S-Xm7s9eGxU", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Solitude Lo-fi", artist: "Lofi Girl", youtubeId: "jfKfPfyJRdk", language: "Instrumental", genre: "Lo-fi", energy: "low" },
  ],

  Tired: [
    // English
    { title: "The Sound of Silence", artist: "Disturbed", youtubeId: "u9Dg-g7t2l4", language: "English", genre: "Rock", energy: "low" },
    { title: "Skinny Love", artist: "Bon Iver", youtubeId: "ssdgFoHLwnk", language: "English", genre: "Indie", energy: "low" },
    { title: "Stay", artist: "Rihanna", youtubeId: "JF8BRvqGCNs", language: "English", genre: "Pop", energy: "low" },
    { title: "Holocene", artist: "Bon Iver", youtubeId: "TWcyIpul8OE", language: "English", genre: "Indie", energy: "low" },
    // Bollywood
    { title: "Tum Ho Toh", artist: "Mohit Chauhan", youtubeId: "3sD2jXHMaVY", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Iktara", artist: "Amit Trivedi", youtubeId: "fSS_HFlnUIc", language: "Hindi", genre: "Bollywood", energy: "low" },
    { title: "Mann Mera", artist: "Gajendra Verma", youtubeId: "xVBDcOo_mdQ", language: "Hindi", genre: "Indie Hindi", energy: "low" },
    // South Indian
    { title: "Oru Naal Koothu", artist: "Sean Roldan", youtubeId: "3uM0mCwQi6I", language: "Tamil", genre: "Kollywood", energy: "low" },
    { title: "Nuvvunte Naa Jathaga", artist: "Anand Aravindakshan", youtubeId: "KdWAV7-vRq0", language: "Telugu", genre: "Tollywood", energy: "low" },
    // Instrumental
    { title: "Moonlight Sonata", artist: "Beethoven", youtubeId: "4Tr0otuiQuU", language: "Instrumental", genre: "Instrumental", energy: "low" },
    { title: "Sleepy Lo-fi Rain", artist: "Lofi Girl", youtubeId: "jfKfPfyJRdk", language: "Instrumental", genre: "Lo-fi", energy: "low" },
    { title: "Ambient Sleep Music", artist: "Soothing Relaxation", youtubeId: "lFcSrYw-ARY", language: "Instrumental", genre: "Ambient", energy: "low" },
  ],

  Neutral: [
    // English
    { title: "Counting Stars", artist: "OneRepublic", youtubeId: "hT_nvWreIhg", language: "English", genre: "Pop", energy: "medium" },
    { title: "Viva La Vida", artist: "Coldplay", youtubeId: "dvgZkm1xWPE", language: "English", genre: "Alternative", energy: "medium" },
    { title: "Sugar", artist: "Maroon 5", youtubeId: "09R8_2nJtjg", language: "English", genre: "Pop", energy: "medium" },
    { title: "Photograph", artist: "Ed Sheeran", youtubeId: "nSDgHBxUbVQ", language: "English", genre: "Pop", energy: "medium" },
    // Bollywood
    { title: "Tere Bina", artist: "A.R. Rahman", youtubeId: "q8-d2g8l7lE", language: "Hindi", genre: "Bollywood", energy: "medium" },
    { title: "Hasi Ban Gaye", artist: "Ami Mishra", youtubeId: "jPJOABrS0YQ", language: "Hindi", genre: "Bollywood", energy: "medium" },
    { title: "Pehla Nasha", artist: "Udit Narayan & Sadhana Sargam", youtubeId: "8ofCZObqiVw", language: "Hindi", genre: "Bollywood", energy: "medium" },
    // South Indian
    { title: "Why This Kolaveri Di", artist: "Dhanush", youtubeId: "YR12Z8f1Dh8", language: "Tamil", genre: "Kollywood", energy: "medium" },
    { title: "Seethakalam", artist: "S.P. Charan", youtubeId: "1ry6F54M9ek", language: "Telugu", genre: "Tollywood", energy: "medium" },
    // Instrumental
    { title: "To Build A Home", artist: "The Cinematic Orchestra", youtubeId: "oUFJJNQGwhk", language: "Instrumental", genre: "Instrumental", energy: "medium" },
    { title: "Afternoon Lo-fi Jazz", artist: "Cafe Music BGM", youtubeId: "sPlhKP0nZII", language: "Instrumental", genre: "Lo-fi", energy: "medium" },
  ],
};

// ===============================
// SPOTIFY PLAYLISTS
// ===============================
export const spotifyPlaylists = {
  Happy: "https://open.spotify.com/playlist/37i9dQZF1DX0s5kDXi1oC5",
  Sad: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",
  Angry: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
  Calm: "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",
  Excited: "https://open.spotify.com/playlist/37i9dQZF1DX1s9knjP51Oa",
  Anxious: "https://open.spotify.com/playlist/37i9dQZF1DWVrtsSlLKzro",
  Stressed: "https://open.spotify.com/playlist/37i9dQZF1DWVrtsSlLKzro",
  Lonely: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1",
  Tired: "https://open.spotify.com/playlist/37i9dQZF1DX3PIPIT6lEg5",
  Neutral: "https://open.spotify.com/playlist/37i9dQZF1DX0s5kDXi1oC5",
};

// ===============================
// MOTIVATIONAL QUOTES BY MOOD
// ===============================
export const motivationalQuotes = {
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
  Stressed: [
    { quote: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
    { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { quote: "Stress is caused by being 'here' but wanting to be 'there'.", author: "Eckhart Tolle" },
    { quote: "It's not the load that breaks you down, it's the way you carry it.", author: "Lou Holtz" },
    { quote: "Take a deep breath. You are enough.", author: "Unknown" },
  ],
  Lonely: [
    { quote: "The soul that sees beauty may sometimes walk alone.", author: "Johann Wolfgang von Goethe" },
    { quote: "Loneliness is the poverty of self; solitude is the richness of self.", author: "May Sarton" },
    { quote: "You are never alone. You are eternally connected with everyone.", author: "Amit Ray" },
    { quote: "Being alone has a power that very few people can handle.", author: "Steven Aitchison" },
    { quote: "Sometimes you need to be alone, not to be lonely, but to enjoy your free time being yourself.", author: "Unknown" },
  ],
  Tired: [
    { quote: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", author: "Ralph Marston" },
    { quote: "It's okay to pause and take a breath.", author: "Unknown" },
    { quote: "Your body is your most priceless possession. Take care of it.", author: "Jack LaLanne" },
    { quote: "Sleep is the best meditation.", author: "Dalai Lama" },
    { quote: "Sometimes the most productive thing you can do is rest.", author: "Unknown" },
  ],
  Neutral: [
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { quote: "The present moment is filled with joy and happiness. If you are attentive, you will see it.", author: "Thich Nhat Hanh" },
    { quote: "Not all those who wander are lost.", author: "J.R.R. Tolkien" },
    { quote: "Enjoy the little things, for one day you may look back and realize they were the big things.", author: "Robert Brault" },
    { quote: "Peace is always beautiful.", author: "Walt Whitman" },
  ],
};

// Mood color mapping
export const moodColors = {
  Happy: { badge: "bg-amber-500 text-white", gradient: "from-amber-500 to-yellow-500" },
  Sad: { badge: "bg-blue-500 text-white", gradient: "from-blue-500 to-indigo-500" },
  Angry: { badge: "bg-rose-600 text-white", gradient: "from-rose-600 to-red-600" },
  Calm: { badge: "bg-teal-500 text-white", gradient: "from-teal-500 to-emerald-500" },
  Excited: { badge: "bg-orange-500 text-white", gradient: "from-orange-500 to-rose-500" },
  Anxious: { badge: "bg-purple-500 text-white", gradient: "from-purple-500 to-pink-500" },
  Stressed: { badge: "bg-red-400 text-white", gradient: "from-red-400 to-orange-400" },
  Lonely: { badge: "bg-slate-500 text-white", gradient: "from-slate-500 to-blue-400" },
  Tired: { badge: "bg-indigo-400 text-white", gradient: "from-indigo-400 to-blue-300" },
  Neutral: { badge: "bg-gray-500 text-white", gradient: "from-gray-500 to-slate-400" },
};

export default musicLibrary;
