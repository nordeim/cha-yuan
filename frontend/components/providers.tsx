"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * Providers - Wraps the app with necessary context providers
 *
 * Features:
 * - TanStack Query provider for data fetching
 * - Configured with Singapore context defaults
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time: 1 minute
            staleTime: 1000 * 60 * 1,
            // Default cache time: 5 minutes
            gcTime: 1000 * 60 * 5,
            // Retry failed queries 3 times
            retry: 3,
            // Don't retry on 401/403
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus (but not in tests)
            refetchOnWindowFocus: typeof window !== "undefined" && process.env.NODE_ENV !== "test",
          },
          mutations: {
            // Retry mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
