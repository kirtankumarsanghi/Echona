import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSpotifyTokens } from "../utils/auth";

const Callback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const errorMsg = params.get("error");

    if (errorMsg) {
      console.warn("[Spotify Callback] Error:", errorMsg);
      setError("Spotify authentication failed. You can still use the app without Spotify.");
      setTimeout(() => navigate("/music"), 3000);
      return;
    }

    if (accessToken) {
      saveSpotifyTokens(accessToken, refreshToken);
      navigate("/music");
    } else {
      setError("No access token received from Spotify.");
      setTimeout(() => navigate("/music"), 3000);
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen centered-layout">
        <div className="card-premium p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-neutral-100 text-lg font-semibold mb-2">Spotify Connection Issue</p>
          <p className="text-neutral-300 text-sm">{error}</p>
          <p className="text-neutral-500 text-xs mt-4">Redirecting to music page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen centered-layout">
      <div className="card-premium p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-purple-400 mx-auto"></div>
        <p className="text-neutral-100 mt-4 font-semibold">Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default Callback;
