import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function MoodQuiz({ mood, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Comprehensive quiz questions for each mood type
  const quizData = {
    Happy: [
      {
        question: "Which Bollywood movie features the song 'Kar Gayi Chull'?",
        options: ["Kapoor & Sons", "Yeh Jawaani Hai Deewani", "Student of the Year", "Ae Dil Hai Mushkil"],
        correct: 0
      },
      {
        question: "What emotion is typically associated with upbeat tempo music?",
        options: ["Sadness", "Joy and Excitement", "Anger", "Anxiety"],
        correct: 1
      },
      {
        question: "'Happy' by Pharrell Williams was featured in which animated movie?",
        options: ["Frozen", "Despicable Me 2", "Minions", "Toy Story 3"],
        correct: 1
      },
      {
        question: "Which of these is a characteristic of happy mood music?",
        options: ["Slow tempo and minor chords", "Fast tempo and major chords", "No rhythm", "Only instrumental"],
        correct: 1
      },
      {
        question: "The song 'Balam Pichkari' is from which movie?",
        options: ["Dilwale Dulhania Le Jayenge", "Kabir Singh", "Yeh Jawaani Hai Deewani", "Bajirao Mastani"],
        correct: 2
      }
    ],
    Sad: [
      {
        question: "Which movie features the emotional song 'Tum Hi Ho'?",
        options: ["Aashiqui 2", "Kal Ho Naa Ho", "Kabir Singh", "Ae Dil Hai Mushkil"],
        correct: 0
      },
      {
        question: "What musical element is common in sad songs?",
        options: ["Fast tempo", "Minor key and slow tempo", "Heavy drums", "Electronic beats"],
        correct: 1
      },
      {
        question: "'Someone Like You' by Adele is in which music genre?",
        options: ["Rock", "Pop/Soul", "Jazz", "Country"],
        correct: 1
      },
      {
        question: "Which emotion helps process sadness healthily?",
        options: ["Suppressing feelings", "Acknowledging and expressing emotions", "Ignoring it", "Pretending to be happy"],
        correct: 1
      },
      {
        question: "The song 'Channa Mereya' is from which film?",
        options: ["Ae Dil Hai Mushkil", "Yeh Jawaani Hai Deewani", "Tamasha", "Rockstar"],
        correct: 0
      }
    ],
    Angry: [
      {
        question: "Which genre typically expresses anger in music?",
        options: ["Classical", "Rock/Metal", "Jazz", "Lullaby"],
        correct: 1
      },
      {
        question: "What tempo characterizes angry music?",
        options: ["Very slow", "Moderate", "Fast and aggressive", "No tempo"],
        correct: 2
      },
      {
        question: "'Apna Time Aayega' from Gully Boy expresses what emotion?",
        options: ["Sadness", "Determination and raw energy", "Love", "Peace"],
        correct: 1
      },
      {
        question: "Which is a healthy way to manage anger?",
        options: ["Bottling it up", "Physical exercise and expression", "Taking it out on others", "Ignoring it completely"],
        correct: 1
      },
      {
        question: "Heavy drums and distorted guitars are common in which mood music?",
        options: ["Calm", "Sad", "Angry", "Happy"],
        correct: 2
      }
    ],
    Calm: [
      {
        question: "Which instrument is commonly used in calming music?",
        options: ["Heavy metal guitar", "Piano and strings", "Loud drums", "Electric synthesizer"],
        correct: 1
      },
      {
        question: "'Weightless' by Marconi Union was scientifically designed for what?",
        options: ["Dancing", "Relaxation and stress reduction", "Exercise", "Concentration"],
        correct: 1
      },
      {
        question: "What BPM (beats per minute) is ideal for calm music?",
        options: ["120-140", "60-80", "140-180", "200+"],
        correct: 1
      },
      {
        question: "Which Bollywood song is known for its peaceful vibe?",
        options: ["Kar Gayi Chull", "Tum Se Hi", "Lungi Dance", "Badtameez Dil"],
        correct: 1
      },
      {
        question: "Nature sounds in music promote which feeling?",
        options: ["Excitement", "Tranquility and peace", "Fear", "Energy"],
        correct: 1
      }
    ],
    Excited: [
      {
        question: "Which movie features the high-energy song 'Gallan Goodiyaan'?",
        options: ["Dil Dhadakne Do", "ZNMD", "Rock On", "Dil Chahta Hai"],
        correct: 0
      },
      {
        question: "'Can't Stop the Feeling' by Justin Timberlake is from which movie?",
        options: ["Frozen", "Trolls", "Moana", "Coco"],
        correct: 1
      },
      {
        question: "What characterizes excited mood music?",
        options: ["Slow and mellow", "Upbeat tempo and energetic rhythm", "Quiet and peaceful", "Monotonous"],
        correct: 1
      },
      {
        question: "EDM (Electronic Dance Music) is associated with which emotion?",
        options: ["Sadness", "Excitement and energy", "Sleepiness", "Anger"],
        correct: 1
      },
      {
        question: "The song 'Hookah Bar' creates what kind of mood?",
        options: ["Melancholic", "Party and excitement", "Romantic", "Peaceful"],
        correct: 1
      }
    ],
    Anxious: [
      {
        question: "Music therapy can help reduce anxiety by:",
        options: ["Increasing heart rate", "Promoting relaxation and mindfulness", "Creating more stress", "None of these"],
        correct: 1
      },
      {
        question: "Which is a symptom of anxiety that music can help with?",
        options: ["Increased happiness", "Racing thoughts and tension", "Better sleep", "More energy"],
        correct: 1
      },
      {
        question: "Breathing exercises combined with calm music help:",
        options: ["Increase anxiety", "Reduce stress and center focus", "Cause confusion", "Make you sleepy"],
        correct: 1
      },
      {
        question: "Which frequency is known for anxiety relief?",
        options: ["432 Hz", "800 Hz", "1000 Hz", "2000 Hz"],
        correct: 0
      },
      {
        question: "Mindfulness music typically includes:",
        options: ["Loud beats", "Soft, flowing melodies", "Heavy bass", "Fast rhythm"],
        correct: 1
      }
    ]
  };

  const questions = quizData[mood] || quizData.Happy;

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[currentQuestion].correct;
    
    const newAnswers = [...answers, {
      question: questions[currentQuestion].question,
      selected: answerIndex,
      correct: questions[currentQuestion].correct,
      isCorrect
    }];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        if (onComplete) {
          onComplete(score + (isCorrect ? 1 : 0), questions.length);
        }
      }
    }, 1000);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
  };

  const getScoreEmoji = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🌟";
    if (percentage >= 60) return "👍";
    if (percentage >= 40) return "😊";
    return "💪";
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect! You're a mood expert!";
    if (percentage >= 80) return "Excellent! Great knowledge!";
    if (percentage >= 60) return "Good job! Keep learning!";
    if (percentage >= 40) return "Not bad! Room for improvement!";
    return "Keep exploring! You'll get better!";
  };

  const getMoodColor = () => {
    const colors = {
      Happy: "from-yellow-500 to-orange-500",
      Sad: "from-blue-500 to-indigo-500",
      Angry: "from-red-500 to-orange-600",
      Calm: "from-green-500 to-teal-500",
      Excited: "from-pink-500 to-purple-500",
      Anxious: "from-purple-500 to-indigo-600"
    };
    return colors[mood] || "from-cyan-500 to-blue-500";
  };

  const getMoodEmoji = () => {
    const emojis = {
      Happy: "😊",
      Sad: "😢",
      Angry: "😠",
      Calm: "😌",
      Excited: "🤩",
      Anxious: "😰"
    };
    return emojis[mood] || "😊";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {!showResult ? (
          <>
            {/* Quiz Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getMoodEmoji()}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{mood} Mood Quiz</h2>
                  <p className="text-gray-400 text-sm">Test your music & mood knowledge!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQuestion + 1}/{questions.length}</span>
                <span>Score: {score}/{questions.length}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  className={`h-full bg-gradient-to-r ${getMoodColor()}`}
                />
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`bg-gradient-to-r ${getMoodColor()} rounded-2xl p-6 mb-6`}>
                  <p className="text-white text-xl font-semibold leading-relaxed">
                    {questions[currentQuestion].question}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === questions[currentQuestion].correct;
                    const showCorrect = selectedAnswer !== null && isCorrect;
                    const showIncorrect = selectedAnswer !== null && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: selectedAnswer === null ? 1.02 : 1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectedAnswer === null && handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                          showCorrect
                            ? "bg-green-500 text-white"
                            : showIncorrect
                            ? "bg-red-500 text-white"
                            : "bg-white/5 hover:bg-white/10 text-white"
                        } ${selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showCorrect && <span className="text-2xl">✓</span>}
                          {showIncorrect && <span className="text-2xl">✗</span>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Quiz Results */}
            <div className="text-center">
              <motion.div
                animate={{ scale: [0.8, 1.2, 1], rotate: [0, 360, 360] }}
                transition={{ duration: 1 }}
                className="text-8xl mb-6"
              >
                {getScoreEmoji()}
              </motion.div>
              
              <h2 className="text-4xl font-bold text-white mb-3">Quiz Complete!</h2>
              <p className="text-xl text-gray-300 mb-6">{getScoreMessage()}</p>

              {/* Score Display */}
              <div className={`bg-gradient-to-r ${getMoodColor()} rounded-2xl p-8 mb-6`}>
                <p className="text-white/80 text-sm mb-2">Your Score</p>
                <p className="text-6xl font-black text-white mb-2">
                  {score}/{questions.length}
                </p>
                <p className="text-white/90 text-lg">
                  {Math.round((score / questions.length) * 100)}% Correct
                </p>
              </div>

              {/* Review Answers */}
              <div className="bg-white/5 rounded-xl p-6 mb-6 max-h-64 overflow-y-auto">
                <h3 className="text-white font-bold mb-4 text-left">Answer Review:</h3>
                <div className="space-y-3">
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-left ${
                        answer.isCorrect ? "bg-green-500/20" : "bg-red-500/20"
                      }`}
                    >
                      <p className="text-white text-sm font-semibold mb-1">
                        Q{index + 1}: {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {questions[index].question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restartQuiz}
                  className={`flex-1 py-4 bg-gradient-to-r ${getMoodColor()} text-white rounded-xl font-semibold shadow-lg`}
                >
                  🔄 Retake Quiz
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold"
                >
                  ✓ Done
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MoodQuiz;
