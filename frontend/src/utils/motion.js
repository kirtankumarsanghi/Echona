export const MOTION = {
  ease: [0.22, 1, 0.36, 1],
  duration: {
    quick: 0.22,
    base: 0.34,
    section: 0.5,
  },
  stagger: {
    fast: 0.06,
    base: 0.1,
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.duration.base, ease: MOTION.ease },
  },
};

export const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.duration.section, ease: MOTION.ease },
  },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: MOTION.stagger.base,
      delayChildren: MOTION.stagger.fast,
    },
  },
};
