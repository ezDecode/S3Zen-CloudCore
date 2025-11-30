/**
 * Premium Animation Utilities
 * Subtle, stable animations that enhance UX without distraction
 */

// Framer Motion Variants for consistent animations across the app

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

// Stagger children animations for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

// Hover animations - Minimal and stable
export const hoverScale = {
  scale: 0.99,
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
};

export const hoverOpacity = {
  opacity: 0.9,
  transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
};

// Loading spinner animation
export const spinnerRotate = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' }
};

// Pulse animation for status indicators
export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1]
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// Premium easing curves
export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  snappy: [0.4, 0, 0.6, 1],
  gentle: [0.25, 0.1, 0.25, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
};

// Duration presets (in seconds) - Faster for better feel
export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  verySlow: 0.5
};
