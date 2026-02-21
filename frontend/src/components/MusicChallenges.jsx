import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicChallenges = ({ currentSong, mood, inDrawer = false }) => {
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showBadgeCollection, setShowBadgeCollection] = useState(false);
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

  // Badge styles — muted, calm palette
  const badgeStyles = {
    GRIN: 'bg-amber-500/20 text-amber-400',
    GROOVE: 'bg-orange-500/20 text-orange-400',
    SPARK: 'bg-amber-400/20 text-amber-400',
    THANKS: 'bg-amber-500/20 text-amber-400',
    JUMP: 'bg-orange-400/20 text-orange-400',
    BREATH: 'bg-teal-500/20 text-teal-400',
    ZEN: 'bg-emerald-500/20 text-emerald-400',
    FLEX: 'bg-teal-400/20 text-teal-400',
    HYDRO: 'bg-cyan-500/20 text-cyan-400',
    PEACE: 'bg-emerald-400/20 text-emerald-400',
    HERO: 'bg-rose-500/20 text-rose-400',
    PUMP: 'bg-orange-500/20 text-orange-400',
    ROAR: 'bg-rose-400/20 text-rose-400',
    ROCK: 'bg-amber-500/20 text-amber-400',
    SPRINT: 'bg-orange-500/20 text-orange-400',
    HUG: 'bg-pink-400/20 text-pink-400',
    KIND: 'bg-rose-400/20 text-rose-400',
    RECALL: 'bg-amber-400/20 text-amber-400',
    FLOW: 'bg-teal-400/20 text-teal-400',
    HOPE: 'bg-amber-500/20 text-amber-400',
    FIGHT: 'bg-rose-500/20 text-rose-400',
    VENT: 'bg-orange-500/20 text-orange-400',
    GRIP: 'bg-red-500/20 text-red-400',
    STOMP: 'bg-rose-500/20 text-rose-400',
    CHILL: 'bg-teal-500/20 text-teal-400',
    AWARE: 'bg-purple-400/20 text-purple-400',
    BOX: 'bg-indigo-500/20 text-indigo-400',
    GROUND: 'bg-amber-500/20 text-amber-400',
    HEART: 'bg-rose-400/20 text-rose-400',
    SHAKE: 'bg-emerald-400/20 text-emerald-400'
  };

  const reactions = ['Well done', 'Great job', 'Wonderful', 'Beautiful', 'Perfect', 'Amazing'];

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

  // Generate challenge based on mood
  useEffect(() => {
    if (currentSong && mood) {
      const moodChallenges = challenges[mood] || challenges.Calm;
      const available = moodChallenges.filter(c => !completedChallenges.includes(c.id));
      if (available.length > 0) {
        setActiveChallenge(available[Math.floor(Math.random() * available.length)]);
      } else {
        setActiveChallenge(moodChallenges[Math.floor(Math.random() * moodChallenges.length)]);
      }
    } else if (mood && !currentSong) {
      const moodChallenges = challenges[mood] || challenges.Calm;
      setActiveChallenge(moodChallenges[Math.floor(Math.random() * moodChallenges.length)]);
    }
  }, [currentSong, mood, completedChallenges]);

  const completeChallenge = () => {
    if (!activeChallenge) return;

    setCompletedChallenges([...completedChallenges, activeChallenge.id]);

    if (!earnedBadges.includes(activeChallenge.badge)) {
      setEarnedBadges([...earnedBadges, activeChallenge.badge]);
    }

    setPoints(points + activeChallenge.points);

    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    setRecentReaction(reaction);
    setTimeout(() => setRecentReaction(null), 2500);

    const moodChallenges = challenges[mood] || challenges.Calm;
    const available = moodChallenges.filter(c =>
      !completedChallenges.includes(c.id) && c.id !== activeChallenge.id
    );

    if (available.length > 0) {
      setTimeout(() => {
        setActiveChallenge(available[Math.floor(Math.random() * available.length)]);
      }, 500);
    }
  };

  const skipChallenge = () => {
    const moodChallenges = challenges[mood] || challenges.Calm;
    const available = moodChallenges.filter(c => c.id !== activeChallenge?.id);
    if (available.length > 0) {
      setActiveChallenge(available[Math.floor(Math.random() * available.length)]);
    }
  };

  // ═══════════════════════════════════════
  // IN-DRAWER MODE (new calm design)
  // ═══════════════════════════════════════
  if (inDrawer) {
    return (
      <div className="space-y-5">
        {/* Stats — minimal, muted */}
        <div className="flex items-center gap-4 pb-4 border-b border-neutral-800/50">
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Points</p>
            <p className="text-lg font-semibold text-neutral-200">{points}</p>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Badges</p>
            <p className="text-lg font-semibold text-neutral-200">{earnedBadges.length}</p>
          </div>
          <div className="w-px h-8 bg-neutral-800" />
          <div>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Done</p>
            <p className="text-lg font-semibold text-neutral-200">{completedChallenges.length}</p>
          </div>
        </div>

        {/* Reaction Toast */}
        <AnimatePresence>
          {recentReaction && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
            >
              <span className="text-emerald-400 font-medium text-sm">{recentReaction} ✓</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Challenge */}
        {activeChallenge ? (
          <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">Current Challenge</p>
                <h3 className="text-base font-semibold text-neutral-100">{activeChallenge.title}</h3>
              </div>
              <span className="text-xs text-neutral-500 font-medium">+{activeChallenge.points} pts</span>
            </div>

            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">{activeChallenge.description}</p>

            {/* Badge Preview */}
            <div className="flex items-center gap-2.5 mb-5 px-3 py-2.5 bg-neutral-800/40 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${badgeStyles[activeChallenge.badge]}`}>
                {activeChallenge.badge.charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-neutral-600 uppercase tracking-wide">Unlocks</p>
                <p className="text-neutral-300 text-xs font-medium">{activeChallenge.badge}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={completeChallenge}
                className="flex-1 py-2.5 bg-white text-neutral-900 rounded-xl font-semibold text-sm transition-all hover:shadow-md"
              >
                Complete
              </button>
              <button
                onClick={skipChallenge}
                className="px-4 py-2.5 bg-neutral-800/60 hover:bg-neutral-700/60 border border-neutral-700/50 text-neutral-400 rounded-xl text-sm font-medium transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 text-sm">No challenge right now</p>
            <p className="text-neutral-600 text-xs mt-1">Select a mood to get started</p>
          </div>
        )}

        {/* Badge Collection */}
        <div>
          <button
            onClick={() => setShowBadgeCollection(!showBadgeCollection)}
            className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/40 border border-neutral-800/40 rounded-xl transition-all hover:bg-neutral-800/40"
          >
            <span className="text-sm text-neutral-400 font-medium">Badge Collection ({earnedBadges.length})</span>
            <svg
              className={`w-4 h-4 text-neutral-600 transition-transform ${showBadgeCollection ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showBadgeCollection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {earnedBadges.length === 0 ? (
                  <div className="text-center py-6 px-4">
                    <p className="text-neutral-600 text-sm">Complete challenges to earn badges</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 pt-3">
                    {earnedBadges.map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-col items-center py-3"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold ${badgeStyles[badge]}`}>
                          {badge.substring(0, 2)}
                        </div>
                        <p className="text-neutral-600 text-[9px] mt-1.5 font-medium">{badge}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // LEGACY FLOATING MODE (fallback — should not be used in new layout)
  // ═══════════════════════════════════════
  if (!activeChallenge) return null;

  return null; // Floating mode removed — use inDrawer mode
};

export default MusicChallenges;
