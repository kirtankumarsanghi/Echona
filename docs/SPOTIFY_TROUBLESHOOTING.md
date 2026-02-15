# Spotify Search - Troubleshooting Guide

## ✅ PERMANENT FIXES APPLIED

### 1. Enhanced Error Handling
- **User-friendly error messages** - No more generic "Failed to search"
- **Visual error display** - Red banner with icon and dismiss button
- **Specific error codes** - Each error type has its own message

### 2. Automatic Token Refresh
- **Expired token detection** - Automatically detects 401 errors
- **Auto-refresh mechanism** - Uses refresh token to get new access token
- **Retry logic** - Automatically retries failed request with new token
- **Fallback** - Prompts reconnection if refresh fails

### 3. Improved Network Handling
- **10-second timeout** - Prevents hanging requests
- **localhost usage** - No more 127.0.0.1 vs localhost conflicts
- **Connection detection** - Identifies backend/network issues
- **Detailed messages** - Tells user exactly what's wrong

### 4. Backend Logging
All Spotify API calls are now logged:
```
🔍 Search request: "song name"
✅ Search successful: Found 10 tracks
❌ Search failed: Token expired
```

## 🔍 Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Session expired. Please reconnect to Spotify." | Access token expired | Auto-refreshed automatically, or click "Connect to Spotify" |
| "Backend server is not responding." | Backend not running | Run `cd backend && npm run dev` |
| "Too many requests. Please wait a moment." | Spotify rate limit (429) | Wait 30 seconds and try again |
| "Premium account required for this feature." | Using free Spotify account | Upgrade to Spotify Premium |
| "Device not found. Make sure Spotify is open." | No active Spotify device | Open Spotify desktop/mobile app |
| "Request timeout. Check your internet connection." | Network timeout | Check internet connection |
| "No results found for 'query'" | No matching tracks | Try different search terms |
| "Please enter a search query" | Empty search | Type something in search box |

## 🚀 How to Test

1. **Go to Music Page**: http://localhost:3000/music
2. **Connect Spotify**: Click "Connect to Spotify" if not already connected
3. **Search**: Type any song/artist name and click Search
4. **Expected**: Either results appear OR specific error message shows

## 🔧 Quick Fixes

### If search still fails:

1. **Check Backend**:
   ```powershell
   # Check if running
   Invoke-WebRequest http://localhost:5000/health
   
   # Restart if needed
   cd backend
   npm run dev
   ```

2. **Check Frontend**:
   ```powershell
   # Frontend should be on port 3000
   # If not running:
   cd frontend
   npm run dev
   ```

3. **Check Spotify Token**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `localStorage.getItem("spotify_token")`
   - If null, reconnect to Spotify

4. **Clear and Reconnect**:
   ```javascript
   // In browser console:
   localStorage.removeItem("spotify_token");
   localStorage.removeItem("spotify_refresh_token");
   // Then click "Connect to Spotify" again
   ```

## 📊 Backend Logs to Watch

When you search, you should see:
```
🔍 Search request: "your search"
✅ Search successful: Found X tracks
```

If error occurs:
```
❌ Search failed: [specific reason]
⚠️  No token provided in search request
```

## 🎯 What Changed

### Frontend (SpotifySearch.jsx)
- Added `getBackendUrl()` function for localhost
- Implemented `refreshToken()` for automatic refresh
- Enhanced error handling with specific error types
- Added error state and visual display
- 10-second timeout on requests
- Token validation before requests

### Backend (server.js)
- Console logging for all search requests
- Specific error codes (401, 403, 404, 429)
- Detailed error messages
- Better Spotify API error handling
- Request validation

## ⚡ Performance Improvements
- Timeout prevents hanging requests
- Automatic token refresh reduces reconnection needs
- Better error messages reduce support requests
- Logging helps identify issues quickly

## 💡 Pro Tips

1. **Premium Account**: Spotify Web Playback SDK requires Spotify Premium
2. **Active Device**: Keep Spotify app open for playback features
3. **Token Refresh**: Tokens auto-refresh, no manual action needed
4. **Error Logs**: Check browser console for detailed error info
5. **Backend Logs**: Check terminal for backend error details

## 📱 Test Scenarios

Test these to verify everything works:

1. ✅ **Normal search**: Should return results
2. ✅ **Empty search**: Should show "Please enter a search query"
3. ✅ **No results**: Should show "No results found for 'xyz'"
4. ✅ **Backend down**: Should show "Backend server is not responding"
5. ✅ **Token expired**: Should auto-refresh and retry
6. ✅ **Network timeout**: Should show connection error after 10s

---

**Last Updated**: Fixed and tested
**Status**: All issues resolved ✅
