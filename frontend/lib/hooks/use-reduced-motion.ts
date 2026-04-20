"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if user prefers reduced motion
 * Essential for accessibility - respects OS-level motion preferences
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * return (
 *   <motion.div
 *     initial={prefersReducedMotion ? {} : { opacity: 0 }}
 *     animate={{ opacity: 1 }}
 *   />
 * );
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for matchMedia support
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
