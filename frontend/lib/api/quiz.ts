/**
 * Quiz API Functions
 *
 * Type-safe API functions for the CHA YUAN quiz system.
 * Communicates with Django backend via BFF proxy.
 *
 * @module lib/api/quiz
 */

import { authFetch } from "@/lib/auth-fetch";
import {
  QuizQuestion,
  QuizAnswers,
  QuizResult,
  UserPreference,
  QuizError,
} from "@/lib/types/quiz";

/**
 * Fetch all quiz questions with their choices.
 *
 * This endpoint is public (no auth required) so users can view
 * the quiz before signing up.
 *
 * @returns Array of quiz questions with nested choices
 * @throws {Error} If the fetch fails
 *
 * @example
 * ```typescript
 * const questions = await getQuizQuestions();
 * console.log(questions[0].question_text); // "What tea strength do you prefer?"
 * ```
 */
export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const response = await authFetch("/api/v1/quiz/questions/", {
    method: "GET",
    skipAuth: true, // Public endpoint
  });

  if (!response.ok) {
    const errorData: QuizError = await response.json().catch(() => ({
      detail: "Failed to fetch quiz questions",
    }));
    throw new Error(errorData.detail || "Failed to fetch quiz questions");
  }

  return response.json();
}

/**
 * Submit quiz answers and calculate preferences.
 *
 * This endpoint requires authentication. Each user can only
 * submit once - subsequent calls will return 409 Conflict.
 *
 * @param answers - Map of question IDs to selected choice IDs
 * @returns Calculated preferences with top categories
 * @throws {Error} If validation fails or quiz already completed
 *
 * @example
 * ```typescript
 * const answers = {
 *   1: 2,  // Question 1 -> Choice 2
 *   2: 5,  // Question 2 -> Choice 5
 * };
 * const result = await submitQuiz(answers);
 * console.log(result.top_categories); // ["green_tea", "oolong", "white_tea"]
 * ```
 */
export async function submitQuiz(answers: QuizAnswers): Promise<QuizResult> {
  const response = await authFetch("/api/v1/quiz/submit/", {
    method: "POST",
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    const errorData: QuizError = await response.json().catch(() => ({
      detail: "Failed to submit quiz",
    }));

    // Handle specific error cases
    if (response.status === 409) {
      throw new Error("Quiz already completed");
    }

    if (response.status === 400) {
      throw new Error(errorData.detail || "Invalid quiz answers");
    }

    throw new Error(errorData.detail || "Failed to submit quiz");
  }

  return response.json();
}

/**
 * Get current user's quiz preferences.
 *
 * Returns the calculated preferences if the user has completed
 * the quiz, or null values if not yet completed.
 *
 * @returns User's preferences or null if not completed
 * @throws {Error} If not authenticated
 *
 * @example
 * ```typescript
 * const prefs = await getUserPreferences();
 * if (prefs.quiz_completed_at) {
 *   console.log(prefs.top_categories); // ["green_tea", "oolong", "white_tea"]
 * }
 * ```
 */
export async function getUserPreferences(): Promise<UserPreference> {
  const response = await authFetch("/api/v1/quiz/preferences/", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData: QuizError = await response.json().catch(() => ({
      detail: "Failed to fetch user preferences",
    }));

    if (response.status === 401) {
      throw new Error("Authentication required");
    }

    throw new Error(errorData.detail || "Failed to fetch user preferences");
  }

  return response.json();
}

/**
 * Check if the current user has completed the quiz.
 *
 * Convenience wrapper around getUserPreferences().
 *
 * @returns True if quiz is completed, false otherwise
 * @throws {Error} If not authenticated
 *
 * @example
 * ```typescript
 * if (await hasCompletedQuiz()) {
 *   router.push("/quiz/results");
 * }
 * ```
 */
export async function hasCompletedQuiz(): Promise<boolean> {
  try {
    const preferences = await getUserPreferences();
    return preferences.quiz_completed_at != null;
  } catch (error) {
    // If 404, quiz hasn't been completed yet
    if (error instanceof Error && error.message.includes("404")) {
      return false;
    }
    throw error;
  }
}
