import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function MiniChallenge({ correctMood }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submitAnswer = async () => {
    const isCorrect =
      answer.toLowerCase() === correctMood.toLowerCase();

    try {
      setError("");
      const { data } = await axiosInstance.post("/api/game/submit", {
        correct: isCorrect,
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not submit challenge");
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-2">
        🎯 Guess the Mood
      </h3>

      <input
        className="p-2 text-black w-full"
        placeholder="Enter mood (happy, sad, calm...)"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <button
        onClick={submitAnswer}
        className="mt-3 bg-orange-500 px-4 py-2 rounded"
      >
        Submit
      </button>

      {result && (
        <div className="mt-3">
          <p>⭐ Score: {result.score}</p>
          {result.badges.length > 0 && (
            <p>🏅 Badge: {result.badges.join(", ")}</p>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
