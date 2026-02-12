import { useState } from "react";

export default function MiniChallenge({ correctMood }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  const submitAnswer = async () => {
    const isCorrect =
      answer.toLowerCase() === correctMood.toLowerCase();

    const res = await fetch(
      "http://localhost:5001/api/game/submit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: "demo",
          correct: isCorrect
        })
      }
    );

    const data = await res.json();
    setResult(data);
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
    </div>
  );
}
