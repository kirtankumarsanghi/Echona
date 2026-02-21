import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { cachedFetch } from "../utils/cache";  // #28 cache search results

function SpotifySearch({ accessToken, deviceId, onPlayTrack }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playingUri, setPlayingUri] = useState(null);

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const searchTracks = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(""); // Clear any previous errors
    
    try {
      // Search works with or without user token (backend uses Client Credentials as fallback)
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      // #28 Cache search results for 5 minutes to reduce API calls
      const cacheKey = `spotify_search_${query.trim().toLowerCase()}`;
      const response = await cachedFetch(
        cacheKey,
        () => axiosInstance.get(
          `/api/spotify/search?q=${encodeURIComponent(query)}`,
          { headers, timeout: 15000 }
        ),
        5 * 60 * 1000
      );
      
      if (response.data.tracks && response.data.tracks.items) {
        setResults(response.data.tracks.items);
        // Clear error on successful search
        setError("");
        if (response.data.tracks.items.length === 0) {
          setError(`No results found for "${query}"`);
        }
      } else {
        setResults([]);
        setError("No results found");
      }
    } catch (error) {
      console.error("Search error:", error);
      
      if (error.code === 'ECONNABORTED') {
        setError("Request timeout. Check your internet connection.");
      } else if (error.message.includes("Network Error")) {
        setError("Backend not responding. Make sure the backend is running.");
      } else {
        setError(error.response?.data?.message || error.response?.data?.error || "Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (trackUri) => {
    if (!accessToken) {
      setError("Connect to Spotify to play tracks. Search works without login!");
      return;
    }

    if (!deviceId) {
      setError("Waiting for Spotify player to initialize... If it takes too long, make sure you have Spotify Premium.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      setPlayingUri(trackUri);

      await axiosInstance.post(
        `/api/spotify/play`,
        { deviceId, trackUri },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        }
      );
      if (onPlayTrack) onPlayTrack();
      setError("");
    } catch (error) {
      console.error("Play error:", error);
      setPlayingUri(null);
      
      if (error.response?.status === 404) {
        setError("No active device found. The Web Player is loading or you need to open the Spotify app.");
      } else if (error.response?.status === 403) {
        setError("Spotify Premium is required for playback control.");
      } else if (error.response?.status === 401) {
        setError("Session expired. Please reconnect to Spotify.");
      } else {
        setError(error.response?.data?.message || "Failed to play track.");
      }
    }
  };

  const openInSpotify = (trackUri) => {
    // Convert spotify:track:ID to web URL
    const trackId = trackUri.split(":").pop();
    window.open(`https://open.spotify.com/track/${trackId}`, "_blank");
  };

  const formatDuration = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-green-500/20 rounded-xl">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Search Spotify</h3>
            <p className="text-xs text-gray-400">Search millions of tracks instantly</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-300 text-sm flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-white transition-colors p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={searchTracks} className="px-6 pb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Clear error when user starts typing again
                if (error) setError("");
              }}
              placeholder="Search songs, artists, albums..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-800/80 text-white border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 placeholder-gray-500 text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 disabled:hover:shadow-none flex items-center gap-2 text-sm"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>
      </form>

      {/* Info Banner - Connect to Play */}
      {results.length > 0 && !accessToken && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-semibold mb-1">Play songs directly in your browser</h4>
              <p className="text-gray-400 text-xs mb-3">
                <span className="font-semibold text-green-400">Click "Connect to Spotify"</span> at the top of this page to play tracks. 
                <span className="block mt-1 text-gray-500">Requires: Spotify Premium account</span>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Go to Connect Button
                </a>
                <span className="text-gray-500 text-[10px]">or use "Open in Spotify" for each track</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="border-t border-gray-700/50 mt-4">
          <div className="px-6 py-3 flex items-center justify-between bg-gray-800/30">
            <p className="text-gray-400 text-xs font-medium">{results.length} tracks found</p>
            {accessToken && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Spotify Connected
              </span>
            )}
          </div>
          <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
            {results.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-all group border-b border-gray-800/50 last:border-0"
              >
                {/* Index */}
                <span className="text-gray-600 text-sm font-mono w-7 text-right flex-shrink-0 group-hover:text-green-400 transition-colors">
                  {index + 1}
                </span>

                {/* Album Cover with Play Overlay */}
                <div className="relative flex-shrink-0">
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url || ""}
                    alt={track.album.name}
                    className="w-12 h-12 rounded-lg shadow-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => accessToken ? playTrack(track.uri) : openInSpotify(track.uri)}
                      className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold truncate group-hover:text-green-300 transition-colors">
                    {track.name}
                  </h4>
                  <p className="text-gray-500 text-xs truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                    <span className="text-gray-600 mx-1">--</span>
                    <span className="text-gray-600">{track.album.name}</span>
                  </p>
                </div>

                {/* Badges & Info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {track.explicit && (
                    <span className="px-1.5 py-0.5 bg-gray-700/80 text-gray-400 text-[10px] font-bold rounded uppercase">E</span>
                  )}

                  {/* Popularity Bar */}
                  <div className="hidden sm:flex items-center gap-1.5 w-20" title={`Popularity: ${track.popularity}%`}>
                    <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          track.popularity > 70 ? 'bg-green-500' : 
                          track.popularity > 40 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${track.popularity}%` }}
                      />
                    </div>
                    <span className="text-gray-600 text-[10px] w-6">{track.popularity}</span>
                  </div>

                  {/* Duration */}
                  <span className="text-gray-500 text-xs font-mono w-10 text-right hidden sm:block">
                    {formatDuration(track.duration_ms)}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {accessToken && (
                      <button
                        onClick={() => playTrack(track.uri)}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg hover:shadow-green-500/30 transition-all"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Play
                      </button>
                    )}
                    <button
                      onClick={() => openInSpotify(track.uri)}
                      className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Open in Spotify"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !loading && !error && (
        <div className="text-center py-10 px-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-800/80 mb-3">
            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">Search for any song, artist, or album</p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
}

export default SpotifySearch;
