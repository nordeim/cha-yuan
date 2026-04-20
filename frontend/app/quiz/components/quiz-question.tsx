"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion as QuizQuestionType } from "@/lib/types/quiz";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { EASING } from "@/lib/animations";

interface QuizQuestionProps {
  question: QuizQuestionType;
  currentAnswer: number | null;
  onSelect: (choiceId: number) => void;
  questionNumber: number;
  totalQuestions: number;
  direction: "next" | "prev";
}

/**
 * QuizQuestion - Individual question step component
 *
 * Features:
 * - Animated transitions between questions
 * - Choice buttons with radio-style selection
 * - Keyboard navigation (Tab, Space, Enter)
 * - Selected state with tea-600 accent
 * - Focus management for accessibility
 * - Smooth entrance/exit animations
 */
export function QuizQuestion({
  question,
  currentAnswer,
  onSelect,
  questionNumber,
  totalQuestions: _totalQuestions,
  direction,
}: QuizQuestionProps) {
  const prefersReducedMotion = useReducedMotion();
  const firstChoiceRef = useRef<HTMLButtonElement>(null);

  // Auto-focus first choice on mount for accessibility
  useEffect(() => {
    if (firstChoiceRef.current && !currentAnswer) {
      firstChoiceRef.current.focus();
    }
  }, [question.id, currentAnswer]);

  // Animation variants for page transitions
  const pageVariants = {
    enter: (direction: "next" | "prev") => ({
      x: direction === "next" ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "next" | "prev") => ({
      x: direction === "next" ? -40 : 40,
      opacity: 0,
    }),
  };

  const transition = {
    duration: prefersReducedMotion ? 0 : 0.3,
    ease: EASING.entrance,
  };

  // Stagger animation for choices
  const choiceContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: 0.1,
      },
    },
  };

const choiceItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: EASING.entrance,
      },
    },
  };

  return (
    <AnimatePresence
      mode="wait"
      custom={direction}
    >
      <motion.div
        key={question.id}
        custom={direction}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={transition}
        className="py-8"
      >
        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-display text-bark-900 mb-8 text-center">
          {question.question_text}
        </h2>

        {/* Choices */}
        <motion.div
          className="space-y-3"
          variants={choiceContainerVariants}
          initial="hidden"
          animate="visible"
          role="radiogroup"
          aria-label={`Question ${questionNumber}: ${question.question_text}`}
        >
          {question.choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              ref={index === 0 ? firstChoiceRef : undefined}
              variants={choiceItemVariants}
              onClick={() => onSelect(choice.id)}
              role="radio"
              aria-checked={currentAnswer === choice.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(choice.id);
                }
              }}
              className={`
                w-full p-5 rounded-xl border-2 text-left transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tea-500 focus-visible:ring-offset-2
                ${
                  currentAnswer === choice.id
                    ? "border-tea-500 bg-tea-50 shadow-md"
                    : "border-ivory-300 bg-white hover:border-gold-400 hover:bg-ivory-50"
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Radio indicator */}
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    transition-colors duration-200
                    ${
                      currentAnswer === choice.id
                        ? "border-tea-500 bg-tea-500"
                        : "border-ivory-400 bg-white"
                    }
                  `}
                  aria-hidden="true"
                >
                  {currentAnswer === choice.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </div>

                {/* Choice text */}
                <span
                  className={`
                    text-base sm:text-lg
                    ${
                      currentAnswer === choice.id
                        ? "text-tea-900 font-medium"
                        : "text-bark-800"
                    }
                  `}
                >
                  {choice.choice_text}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
