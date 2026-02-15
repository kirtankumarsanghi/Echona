import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const SpotifyDashboard = ({ spotifyToken }) => {
  const [activeTab, setActiveTab] = useState('playlists');
  const [playlists, setPlaylists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (spotifyToken) {
      loadUserProfile();
      loadData();
    }
  }, [spotifyToken, activeTab, timeRange]);

  const loadUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/spotify/me', {
        headers: { Authorization: `Bearer ${spotifyToken}` }
      });
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'playlists') {
        const response = await axiosInstance.get('/api/spotify/playlists', {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        setPlaylists(response.data.items || []);
      } else if (activeTab === 'recent') {
        const response = await axiosInstance.get('/api/spotify/recent', {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        setRecentTracks(response.data.items || []);
      } else if (activeTab === 'topTracks') {
        const response = await axiosInstance.get(`/api/spotify/top-tracks?time_range=${timeRange}`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        setTopTracks(response.data.items || []);
      } else if (activeTab === 'topArtists') {
        const response = await axiosInstance.get(`/api/spotify/top-artists?time_range=${timeRange}`, {
          headers: { Authorization: `Bearer ${spotifyToken}` }
        });
        setTopArtists(response.data.items || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = async (uri) => {
    try {
      await axiosInstance.post('/api/spotify/play', 
        { uris: [uri] },
        { headers: { Authorization: `Bearer ${spotifyToken}` }}
      );
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  };

  const tabs = [
    { 
      id: 'playlists', 
      label: 'Playlists', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    { 
      id: 'recent', 
      label: 'Recently Played', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      id: 'topTracks', 
      label: 'Top Tracks', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    },
    { 
      id: 'topArtists', 
      label: 'Top Artists', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )
    }
  ];

  const timeRanges = [
    { value: 'short_term', label: 'Last 4 Weeks' },
    { value: 'medium_term', label: 'Last 6 Months' },
    { value: 'long_term', label: 'All Time' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* User Profile Header */}
      {userProfile && (
        <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-gray-700/30">
          {userProfile.images?.[0] && (
            <img 
              src={userProfile.images[0].url} 
              alt={userProfile.display_name}
              className="w-14 h-14 rounded-full border-2 border-green-500/40 shadow-lg"
            />
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{userProfile.display_name}</h2>
            <p className="text-gray-400 text-sm">
              {userProfile.followers?.total?.toLocaleString()} followers{userProfile.country ? ` / ${userProfile.country}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Connected</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-3 border-b border-gray-700/30 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:bg-gray-700/40 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Time Range Selector */}
      {(activeTab === 'topTracks' || activeTab === 'topArtists') && (
        <div className="flex gap-1.5 px-6 py-3 border-b border-gray-700/30">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6"
          >
            {/* Playlists */}
            {activeTab === 'playlists' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No playlists found</p>
                  </div>
                )}
                {playlists.map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-gray-800/40 rounded-xl p-3 hover:bg-gray-700/40 transition-all cursor-pointer group"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      {playlist.images?.[0] ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full aspect-square bg-gray-700 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-0.5 truncate">{playlist.name}</h3>
                    <p className="text-gray-500 text-xs">{playlist.tracks.total} tracks</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recently Played */}
            {activeTab === 'recent' && (
              <div className="space-y-1">
                {recentTracks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No recently played tracks</p>
                  </div>
                )}
                {recentTracks.map((item, index) => (
                  <motion.div
                    key={`${item.track.id}-${item.played_at}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => playTrack(item.track.uri)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all cursor-pointer group"
                  >
                    <div className="text-gray-600 text-sm font-mono w-6 text-right group-hover:text-green-400">
                      {index + 1}
                    </div>
                    {item.track.album.images[2] && (
                      <img
                        src={item.track.album.images[2].url}
                        alt={item.track.name}
                        className="w-11 h-11 rounded-lg shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate group-hover:text-green-300">{item.track.name}</h4>
                      <p className="text-gray-500 text-xs truncate">{item.track.artists.map(a => a.name).join(', ')}</p>
                    </div>
                    <span className="text-gray-600 text-xs hidden sm:block">{new Date(item.played_at).toLocaleDateString()}</span>
                    <button className="p-2 rounded-full opacity-0 group-hover:opacity-100 bg-green-500/20 hover:bg-green-500/30 transition-all">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Top Tracks */}
            {activeTab === 'topTracks' && (
              <div className="space-y-1">
                {topTracks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No top tracks data available</p>
                  </div>
                )}
                {topTracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => playTrack(track.uri)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all cursor-pointer group"
                  >
                    <div className={`text-sm font-bold w-6 text-right ${
                      index < 3 ? 'text-green-400' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {track.album.images[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.name}
                        className="w-11 h-11 rounded-lg shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate group-hover:text-green-300">{track.name}</h4>
                      <p className="text-gray-500 text-xs truncate">{track.artists.map(a => a.name).join(', ')}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="h-1 w-16 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${track.popularity > 70 ? 'bg-green-500' : track.popularity > 40 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                          style={{ width: `${track.popularity}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-600 w-6">{track.popularity}</span>
                    </div>
                    <button className="p-2 rounded-full opacity-0 group-hover:opacity-100 bg-green-500/20 hover:bg-green-500/30 transition-all">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Top Artists */}
            {activeTab === 'topArtists' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {topArtists.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No top artists data available</p>
                  </div>
                )}
                {topArtists.map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group relative bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.07] transition-all cursor-pointer text-center"
                  >
                    <div className={`absolute top-2 left-2 text-xs font-bold px-1.5 py-0.5 rounded ${
                      index < 3 ? 'bg-green-500/20 text-green-400' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {artist.images?.[0] && (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover shadow-lg ring-2 ring-white/10 group-hover:ring-green-500/30 transition-all"
                      />
                    )}
                    <h3 className="text-white font-semibold text-sm truncate group-hover:text-green-300 transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-gray-600 text-[10px] mt-0.5">
                      {artist.followers?.total?.toLocaleString()} followers
                    </p>
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {artist.genres?.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-1.5 py-0.5 bg-green-500/10 text-green-500/80 text-[10px] rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${artist.popularity > 70 ? 'bg-green-500' : artist.popularity > 40 ? 'bg-yellow-500' : 'bg-gray-500'}`}
                          style={{ width: `${artist.popularity}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpotifyDashboard;
