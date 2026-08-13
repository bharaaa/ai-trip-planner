export const motionConfig = {
  duration: {
    instant: 0.12,
    fast: 0.18,
    normal: 0.28,
    slow: 0.4,
  },
  easing: {
    standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
    smooth: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export const slideUpVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
};

export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const staggerContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggerItemVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: motionConfig.duration.normal,
      ease: motionConfig.easing.standard
    }
  },
  exit: { opacity: 0, scale: 0.98 }
};
