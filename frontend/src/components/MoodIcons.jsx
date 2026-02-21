/**
 * Extracted SVG mood icons (#20) — reusable across MoodDetect + other pages
 */

export const moodIconDefs = {
  Happy: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8L36 20L48 24L36 28L32 40L28 28L16 24L28 20L32 8Z" fill="url(#happyGrad)" className="animate-pulse"/>
        <circle cx="32" cy="32" r="20" stroke="url(#happyGrad)" strokeWidth="2" opacity="0.3"/>
        <circle cx="32" cy="32" r="14" stroke="url(#happyGrad)" strokeWidth="2" opacity="0.5"/>
        <defs><linearGradient id="happyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>
      </svg>
    ),
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent",
    borderColor: "border-amber-500/30",
    description: "Joyful & Positive",
    accent: "amber",
  },
  Sad: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 48C32 48 20 44 20 32C20 20 32 16 32 16C32 16 44 20 44 32C44 44 32 48 32 48Z" fill="url(#sadGrad)" opacity="0.8"/>
        <path d="M28 20L28 12M36 20L36 12M24 32L18 32M46 32L40 32" stroke="url(#sadGrad)" strokeWidth="2" strokeLinecap="round"/>
        <defs><linearGradient id="sadGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
      </svg>
    ),
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent",
    borderColor: "border-blue-500/30",
    description: "Down & Blue",
    accent: "blue",
  },
  Angry: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 16L40 24L48 16L44 32L48 48L40 40L32 48L24 40L16 48L20 32L16 16L24 24L32 16Z" fill="url(#angryGrad)"/>
        <path d="M20 24L28 28M44 24L36 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"/>
        <defs><linearGradient id="angryGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#dc2626" /></linearGradient></defs>
      </svg>
    ),
    color: "from-red-500 to-rose-600",
    bgColor: "bg-gradient-to-br from-red-500/10 via-rose-600/5 to-transparent",
    borderColor: "border-red-500/30",
    description: "Frustrated & Mad",
    accent: "red",
  },
  Calm: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 32C16 32 20 28 32 28C44 28 48 32 48 32M16 38C16 38 20 42 32 42C44 42 48 38 48 38" stroke="url(#calmGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
        <circle cx="32" cy="32" r="22" stroke="url(#calmGrad)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4"/>
        <circle cx="32" cy="32" r="4" fill="url(#calmGrad)"/>
        <defs><linearGradient id="calmGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
      </svg>
    ),
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent",
    borderColor: "border-emerald-500/30",
    description: "Peaceful & Relaxed",
    accent: "emerald",
  },
  Excited: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 8L35 25L48 18L38 30L54 32L38 34L48 46L35 39L32 56L29 39L16 46L26 34L10 32L26 30L16 18L29 25L32 8Z" fill="url(#excitedGrad)"/>
        <circle cx="32" cy="32" r="8" fill="white" opacity="0.3"/>
        <defs><linearGradient id="excitedGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
      </svg>
    ),
    color: "from-pink-500 to-fuchsia-500",
    bgColor: "bg-gradient-to-br from-pink-500/10 via-fuchsia-500/5 to-transparent",
    borderColor: "border-pink-500/30",
    description: "Energized & Thrilled",
    accent: "pink",
  },
  Anxious: {
    svg: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 28L24 24L28 28M36 28L40 24L44 28" stroke="url(#anxiousGrad)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 36Q28 32 32 36Q36 32 42 36M24 42Q28 40 32 42Q36 40 40 42" stroke="url(#anxiousGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <circle cx="32" cy="32" r="24" stroke="url(#anxiousGrad)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.3"/>
        <defs><linearGradient id="anxiousGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
      </svg>
    ),
    color: "from-slate-400 to-zinc-400",
    bgColor: "bg-slate-500/20",
    borderColor: "border-slate-400",
    description: "Worried & Nervous",
    accent: "violet",
  },
};

/** Get mood data array for iteration */
export function getMoodList() {
  return Object.entries(moodIconDefs).map(([name, data]) => ({
    name,
    icon: data.svg,
    ...data,
  }));
}

export default moodIconDefs;
