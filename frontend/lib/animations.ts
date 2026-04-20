"use client";

import { Variants } from "framer-motion";

/* ============================================
   ANIMATION VARIANTS - CHA YUAN Design System
   Serene Minimalism with reduced-motion support
   ============================================ */

// Timing constants (in seconds)
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.8,
} as const;

// Easing curves
export const EASING = {
  entrance: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  standard: [0.4, 0, 0.2, 1],
  spring: [0.175, 0.885, 0.32, 1.275],
} as const;

// Stagger delay for lists
export const STAGGER_DELAY = 0.1;

/* ============================================
   FADE ANIMATIONS
   ============================================ */

/**
 * Fade up animation - primary entrance effect
 * Matches mockup's fadeInUp keyframes
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.dramatic,
      ease: EASING.entrance,
    },
  },
};

/**
 * Simple fade animation
 * Matches mockup's fadeIn keyframes
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: "easeOut",
    },
  },
};

/**
 * Slide in from left
 * Matches mockup's slideInLeft keyframes
 */
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.dramatic,
      ease: EASING.entrance,
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.dramatic,
      ease: EASING.entrance,
    },
  },
};

/**
 * Scale in animation
 */
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.entrance,
    },
  },
};

/* ============================================
   STAGGER ANIMATIONS
   ============================================ */

/**
 * Container for staggered children
 */
export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY,
      delayChildren: 0.1,
    },
  },
};

/**
 * Stagger item - for use inside stagger containers
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.entrance,
    },
  },
};

/* ============================================
   DECORATIVE ANIMATIONS
   ============================================ */

/**
 * Floating leaf animation
 * Matches mockup's leafFloat keyframes
 */
export const floatVariants: Variants = {
  initial: {
    y: 0,
    rotate: 0,
  },
  animate: {
    y: [-12, 0, -12],
    rotate: [0, 5, 0],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

/**
 * Steam rise animation
 * Matches mockup's steamRise keyframes
 */
export const steamRiseVariants: Variants = {
  initial: {
    opacity: 0,
    y: 0,
    scaleX: 1,
  },
  animate: {
    opacity: [0, 0.6, 0],
    y: [0, -20, -40],
    scaleX: [1, 1.2, 0.8],
    transition: {
      duration: 2.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

/**
 * Subtle shimmer/pulse for premium feel
 * Matches mockup's subtle animation
 */
export const shimmerVariants: Variants = {
  initial: {
    opacity: 1,
  },
  animate: {
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

/* ============================================
   HOVER ANIMATIONS
   ============================================ */

/**
 * Card hover effect
 */
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  },
  hover: {
    y: -6,
    boxShadow: "0 20px 40px -15px rgba(61,43,31,0.15)",
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.standard,
    },
  },
};

/**
 * Image scale on hover
 */
export const imageHoverVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.5,
      ease: EASING.standard,
    },
  },
};

/**
 * Button hover with arrow shift
 */
export const buttonHoverVariants: Variants = {
  initial: {
    gap: "0.5rem",
  },
  hover: {
    gap: "0.75rem",
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

/* ============================================
   SCROLL REVEAL
   ============================================ */

/**
 * Scroll reveal with intersection observer
 * Use with Framer Motion's whileInView
 */
export const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: EASING.entrance,
    },
  },
};

/* ============================================
   NAVBAR ANIMATIONS
   ============================================ */

/**
 * Navbar scroll effect - transparent to solid
 */
export const navbarVariants: Variants = {
  top: {
    backgroundColor: "rgba(253, 251, 247, 0)",
    backdropFilter: "blur(0px)",
    boxShadow: "none",
  },
  scrolled: {
    backgroundColor: "rgba(253, 251, 247, 0.95)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.standard,
    },
  },
};

/**
 * Mobile menu slide
 */
export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.exit,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.entrance,
    },
  },
};

/* ============================================
   MODAL / DIALOG ANIMATIONS
   ============================================ */

/**
 * Dialog overlay fade
 */
export const dialogOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

/**
 * Dialog content scale
 */
export const dialogContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Get animation props with reduced motion support
 */
export function getAnimationProps(
  prefersReducedMotion: boolean
): { initial: string; animate: string; transition?: object } {
  if (prefersReducedMotion) {
    return {
      initial: "visible",
      animate: "visible",
      transition: { duration: 0 },
    };
  }

  return {
    initial: "hidden",
    animate: "visible",
  };
}

/**
 * Delay values for staggered animations
 */
export const DELAY_VALUES = {
  100: 0.1,
  200: 0.2,
  300: 0.3,
  400: 0.4,
  500: 0.5,
  600: 0.6,
  800: 0.8,
  1200: 1.2,
} as const;

export default {
  fadeUpVariants,
  fadeVariants,
  slideInLeftVariants,
  slideInRightVariants,
  scaleInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  floatVariants,
  steamRiseVariants,
  shimmerVariants,
  cardHoverVariants,
  imageHoverVariants,
  buttonHoverVariants,
  scrollRevealVariants,
  navbarVariants,
  mobileMenuVariants,
  dialogOverlayVariants,
  dialogContentVariants,
  getAnimationProps,
  ANIMATION_DURATION,
  EASING,
  STAGGER_DELAY,
  DELAY_VALUES,
};
