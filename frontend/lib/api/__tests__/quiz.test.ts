/**
 * Quiz API Tests
 *
 * Unit tests for quiz API functions.
 * Uses Vitest for testing.
 *
 * @module lib/api/__tests__/quiz
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getQuizQuestions, submitQuiz, getUserPreferences, hasCompletedQuiz } from "../quiz";
import { authFetch } from "@/lib/auth-fetch";
import { QuizQuestion, QuizAnswers, QuizResult, UserPreference } from "@/lib/types/quiz";

// Mock authFetch
vi.mock("@/lib/auth-fetch", () => ({
  authFetch: vi.fn(),
}));

describe("Quiz API", () => {
  const mockAuthFetch = vi.mocked(authFetch);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getQuizQuestions", () => {
    it("should fetch and return quiz questions", async () => {
      const mockQuestions: QuizQuestion[] = [
        {
          id: 1,
          question_text: "What tea strength do you prefer?",
          order: 0,
          is_required: true,
          choices: [
            { id: 1, choice_text: "Light and delicate", order: 0 },
            { id: 2, choice_text: "Medium and balanced", order: 1 },
          ],
        },
      ];

      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuestions,
      } as Response);

      const result = await getQuizQuestions();

      expect(result).toEqual(mockQuestions);
      expect(mockAuthFetch).toHaveBeenCalledWith("/api/v1/quiz/questions/", {
        method: "GET",
        skipAuth: true,
      });
    });

    it("should throw error on failed fetch", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: "Server error" }),
      } as Response);

      await expect(getQuizQuestions()).rejects.toThrow("Server error");
    });

    it("should throw generic error on network failure", async () => {
      mockAuthFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(getQuizQuestions()).rejects.toThrow("Network error");
    });
  });

  describe("submitQuiz", () => {
    const mockAnswers: QuizAnswers = {
      1: 2,
      2: 5,
    };

    it("should submit answers and return result", async () => {
      const mockResult: QuizResult = {
        preferences: {
          green_tea: 85,
          oolong: 72,
          white_tea: 60,
        },
        top_categories: ["green_tea", "oolong", "white_tea"],
      };

      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      } as Response);

      const result = await submitQuiz(mockAnswers);

      expect(result).toEqual(mockResult);
      expect(mockAuthFetch).toHaveBeenCalledWith("/api/v1/quiz/submit/", {
        method: "POST",
        body: JSON.stringify({ answers: mockAnswers }),
      });
    });

    it("should throw 'already completed' error on 409", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ detail: "Quiz already completed" }),
      } as Response);

      await expect(submitQuiz(mockAnswers)).rejects.toThrow("Quiz already completed");
    });

    it("should throw validation error on 400", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Missing required answers" }),
      } as Response);

      await expect(submitQuiz(mockAnswers)).rejects.toThrow("Missing required answers");
    });
  });

  describe("getUserPreferences", () => {
    it("should return user preferences", async () => {
      const mockPreferences: UserPreference = {
        preferences: {
          green_tea: 85,
          oolong: 72,
        },
        quiz_completed_at: "2026-04-17T10:00:00Z",
        top_categories: ["green_tea", "oolong"],
      };

      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPreferences,
      } as Response);

      const result = await getUserPreferences();

      expect(result).toEqual(mockPreferences);
      expect(mockAuthFetch).toHaveBeenCalledWith("/api/v1/quiz/preferences/", {
        method: "GET",
      });
    });

    it("should throw auth error on 401", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "Unauthorized" }),
      } as Response);

      await expect(getUserPreferences()).rejects.toThrow("Authentication required");
    });
  });

  describe("hasCompletedQuiz", () => {
    it("should return true when quiz is completed", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preferences: { green_tea: 85 },
          quiz_completed_at: "2026-04-17T10:00:00Z",
          top_categories: ["green_tea"],
        }),
      } as Response);

      const result = await hasCompletedQuiz();

      expect(result).toBe(true);
    });

    it("should return false when quiz is not completed", async () => {
      mockAuthFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          preferences: {},
          quiz_completed_at: null,
          top_categories: [],
        }),
      } as Response);

      const result = await hasCompletedQuiz();

      expect(result).toBe(false);
    });
  });
});
