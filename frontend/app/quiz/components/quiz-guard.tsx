"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/auth-fetch";
import { useQuizCompletionStatus } from "@/lib/hooks/use-quiz";

/**
 * QuizGuard - Protects the quiz route
 *
 * Redirects if:
 * 1. User is not authenticated -> /login?redirect=/quiz
 * 2. User has already completed quiz -> /dashboard
 *
 * Shows loading state while checking auth and completion status.
 */
export function QuizGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Check authentication
  const {
    data: user,
    isLoading: isAuthLoading,
    error: authError,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Check quiz completion status
  const { hasCompleted, isLoading: isCompletionLoading } =
    useQuizCompletionStatus();

  const isLoading = isAuthLoading || isCompletionLoading;
  const isAuthenticated = !!user && !authError;

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> redirect to login
    if (!isAuthenticated) {
      router.replace("/login?redirect=/quiz");
      return;
    }

    // Already completed quiz -> redirect to dashboard
    if (hasCompleted) {
      router.replace("/dashboard");
      return;
    }
  }, [isAuthenticated, hasCompleted, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-3 border-tea-300 border-t-tea-600 rounded-full" />
          <p className="mt-4 text-bark-700 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated and not completed
  if (!isAuthenticated || hasCompleted) {
    return null;
  }

  return <>{children}</>;
}
