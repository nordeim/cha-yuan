"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/animations";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface QuizIntroProps {
  onStart: () => void;
  onSkip: () => void;
}

/**
 * QuizIntro - Landing screen before quiz starts
 *
 * Features:
 * - Title with elegant typography
 * - Explanation of quiz purpose
 * - Estimated time
 * - Start button (primary CTA)
 * - Skip option for browsing first
 * - Decorative tea leaf animation
 */
export function QuizIntro({ onStart, onSkip }: QuizIntroProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? {}
    : staggerContainerVariants;
  const itemVariants = prefersReducedMotion ? {} : staggerItemVariants;

  return (
    <motion.div
      className="py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative Icon */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center mb-8"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-tea-100 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-tea-600" />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-tea-300/20 blur-xl" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        variants={itemVariants}
        className="text-3xl sm:text-4xl font-display text-bark-900 text-center mb-4"
      >
        Discover Your Tea Preferences
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={itemVariants}
        className="text-lg text-bark-700 text-center max-w-md mx-auto mb-8"
      >
        Answer 5-7 simple questions to unlock personalized tea recommendations
        curated just for your palate.
      </motion.p>

      {/* Benefits */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 backdrop-blur-sm rounded-2xl border border-ivory-300 p-6 mb-8"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gold-600 text-sm font-medium">1</span>
            </div>
            <p className="text-bark-800 text-sm">
              <span className="font-medium">Personalized Curation:</span> Get
              tea selections matched to your taste profile
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gold-600 text-sm font-medium">2</span>
            </div>
            <p className="text-bark-800 text-sm">
              <span className="font-medium">Seasonal Recommendations:</span>{" "}
              Receive teas that align with the current harvest season
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-gold-600 text-sm font-medium">3</span>
            </div>
            <p className="text-bark-800 text-sm">
              <span className="font-medium">One-Time Setup:</span> Takes just
              2-3 minutes, and your preferences guide all future selections
            </p>
          </div>
        </div>
      </motion.div>

      {/* Time estimate */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-8"
      >
        <p className="text-sm text-bark-600 flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Takes about 2-3 minutes
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          size="lg"
          onClick={onStart}
          className="min-w-[200px] bg-tea-600 hover:bg-tea-700 text-white"
        >
          Start Quiz
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onSkip}
          className="text-bark-700 hover:text-bark-900"
        >
          Browse First
        </Button>
      </motion.div>
    </motion.div>
  );
}
