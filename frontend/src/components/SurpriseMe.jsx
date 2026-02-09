import { motion } from "framer-motion";
import { useState } from "react";

// Mini-game components
function GuessTheGenre({ onEnd }) {
  return (
    <div className="text-white">
      <h4 className="text-xl font-bold mb-2">Guess the Genre!</h4>
      <p className="mb-4">Listen to the clip and choose the correct genre.</p>
      {/* Add actual game logic here */}
      <button onClick={onEnd} className="px-4 py-2 bg-red-600 rounded-lg">Close</button>
    </div>
  );
}

function RateIn3Words({ onEnd }) {
  return (
    <div className="text-white">
      <h4 className="text-xl font-bold mb-2">Rate in 3 Words</h4>
      <p className="mb-4">Describe the song you just heard in three words.</p>
      <input type="text" className="w-full p-2 rounded bg-gray-700 mb-4" placeholder="e.g., Upbeat, Fun, Catchy" />
      <button onClick={onEnd} className="px-4 py-2 bg-red-600 rounded-lg">Submit & Close</button>
    </div>
  );
}

const games = [
  {
    title: "Guess the Genre",
    description: "Listen to a short clip and guess the genre. Can you get 3 in a row?",
    buttonText: "Play Now",
    component: GuessTheGenre,
  },
  {
    title: "Rate in 3 Words",
    description: "Describe a song using only three words. See what others have said!",
    buttonText: "Start Rating",
    component: RateIn3Words,
  },
  {
    title: "Find Hidden Themes",
    description: "Explore a playlist and uncover the hidden theme connecting the songs.",
    buttonText: "Begin Hunt",
    component: GuessTheGenre, // Placeholder, can be its own component
  },
];

function SurpriseMe() {
  const [randomGame, setRandomGame] = useState(null);
  const [showGame, setShowGame] = useState(false);

  const startGame = () => {
    setRandomGame(games[Math.floor(Math.random() * games.length)]);
    setShowGame(true);
  };

  const endGame = () => {
    setShowGame(false);
    setRandomGame(null);
  };

  const GameComponent = randomGame?.component;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl shadow-xl mt-10 max-w-4xl mx-auto text-center"
      >
        <h3 className="text-2xl font-bold text-white mb-3">🎲 Surprise & Gamified Exploration</h3>
        <p className="text-gray-200 mb-4">
          Ready for a challenge? Try one of our interactive music mini-games!
        </p>
        <button
          onClick={startGame}
          className="px-6 py-2 bg-white text-purple-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
        >
          Surprise Me!
        </button>
      </motion.div>

      {showGame && GameComponent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <GameComponent onEnd={endGame} />
          </motion.div>
        </div>
      )}
    </>
  );
}

export default SurpriseMe;
