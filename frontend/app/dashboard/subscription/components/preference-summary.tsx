"use client";

import { motion } from "framer-motion";
import { Heart, ArrowRight, Leaf } from "lucide-react";
import Link from "next/link";
import type { UserPreference } from "@/lib/types/quiz";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerItemVariants } from "@/lib/animations";
import { Button } from "@/components/ui/button";

interface PreferenceSummaryProps {
  preferences: UserPreference | null;
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
 * PreferenceSummary - Display quiz results in dashboard
 *
 * Features:
 * - Top 3 tea categories with visual bars
 * - Compact view of quiz results
 * - "Browse by Preference" CTA
 * - Quiz completion date
 * - Empty state for incomplete quiz
 *
 * Design:
 * - Compact bar chart visualization
 * - Tea brand colors
 * - Clear hierarchy
 */
export function PreferenceSummary({ preferences }: PreferenceSummaryProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? {} : staggerItemVariants;

  // Quiz not completed state
  if (!preferences || !preferences.quiz_completed_at) {
    return (
      <motion.div
        variants={variants}
        className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ivory-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-bark-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-bark-900">
              Tea Preferences
            </h2>
            <p className="text-sm text-bark-600">
              Personalize your experience
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-ivory-100 flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-7 h-7 text-bark-400" />
          </div>
          <h3 className="text-base font-medium text-bark-900 mb-1">
            Complete the Quiz
          </h3>
          <p className="text-sm text-bark-600 max-w-xs mx-auto mb-4">
            Discover your tea preferences to receive personalized recommendations.
          </p>
          <Button
            asChild
            variant="outline"
            className="border-tea-300 text-tea-700 hover:bg-tea-50"
          >
            <Link href="/quiz">
              Take Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  // Sort preferences by score
  const sortedPreferences = Object.entries(preferences.preferences || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const maxScore = sortedPreferences[0]?.[1] ?? 100;

  // Format completion date
  const completedDate = new Date(preferences.quiz_completed_at).toLocaleDateString(
    "en-SG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tea-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-tea-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-bark-900">
              Your Preferences
            </h2>
            <p className="text-sm text-bark-600">
              Completed {completedDate}
            </p>
          </div>
        </div>

        {/* View All Link */}
        <Link
          href="/dashboard/preferences"
          className="text-sm text-tea-600 hover:text-tea-700 flex items-center gap-1"
        >
          Details
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top Categories */}
      <div className="space-y-3 mb-6">
        {sortedPreferences.map(([category, score], index) => (
          <div key={category} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-bark-900">
                  {categoryNames[category] || category}
                </span>
                {index === 0 && (
                  <span className="px-1.5 py-0.5 bg-gold-400/20 text-gold-600 text-xs rounded">
                    Top Match
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-tea-600">
                {score}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-ivory-200 rounded-full overflow-hidden">
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        asChild
        variant="outline"
        className="w-full border-tea-300 text-tea-700 hover:bg-tea-50"
      >
        <Link href="/products">
          Browse by Preference
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>

      {/* Note about one-time quiz */}
      <p className="text-xs text-bark-500 text-center mt-3">
        Quiz can only be taken once. Preferences guide all future curation.
      </p>
    </motion.div>
  );
}

/**
 * Skeleton loader for PreferenceSummary
 */
export function PreferenceSummarySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ivory-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-5 w-32 bg-ivory-200 rounded mb-1 animate-pulse" />
            <div className="h-4 w-40 bg-ivory-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-4 w-16 bg-ivory-200 rounded animate-pulse" />
      </div>

      <div className="space-y-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="h-4 w-24 bg-ivory-200 rounded animate-pulse" />
              <div className="h-4 w-10 bg-ivory-200 rounded animate-pulse" />
            </div>
            <div className="h-2 bg-ivory-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      <div className="h-10 bg-ivory-200 rounded-lg animate-pulse" />
    </div>
  );
}
