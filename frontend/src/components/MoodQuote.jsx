import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const quotes = {
  Happy: [
    "Happiness is not something ready made. It comes from your own actions. - Dalai Lama",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "Happiness is when what you think, what you say, and what you do are in harmony. - Gandhi"
  ],
  Sad: [
    "Tears are words that need to be written. - Paulo Coelho",
    "The word 'happy' would lose its meaning if it were not balanced by sadness. - Carl Jung",
    "Every human walks around with a certain kind of sadness. They may not wear it on their sleeves, but it's there. - Taraji P. Henson"
  ],
  Angry: [
    "For every minute you remain angry, you give up sixty seconds of peace of mind. - Emerson",
    "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured. - Mark Twain",
    "When angry, count to ten before you speak. If very angry, count to one hundred. - Jefferson"
  ],
  Calm: [
    "Within you, there is a stillness and a sanctuary to which you can retreat at any time. - Hermann Hesse",
    "Calmness is the cradle of power. - Josiah Gilbert Holland",
    "The nearer a man comes to a calm mind, the closer he is to strength. - Marcus Aurelius"
  ],
  Excited: [
    "Excitement is the spark that ignites the fire of passion. - Unknown",
    "Life is either a daring adventure or nothing at all. - Helen Keller",
    "The only way to do great work is to love what you do. - Steve Jobs"
  ],
  Anxious: [
    "Anxiety does not empty tomorrow of its sorrows, but only empties today of its strength. - Spurgeon",
    "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne",
    "Worry does not empty tomorrow of its sorrow, it empties today of its strength. - Corrie Ten Boom"
  ]
};

const MoodQuote = ({ mood }) => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    if (mood && quotes[mood]) {
      const randomQuote = quotes[mood][Math.floor(Math.random() * quotes[mood].length)];
      setQuote(randomQuote);
    }
  }, [mood]);

  if (!quote) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">💭</span>
        <div>
          <p className="text-gray-200 italic leading-relaxed">{quote}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MoodQuote;
