/**
 * API Functions Index
 *
 * Re-exports all API functions for convenient imports.
 *
 * @module lib/api
 */

// Quiz API
export {
  getQuizQuestions,
  submitQuiz,
  getUserPreferences,
  hasCompletedQuiz,
} from "./quiz";

// Auth API
export { authFetch, isAuthenticated, getCurrentUser } from "@/lib/auth-fetch";

// Types
export type {
  QuizQuestion,
  QuizChoice,
  QuizAnswers,
  QuizResult,
  UserPreference,
  QuizError,
} from "@/lib/types/quiz";
