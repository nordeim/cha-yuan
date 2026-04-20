"use client";

import { motion } from "framer-motion";
import { Leaf, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  staggerContainerVariants,
  staggerItemVariants,
  EASING,
} from "@/lib/animations";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface QuizResultsProps {
  preferences: Record<string, number>;
  topCategories: string[];
  onContinue: () => void;
}

// Category display names mapping
const categoryNames: Record<string, string> = {
  green_tea: "Green Tea",
  black_tea: "Black Tea",
  oolong: "Oolong",
  white_tea: "White Tea",
  pu_erh: "Pu-erh",
  herbal: "Herbal Tea",
  floral: "Floral Tea",
};

/**
 * QuizResults - Quiz completion results visualization
 *
 * Features:
 * - Success message with celebration animation
 * - Top 3 categories with visual bars
 * - Personalized recommendation summary
 * - "Browse Recommendations" CTA
 * - Expandable detailed scores
 * - Reduced motion support
 */
export function QuizResults({
  preferences,
  topCategories,
  onContinue,
}: QuizResultsProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = prefersReducedMotion
    ? {}
    : staggerContainerVariants;
  const itemVariants = prefersReducedMotion ? {} : staggerItemVariants;

  // Sort preferences by score for visualization
  const sortedPreferences = Object.entries(preferences).sort(
    ([, a], [, b]) => b - a
  );
  const maxScore = sortedPreferences[0]?.[1] ?? 100;

  return (
    <motion.div
      className="py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Success Icon */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center mb-6"
      >
        <motion.div
          className="w-24 h-24 rounded-full bg-tea-100 flex items-center justify-center"
          initial={prefersReducedMotion ? {} : { scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
                  duration: prefersReducedMotion ? 0 : 0.6,
                  ease: EASING.spring,
                }}
        >
          <CheckCircle className="w-12 h-12 text-tea-600" />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        variants={itemVariants}
        className="text-center mb-8"
      >
        <h2 className="text-2xl sm:text-3xl font-display text-bark-900 mb-3">
          Your Tea Profile is Ready!
        </h2>
        <p className="text-bark-700 max-w-md mx-auto">
          Based on your answers, we&apos;ve curated personalized recommendations
          just for you.
        </p>
      </motion.div>

      {/* Top Categories */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-ivory-300 p-6 mb-8"
      >
        <h3 className="text-lg font-display text-bark-900 mb-6 text-center">
          Your Top Tea Categories
        </h3>

        {/* Category bars */}
        <div className="space-y-4">
          {sortedPreferences.slice(0, 3).map(([category, score], index) => (
            <div
              key={category}
              className="relative"
            >
              {/* Category label and score */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-bark-900">
                    {categoryNames[category] || category}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-gold-400/20 text-gold-600 text-xs font-medium rounded-full">
                      Top Match
                    </span>
                  )}
                </div>
                <span className="text-lg font-display text-tea-600">
                  {score}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-ivory-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(90deg, #5c8a4d, #4a7040)"
                        : index === 1
                          ? "linear-gradient(90deg, #7da35e, #5c8a4d)"
                          : "linear-gradient(90deg, #a8c290, #7da35e)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / maxScore) * 100}%` }}
                  transition={{
                  duration: prefersReducedMotion ? 0 : 0.8,
                  delay: prefersReducedMotion ? 0 : index * 0.1,
                  ease: EASING.entrance,
                }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Personalized Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-tea-50/50 rounded-2xl border border-tea-200 p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-tea-100 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-tea-600" />
          </div>
          <div>
            <h4 className="font-display text-bark-900 mb-2">
              Your Personalized Journey
            </h4>
            <p className="text-sm text-bark-700 leading-relaxed">
              You&apos;ll receive curated selections from{" "}
              {topCategories
                .slice(0, 3)
                .map((cat) => categoryNames[cat] || cat)
                .join(", ")}
              , perfectly matched to your taste preferences. Each monthly box
              will feature seasonal teas aligned with the current harvest in
              Asia.
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={itemVariants}
        className="text-center"
      >
        <Button
          size="lg"
          onClick={onContinue}
          className="min-w-[240px] bg-tea-600 hover:bg-tea-700 text-white"
        >
          Browse Recommendations
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
        <p className="mt-4 text-sm text-bark-500">
          You can view your preferences anytime in your dashboard
        </p>
      </motion.div>
    </motion.div>
  );
}
