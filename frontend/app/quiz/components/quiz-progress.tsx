"use client";

import { motion } from "framer-motion";
import { EASING } from "@/lib/animations";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

/**
 * QuizProgress - Visual progress indicator for quiz
 *
 * Features:
 * - Horizontal progress bar with tea-600 fill
 * - Step indicators (dots with numbers)
 * - Completed steps (tea-600), current (gold-500), remaining (ivory-300)
 * - Percentage text showing progress
 * - Smooth width transitions (300ms)
 * - Accessible with aria labels
 */
export function QuizProgress({
  currentStep,
  totalSteps,
  completedSteps,
}: QuizProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full py-6">
      {/* Progress bar container */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-ivory-200 rounded-full overflow-hidden">
          {/* Fill bar */}
          <motion.div
            className="h-full bg-tea-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: EASING.entrance,
              }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center"
              >
                {/* Step dot */}
                <motion.div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-300
                    ${
                      isCompleted
                        ? "bg-tea-600 text-white"
                        : isCurrent
                          ? "bg-gold-500 text-bark-900 ring-2 ring-gold-400 ring-offset-2"
                          : "bg-ivory-200 text-bark-600"
                    }
                  `}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                  }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.3,
                ease: EASING.entrance,
              }}
                  aria-label={`Step ${stepNumber} ${isCompleted ? "completed" : isCurrent ? "current" : "pending"}`}
                >
                  {isCompleted ? (
                    // Checkmark for completed
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </motion.div>

                {/* Step label (only show for current step on mobile) */}
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isCompleted ? "text-tea-700" : isCurrent ? "text-gold-600" : "text-bark-500"}
                    ${isCurrent ? "block" : "hidden sm:block"}
                  `}
                >
                  {isCompleted ? "Done" : isCurrent ? "Current" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-bark-600">
          Question <span className="font-medium text-bark-900">{currentStep}</span>{" "}
          of <span className="font-medium text-bark-900">{totalSteps}</span>
        </p>
        <p className="text-xs text-bark-500 mt-1">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  );
}
