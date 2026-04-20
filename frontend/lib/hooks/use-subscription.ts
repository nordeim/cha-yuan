/**
 * Subscription React Query Hooks
 *
 * TanStack Query hooks for subscription state management.
 * Provides caching, loading states, and error handling.
 *
 * @module lib/hooks/use-subscription
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  getSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from "@/lib/api/subscription";
import type {
  SubscriptionDashboardData,
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
} from "@/lib/types/subscription";

// Query keys for cache management
const SUBSCRIPTION_KEYS = {
  all: ["subscription"] as const,
  dashboard: () => [...SUBSCRIPTION_KEYS.all, "dashboard"] as const,
  billing: () => [...SUBSCRIPTION_KEYS.all, "billing"] as const,
};

/**
 * Hook to fetch subscription dashboard data.
 *
 * Fetches complete subscription information including status,
 * billing, next box preview, and preferences.
 *
 * @returns Query result with subscription data
 *
 * @example
 * ```typescript
 * function SubscriptionPage() {
 *   const { data, isLoading, error } = useSubscription();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *   if (!data) return <NoSubscription />;
 *
 *   return <SubscriptionDashboard data={data} />;
 * }
 * ```
 */
export function useSubscription(): UseQueryResult<
  SubscriptionDashboardData,
  Error
> {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.dashboard(),
    queryFn: getSubscription,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    // Don't retry on 404 - user has no subscription
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        error.message.includes("No active subscription")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to cancel subscription.
 *
 * On success, invalidates subscription cache so UI reflects cancelled state.
 *
 * @returns Mutation result with cancel function
 *
 * @example
 * ```typescript
 * function CancelButton() {
 *   const cancel = useCancelSubscription();
 *
 *   const handleCancel = async () => {
 *     try {
 *       await cancel.mutateAsync({ reason: "Too expensive" });
 *       toast.success("Subscription cancelled");
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 *
 *   return (
 *     <Button onClick={handleCancel} loading={cancel.isPending}>
 *       Cancel Subscription
 *     </Button>
 *   );
 * }
 * ```
 */
export function useCancelSubscription(): UseMutationResult<
  void,
  Error,
  CancelSubscriptionRequest | undefined
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cancelSubscription(data),
    onSuccess: () => {
      // Invalidate subscription cache to reflect cancelled state
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_KEYS.dashboard(),
      });
    },
  });
}

/**
 * Hook to pause subscription.
 *
 * Pauses subscription for specified duration. On success,
 * invalidates cache to reflect paused state.
 *
 * @returns Mutation result with pause function
 *
 * @example
 * ```typescript
 * function PauseButton() {
 *   const pause = usePauseSubscription();
 *
 *   const handlePause = async () => {
 *     try {
 *       await pause.mutateAsync({ months: 2 });
 *       toast.success("Subscription paused");
 *     } catch (error) {
 *       toast.error(error.message);
 *     }
 *   };
 * }
 * ```
 */
export function usePauseSubscription(): UseMutationResult<
  void,
  Error,
  PauseSubscriptionRequest | undefined
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => pauseSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_KEYS.dashboard(),
      });
    },
  });
}

/**
 * Hook to resume paused subscription.
 *
 * Reactivates subscription immediately.
 *
 * @returns Mutation result with resume function
 *
 * @example
 * ```typescript
 * function ResumeButton() {
 *   const resume = useResumeSubscription();
 *
 *   return (
 *     <Button
 *       onClick={() => resume.mutate()}
 *       loading={resume.isPending}
 *     >
 *       Resume Subscription
 *     </Button>
 *   );
 * }
 * ```
 */
export function useResumeSubscription(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_KEYS.dashboard(),
      });
    },
  });
}

/**
 * Hook to check if user has an active subscription.
 *
 * Convenience hook that checks subscription status.
 *
 * @returns Object with hasSubscription flag and loading state
 *
 * @example
 * ```typescript
 * function ProtectedRoute({ children }: { children: React.ReactNode }) {
 *   const { hasSubscription, isLoading } = useHasSubscription();
 *
 *   if (isLoading) return <Loading />;
 *   if (!hasSubscription) return <SubscribePrompt />;
 *
 *   return <>{children}</>;
 * }
 * ```
 */
export function useHasSubscription(): {
  hasSubscription: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useSubscription();

  return {
    hasSubscription: data?.subscription != null,
    isLoading,
    error: error || null,
  };
}

/**
 * Get subscription status info with label and color.
 *
 * @param status - Subscription status string
 * @returns Status info with label and color
 *
 * @example
 * ```typescript
 * const statusInfo = getSubscriptionStatusInfo("active");
 * // { label: "Active", colorClass: "bg-tea-600" }
 * ```
 */
export function getSubscriptionStatusInfo(status?: string): {
  label: string;
  colorClass: string;
  textClass: string;
} {
  switch (status) {
    case "active":
      return {
        label: "Active",
        colorClass: "bg-tea-600",
        textClass: "text-tea-700",
      };
    case "paused":
      return {
        label: "Paused",
        colorClass: "bg-gold-500",
        textClass: "text-gold-700",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        colorClass: "bg-red-500",
        textClass: "text-red-700",
      };
    default:
      return {
        label: "Unknown",
        colorClass: "bg-gray-500",
        textClass: "text-gray-700",
      };
  }
}

/**
 * Hook to prefetch subscription data.
 *
 * Useful for preloading subscription data on hover or navigation.
 *
 * @returns Function to prefetch subscription data
 *
 * @example
 * ```typescript
 * function DashboardLink() {
 *   const prefetch = usePrefetchSubscription();
 *
 *   return (
 *     <Link
 *       href="/dashboard/subscription"
 *       onMouseEnter={prefetch}
 *     >
 *       My Subscription
 *     </Link>
 *   );
 * }
 * ```
 */
export function usePrefetchSubscription(): () => void {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: SUBSCRIPTION_KEYS.dashboard(),
      queryFn: getSubscription,
      staleTime: 1000 * 60 * 2,
    });
  };
}
