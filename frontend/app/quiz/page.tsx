"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QuizGuard } from "./components/quiz-guard";
import { QuizLayout } from "./components/quiz-layout";
import { QuizIntro } from "./components/quiz-intro";
import { QuizQuestion } from "./components/quiz-question";
import { QuizProgress } from "./components/quiz-progress";
import { QuizResults } from "./components/quiz-results";
import { Button } from "@/components/ui/button";
import { useQuizQuestions, useSubmitQuiz } from "@/lib/hooks/use-quiz";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { QuizAnswers } from "@/lib/types/quiz";

type QuizStep = "intro" | "question" | "results";

/**
 * QuizPage - Main quiz orchestrator component
 *
 * Manages the complete quiz flow:
 * 1. Intro screen -> Question steps -> Results
 * 2. State management for answers and current step
 * 3. Navigation (Next, Back, Submit)
 * 4. Error handling and loading states
 * 5. Animation coordination
 *
 * Protected by QuizGuard - only accessible to authenticated users
 * who haven't completed the quiz yet.
 */
export default function QuizPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Quiz state
  const [currentStep, setCurrentStep] = useState<QuizStep>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [results, setResults] = useState<{
    preferences: Record<string, number>;
    topCategories: string[];
  } | null>(null);

  // Data fetching
  const {
    data: questions,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useQuizQuestions();

  // Mutation
  const submitQuiz = useSubmitQuiz();

  // Navigation handlers
  const handleStart = useCallback(() => {
    setDirection("next");
    setCurrentStep("question");
  }, []);

  const handleSkip = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleNext = useCallback(() => {
    if (!questions) return;

    if (questionIndex < questions.length - 1) {
      setDirection("next");
      setQuestionIndex((prev) => prev + 1);
    } else {
      // Last question - submit
      handleSubmit();
    }
  }, [questionIndex, questions]);

  const handleBack = useCallback(() => {
    if (questionIndex > 0) {
      setDirection("prev");
      setQuestionIndex((prev) => prev - 1);
    } else {
      // Back to intro
      setDirection("prev");
      setCurrentStep("intro");
    }
  }, [questionIndex]);

  const handleSelect = useCallback((choiceId: number) => {
    if (!questions || !questions[questionIndex]) return;

    const currentQuestion = questions[questionIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: choiceId,
    }));
  }, [questionIndex, questions]);

  const handleSubmit = useCallback(async () => {
    try {
      const result = await submitQuiz.mutateAsync(answers);
      setResults({
        preferences: result.preferences,
        topCategories: result.top_categories,
      });
      setCurrentStep("results");
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Quiz submission failed:", error);
    }
  }, [answers, submitQuiz]);

  const handleContinue = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Loading state
  if (isQuestionsLoading) {
    return (
      <QuizGuard>
        <QuizLayout>
          <div className="py-24 text-center">
            <div className="inline-block animate-spin h-10 w-10 border-4 border-tea-300 border-t-tea-600 rounded-full" />
            <p className="mt-4 text-bark-700">Loading quiz...</p>
          </div>
        </QuizLayout>
      </QuizGuard>
    );
  }

  // Error state
  if (questionsError) {
    return (
      <QuizGuard>
        <QuizLayout>
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-display text-bark-900 mb-2">
              Failed to load quiz
            </h2>
            <p className="text-bark-600 mb-6">
              {questionsError.message || "Please try again later"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </QuizLayout>
      </QuizGuard>
    );
  }

  // No questions available
  if (!questions || questions.length === 0) {
    return (
      <QuizGuard>
        <QuizLayout>
          <div className="py-24 text-center">
            <p className="text-bark-700">No quiz questions available.</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="mt-4"
            >
              Back to Home
            </Button>
          </div>
        </QuizLayout>
      </QuizGuard>
    );
  }

  const currentQuestion = questions[questionIndex];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] ?? null) : null;
  const canProceed = currentAnswer !== null;
  const isLastQuestion = questionIndex === questions.length - 1;

  // Calculate completed steps for progress
  const completedSteps = Object.keys(answers).map((id) => {
    const questionId = parseInt(id, 10);
    return questions.findIndex((q) => q.id === questionId) + 1;
  });

  return (
    <QuizGuard>
      <QuizLayout>
        <AnimatePresence mode="wait">
          {currentStep === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <QuizIntro
                onStart={handleStart}
                onSkip={handleSkip}
              />
            </motion.div>
          )}

          {currentStep === "question" && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              {/* Progress */}
              <QuizProgress
                currentStep={questionIndex + 1}
                totalSteps={questions.length}
                completedSteps={completedSteps}
              />

              {/* Question */}
              {currentQuestion && (
                <QuizQuestion
                  question={currentQuestion}
                  currentAnswer={currentAnswer}
                  onSelect={handleSelect}
                  questionNumber={questionIndex + 1}
                  totalQuestions={questions.length}
                  direction={direction}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-ivory-300">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={submitQuiz.isPending}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed || submitQuiz.isPending}
                  loading={submitQuiz.isPending}
                  loadingText="Analyzing..."
                >
                  {isLastQuestion ? (
                    <>
                      Submit
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      Next
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </>
                  )}
                </Button>
              </div>

              {/* Submission error */}
              {submitQuiz.isError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center"
                >
                  {submitQuiz.error instanceof Error
                    ? submitQuiz.error.message
                    : "Failed to submit quiz. Please try again."}
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === "results" && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <QuizResults
                preferences={results.preferences}
                topCategories={results.topCategories}
                onContinue={handleContinue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </QuizLayout>
    </QuizGuard>
  );
}
