import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicChallenges = ({ currentSong, mood }) => {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [recentReaction, setRecentReaction] = useState(null);
  const [points, setPoints] = useState(0);

  // Challenge database
  const challenges = {
    Happy: [
      { id: 'happy1', title: 'Smile Check', description: 'Smile for 10 seconds', points: 50, badge: 'GRIN' },
      { id: 'happy2', title: 'Dance Move', description: 'Do a happy dance', points: 75, badge: 'GROOVE' },
      { id: 'happy3', title: 'Spread Joy', description: 'Text someone something nice', points: 100, badge: 'SPARK' },
      { id: 'happy4', title: 'Gratitude Moment', description: 'Think of 3 things you\'re grateful for', points: 80, badge: 'THANKS' },
      { id: 'happy5', title: 'Energy Boost', description: 'Jump 10 times', points: 60, badge: 'JUMP' }
    ],
    Calm: [
      { id: 'calm1', title: 'Deep Breathing', description: 'Take 5 deep breaths', points: 75, badge: 'BREATH' },
      { id: 'calm2', title: 'Mindful Moment', description: 'Close eyes for 30 seconds', points: 50, badge: 'ZEN' },
      { id: 'calm3', title: 'Stretch Break', description: 'Stretch your arms and shoulders', points: 60, badge: 'FLEX' },
      { id: 'calm4', title: 'Water Break', description: 'Drink a glass of water', points: 40, badge: 'HYDRO' },
      { id: 'calm5', title: 'Body Scan', description: 'Relax each body part one by one', points: 90, badge: 'PEACE' }
    ],
    Excited: [
      { id: 'excited1', title: 'Power Pose', description: 'Hold a superhero pose for 15 seconds', points: 70, badge: 'HERO' },
      { id: 'excited2', title: 'Fist Pump', description: 'Do 5 enthusiastic fist pumps', points: 50, badge: 'PUMP' },
      { id: 'excited3', title: 'Shout It Out', description: 'Yell "YES!" 3 times', points: 60, badge: 'ROAR' },
      { id: 'excited4', title: 'Air Guitar', description: 'Rock out for 20 seconds', points: 80, badge: 'ROCK' },
      { id: 'excited5', title: 'Victory Lap', description: 'Run in place for 30 seconds', points: 90, badge: 'SPRINT' }
    ],
    Sad: [
      { id: 'sad1', title: 'Self Hug', description: 'Give yourself a hug', points: 60, badge: 'HUG' },
      { id: 'sad2', title: 'Kind Words', description: 'Say 3 nice things about yourself', points: 80, badge: 'KIND' },
      { id: 'sad3', title: 'Memory Lane', description: 'Recall a happy memory', points: 70, badge: 'RECALL' },
      { id: 'sad4', title: 'Tear Release', description: 'Let emotions flow naturally', points: 50, badge: 'FLOW' },
      { id: 'sad5', title: 'Future Vision', description: 'Imagine something to look forward to', points: 90, badge: 'HOPE' }
    ],
    Angry: [
      { id: 'angry1', title: 'Punch Air', description: 'Shadow box for 20 seconds', points: 70, badge: 'FIGHT' },
      { id: 'angry2', title: 'Scream Silent', description: 'Silent scream (mouth open)', points: 60, badge: 'VENT' },
      { id: 'angry3', title: 'Squeeze Stress', description: 'Clench fists then release 5 times', points: 50, badge: 'GRIP' },
      { id: 'angry4', title: 'Stomp It Out', description: 'Stomp your feet 10 times', points: 65, badge: 'STOMP' },
      { id: 'angry5', title: 'Cool Down', description: 'Count backwards from 10', points: 80, badge: 'CHILL' }
    ],
    Anxious: [
      { id: 'anxious1', title: '5-4-3-2-1', description: 'Name 5 things you see, 4 you hear, 3 you touch', points: 100, badge: 'AWARE' },
      { id: 'anxious2', title: 'Box Breathing', description: 'Breathe in 4, hold 4, out 4, hold 4', points: 90, badge: 'BOX' },
      { id: 'anxious3', title: 'Ground Yourself', description: 'Feel your feet on the ground', points: 60, badge: 'GROUND' },
      { id: 'anxious4', title: 'Hand On Heart', description: 'Place hand on heart, breathe slowly', points: 70, badge: 'HEART' },
      { id: 'anxious5', title: 'Release Tension', description: 'Shake out your hands and arms', points: 50, badge: 'SHAKE' }
    ]
  };

  // Badge designs with warm colors
  const badgeStyles = {
    GRIN: 'from-amber-500 to-yellow-500',
    GROOVE: 'from-orange-500 to-rose-500',
    SPARK: 'from-amber-400 to-orange-400',
    THANKS: 'from-amber-500 to-yellow-600',
    JUMP: 'from-orange-400 to-amber-500',
    BREATH: 'from-teal-400 to-cyan-500',
    ZEN: 'from-teal-500 to-emerald-500',
    FLEX: 'from-teal-400 to-green-500',
    HYDRO: 'from-cyan-400 to-teal-500',
    PEACE: 'from-emerald-400 to-teal-600',
    HERO: 'from-rose-500 to-pink-500',
    PUMP: 'from-orange-500 to-rose-500',
    ROAR: 'from-rose-400 to-orange-500',
    ROCK: 'from-amber-500 to-rose-500',
    SPRINT: 'from-orange-600 to-rose-600',
    HUG: 'from-pink-400 to-rose-500',
    KIND: 'from-rose-400 to-pink-500',
    RECALL: 'from-amber-400 to-rose-400',
    FLOW: 'from-teal-400 to-cyan-400',
    HOPE: 'from-amber-500 to-orange-500',
    FIGHT: 'from-rose-600 to-red-600',
    VENT: 'from-orange-600 to-rose-600',
    GRIP: 'from-red-500 to-rose-500',
    STOMP: 'from-rose-500 to-red-500',
    CHILL: 'from-teal-500 to-cyan-500',
    AWARE: 'from-purple-400 to-pink-500',
    BOX: 'from-teal-500 to-purple-500',
    GROUND: 'from-amber-600 to-orange-600',
    HEART: 'from-rose-400 to-pink-400',
    SHAKE: 'from-teal-400 to-emerald-400'
  };

  // Reaction animations
  const reactions = ['AWESOME', 'GREAT', 'NAILED IT', 'AMAZING', 'PERFECT', 'YES', 'BOOM', 'FIRE'];

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('echona_music_challenges');
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedChallenges(data.completed || []);
      setEarnedBadges(data.badges || []);
      setPoints(data.points || 0);
    }
  }, []);

  // Save data
  useEffect(() => {
    if (completedChallenges.length > 0 || earnedBadges.length > 0) {
      localStorage.setItem('echona_music_challenges', JSON.stringify({
        completed: completedChallenges,
        badges: earnedBadges,
        points: points
      }));
    }
  }, [completedChallenges, earnedBadges, points]);

  // Generate new challenge when song changes
  useEffect(() => {
    if (currentSong && mood) {
      const moodChallenges = challenges[mood] || challenges.Calm;
      // Filter out already completed challenges
      const available = moodChallenges.filter(c => 
        !completedChallenges.includes(c.id)
      );
      
      if (available.length > 0) {
        const random = available[Math.floor(Math.random() * available.length)];
        setActiveChallenge(random);
      } else {
        // All challenges completed, reset
        setActiveChallenge(moodChallenges[Math.floor(Math.random() * moodChallenges.length)]);
      }
    } else if (mood && !currentSong) {
      // Show challenge even when no song is playing yet
      const moodChallenges = challenges[mood] || challenges.Calm;
      const random = moodChallenges[Math.floor(Math.random() * moodChallenges.length)];
      setActiveChallenge(random);
    }
  }, [currentSong, mood, completedChallenges]);

  const completeChallenge = () => {
    if (!activeChallenge) return;

    // Add to completed
    setCompletedChallenges([...completedChallenges, activeChallenge.id]);
    
    // Add badge if not earned yet
    if (!earnedBadges.includes(activeChallenge.badge)) {
      setEarnedBadges([...earnedBadges, activeChallenge.badge]);
      setShowBadgePopup(true);
      setTimeout(() => setShowBadgePopup(false), 3000);
    }
    
    // Add points
    setPoints(points + activeChallenge.points);
    
    // Show reaction
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    setRecentReaction(randomReaction);
    setTimeout(() => setRecentReaction(null), 2000);
    
    // Get next challenge
    const moodChallenges = challenges[mood] || challenges.Calm;
    const available = moodChallenges.filter(c => 
      !completedChallenges.includes(c.id) && c.id !== activeChallenge.id
    );
    
    if (available.length > 0) {
      setTimeout(() => {
        const random = available[Math.floor(Math.random() * available.length)];
        setActiveChallenge(random);
      }, 500);
    }
  };

  const skipChallenge = () => {
    const moodChallenges = challenges[mood] || challenges.Calm;
    const available = moodChallenges.filter(c => 
      c.id !== activeChallenge?.id
    );
    
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      setActiveChallenge(random);
    }
  };

  if (!activeChallenge) return null;

  return (
    <>
      {/* Reaction Popup */}
      <AnimatePresence>
        {recentReaction && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full shadow-2xl">
              <span className="text-white font-black text-4xl tracking-wider">{recentReaction}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Unlock Popup */}
      <AnimatePresence>
        {showBadgePopup && (
          <motion.div
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -100 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gray-900 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                <p className="text-amber-400 font-bold text-sm mb-2">BADGE UNLOCKED</p>
                <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${badgeStyles[activeChallenge.badge]} rounded-full flex items-center justify-center mb-2 shadow-lg`}>
                  <span className="text-white font-black text-lg">{activeChallenge.badge}</span>
                </div>
                <p className="text-white font-semibold">+{activeChallenge.points} points</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Card */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed bottom-32 left-6 z-40 w-full md:w-96"
      >
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">TASK</span>
              </div>
              <div>
                <p className="text-amber-400 text-xs font-bold">MINI CHALLENGE</p>
                <p className="text-white text-sm font-semibold">+{activeChallenge.points} pts</p>
              </div>
            </div>
            <button
              onClick={skipChallenge}
              className="text-gray-400 hover:text-white text-sm font-semibold"
            >
              SKIP
            </button>
          </div>

          {/* Challenge Info */}
          <div className="mb-6">
            <h3 className="text-white text-xl font-bold mb-2">{activeChallenge.title}</h3>
            <p className="text-gray-300 text-sm">{activeChallenge.description}</p>
          </div>

          {/* Badge Preview */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${badgeStyles[activeChallenge.badge]} rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-xs">{activeChallenge.badge}</span>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Unlock Badge</p>
              <p className="text-white text-sm font-semibold">{activeChallenge.badge}</p>
            </div>
          </div>

          {/* Complete Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={completeChallenge}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            COMPLETE CHALLENGE
          </motion.button>

          {/* Stats Bar */}
          <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Total Points:</span>
              <span className="text-amber-400 font-bold ml-2">{points}</span>
            </div>
            <div>
              <span className="text-gray-400">Badges:</span>
              <span className="text-teal-400 font-bold ml-2">{earnedBadges.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Done:</span>
              <span className="text-rose-400 font-bold ml-2">{completedChallenges.length}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badge Collection - Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBadgePopup(true)}
        className="fixed bottom-44 right-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center z-30"
      >
        <div className="text-center">
          <span className="text-white font-black text-xs block">BADGE</span>
          <span className="text-white font-black text-lg">{earnedBadges.length}</span>
        </div>
      </motion.button>

      {/* Badge Collection Modal */}
      <AnimatePresence>
        {showBadgePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-amber-500 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
                  <span className="text-white font-bold text-sm tracking-wider">COLLECTION</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-2">Your Badges</h2>
                <p className="text-gray-400">
                  {earnedBadges.length} earned • {points} total points
                </p>
              </div>

              {earnedBadges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 font-bold text-2xl">START</span>
                  </div>
                  <p className="text-gray-400 text-lg">Complete challenges to earn badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {earnedBadges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-center"
                    >
                      <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${badgeStyles[badge]} rounded-2xl flex items-center justify-center mb-2 shadow-lg`}>
                        <span className="text-white font-black text-sm">{badge}</span>
                      </div>
                      <p className="text-gray-400 text-xs font-semibold">{badge}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowBadgePopup(false)}
                className="mt-8 w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicChallenges;
