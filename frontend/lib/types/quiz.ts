/**
 * Quiz Type Definitions
 *
 * TypeScript interfaces for the CHA YUAN quiz system.
 * These types align with the Django Ninja API schemas.
 */

/**
 * Individual answer choice for a quiz question
 */
export interface QuizChoice {
  /** Unique identifier for the choice */
  id: number;
  /** Display text for the choice */
  choice_text: string;
  /** Order for display (0 = first) */
  order: number;
}

/**
 * Quiz question with its available choices
 */
export interface QuizQuestion {
  /** Unique identifier for the question */
  id: number;
  /** Question text to display to user */
  question_text: string;
  /** Order for display (0 = first) */
  order: number;
  /** Whether this question must be answered */
  is_required: boolean;
  /** Available answer choices */
  choices: QuizChoice[];
}

/**
 * Quiz answers submitted by user
 * Maps question IDs to selected choice IDs
 */
export type QuizAnswers = {
  [questionId: number]: number;
};

/**
 * Result returned after quiz submission
 */
export interface QuizResult {
  /** Category preferences with scores (0-100) */
  preferences: Record<string, number>;
  /** Top 3 tea categories */
  top_categories: string[];
}

/**
 * User's stored preferences
 */
export interface UserPreference {
  /** Category preferences with scores (0-100) */
  preferences: Record<string, number>;
  /** ISO timestamp when quiz was completed, or null if not completed */
  quiz_completed_at: string | null;
  /** Top 3 tea categories */
  top_categories: string[];
}

/**
 * API Error response from quiz endpoints
 */
export interface QuizError {
  /** Error message */
  detail: string;
  /** Additional error details for validation errors */
  errors?: Record<string, string[]>;
}
