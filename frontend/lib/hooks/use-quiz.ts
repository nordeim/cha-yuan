/**
 * Quiz React Query Hooks
 *
 * TanStack Query hooks for quiz state management.
 * Provides caching, loading states, and error handling.
 *
 * @module lib/hooks/use-quiz
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getQuizQuestions,
  submitQuiz,
  getUserPreferences,
} from "@/lib/api/quiz";
import { QuizQuestion, QuizAnswers, QuizResult, UserPreference } from "@/lib/types/quiz";

// Query keys for cache management
const QUIZ_KEYS = {
  all: ["quiz"] as const,
  questions: () => [...QUIZ_KEYS.all, "questions"] as const,
  preferences: () => [...QUIZ_KEYS.all, "preferences"] as const,
  completionStatus: () => [...QUIZ_KEYS.all, "completion"] as const,
};

/**
 * Hook to fetch quiz questions.
 *
 * Uses 5-minute stale time since quiz questions rarely change.
 * Questions are public, so no auth required.
 *
 * @returns Query result with questions array
 *
 * @example
 * ```typescript
 * function QuizPage() {
 *   const { data: questions, isLoading, error } = useQuizQuestions();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <Quiz questions={questions} />;
 * }
 * ```
 */
export function useQuizQuestions(): UseQueryResult<QuizQuestion[], Error> {
  return useQuery({
    queryKey: QUIZ_KEYS.questions(),
    queryFn: getQuizQuestions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to submit quiz answers.
 *
 * On success, invalidates the preferences cache so the UI
 * reflects the newly calculated preferences.
 *
 * @returns Mutation result with submit function
 *
 * @example
 * ```typescript
 * function QuizForm({ questions }: { questions: QuizQuestion[] }) {
 *   const [answers, setAnswers] = useState<QuizAnswers>({});
 *   const submitQuiz = useSubmitQuiz();
 *
 *   const handleSubmit = async () => {
 *     try {
 *       const result = await submitQuiz.mutateAsync(answers);
 *       router.push("/quiz/results");
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 * }
 * ```
 */
export function useSubmitQuiz(): UseMutationResult<QuizResult, Error, QuizAnswers> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuiz,
    onSuccess: () => {
      // Invalidate preferences cache so UI reflects new preferences
      queryClient.invalidateQueries({
        queryKey: QUIZ_KEYS.preferences(),
      });
      // Also invalidate completion status
      queryClient.invalidateQueries({
        queryKey: QUIZ_KEYS.completionStatus(),
      });
    },
  });
}

/**
 * Hook to fetch user's quiz preferences.
 *
 * Returns null values if user hasn't completed quiz yet.
 *
 * @returns Query result with user preferences
 *
 * @example
 * ```typescript
 * function Dashboard() {
 *   const { data: preferences, isLoading } = useUserPreferences();
 *
 *   if (preferences?.quiz_completed_at) {
 *     return <PreferenceSummary preferences={preferences} />;
 *   }
 *
 *   return <TakeQuizPrompt />;
 * }
 * ```
 */
export function useUserPreferences(): UseQueryResult<UserPreference, Error> {
  return useQuery({
    queryKey: QUIZ_KEYS.preferences(),
    queryFn: getUserPreferences,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,
    // Don't retry on 401 - user not authenticated
    retry: (failureCount, error) => {
      if (error.message.includes("401") || error.message.includes("Authentication")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to check if user has completed the quiz.
 *
 * Convenience hook that derives completion status from preferences.
 *
 * @returns Object with hasCompleted flag and loading state
 *
 * @example
 * ```typescript
 * function ProtectedRoute({ children }: { children: React.ReactNode }) {
 *   const { hasCompleted, isLoading } = useQuizCompletionStatus();
 *
 *   if (isLoading) return <Loading />;
 *
 *   if (!hasCompleted) {
 *     return <Redirect to="/quiz" />;
 *   }
 *
 *   return <>{children}</>;
 * }
 * ```
 */
export function useQuizCompletionStatus(): {
  hasCompleted: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useUserPreferences();

  return {
    hasCompleted: data?.quiz_completed_at != null,
    isLoading,
    error: error || null,
  };
}

/**
 * Hook to prefetch quiz data.
 *
 * Useful for preloading quiz data on page transitions.
 *
 * @returns Function to prefetch quiz questions
 *
 * @example
 * ```typescript
 * function StartQuizButton() {
 *   const prefetchQuiz = usePrefetchQuiz();
 *
 *   return (
 *     <Button
 *       onMouseEnter={prefetchQuiz}
 *       onClick={() => router.push("/quiz")}
 *     >
 *       Start Quiz
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePrefetchQuiz(): () => void {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: QUIZ_KEYS.questions(),
      queryFn: getQuizQuestions,
      staleTime: 1000 * 60 * 5,
    });
  };
}

/**
 * Hook to get top tea categories for current user.
 *
 * Returns empty array if quiz not completed.
 *
 * @returns Array of top category slugs
 *
 * @example
 * ```typescript
 * function ProductRecommendations() {
 *   const topCategories = useTopCategories();
 *
 *   return (
 *     <div>
 *       {topCategories.map(cat => (
 *         <CategorySection key={cat} category={cat} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTopCategories(): string[] {
  const { data } = useUserPreferences();
  return data?.top_categories ?? [];
}
