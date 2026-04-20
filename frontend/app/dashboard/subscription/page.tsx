"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  useSubscription,
  useCancelSubscription,
  usePauseSubscription,
  useResumeSubscription,
} from "@/lib/hooks/use-subscription";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerContainerVariants } from "@/lib/animations";
import {
  SubscriptionStatus,
  SubscriptionStatusSkeleton,
  NextBilling,
  NextBillingSkeleton,
  NextBoxPreview,
  NextBoxPreviewSkeleton,
  PreferenceSummary,
  PreferenceSummarySkeleton,
  CancelSubscription,
  CancelSubscriptionSkeleton,
} from "./components";

/**
 * SubscriptionPage - Main subscription dashboard
 *
 * Features:
 * - Displays complete subscription information
 * - Next billing date with Singapore time
 * - Next box preview
 * - Preference summary from quiz
 * - Cancel/pause subscription options
 * - Loading and error states
 * - Responsive 2-column layout
 *
 * Singapore Context:
 * - Asia/Singapore timezone for dates
 * - SGD currency formatting
 * - GST 9% included notation
 */
export default function SubscriptionPage() {
  const prefersReducedMotion = useReducedMotion();

  // Data fetching
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useSubscription();

  // Mutations
  const cancelMutation = useCancelSubscription();
  const pauseMutation = usePauseSubscription();
  const resumeMutation = useResumeSubscription();

  // Container animation
  const containerVariants = prefersReducedMotion ? {} : staggerContainerVariants;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-ivory-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-ivory-200 rounded animate-pulse" />
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SubscriptionStatusSkeleton />
              <NextBoxPreviewSkeleton />
              <PreferenceSummarySkeleton />
            </div>
            <div className="space-y-6">
              <NextBillingSkeleton />
              <CancelSubscriptionSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-ivory-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-bark-600 hover:text-tea-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          {/* Error Card */}
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-display text-bark-900 mb-2">
              Failed to load subscription
            </h1>
            <p className="text-bark-600 mb-6 max-w-md mx-auto">
              {error.message || "We couldn't retrieve your subscription information."}
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No subscription state
  if (!data?.subscription) {
    return (
      <div className="min-h-screen bg-ivory-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-bark-600 hover:text-tea-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          {/* No Subscription Card */}
          <div className="bg-white rounded-2xl border border-ivory-300 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-tea-600" />
            </div>
            <h1 className="text-xl font-display text-bark-900 mb-2">
              No Active Subscription
            </h1>
            <p className="text-bark-600 mb-6 max-w-md mx-auto">
              You don't have an active subscription. Start your tea journey with a curated monthly box.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/subscribe">
                <Button className="bg-tea-600 hover:bg-tea-700 text-white">
                  Start Subscription
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Browse Shop</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handlers
  const handleCancel = async (reason?: string) => {
    await cancelMutation.mutateAsync(reason ? { reason } : undefined);
  };

  const handlePause = async () => {
    await pauseMutation.mutateAsync({ months: 1 });
  };

  const handleResume = async () => {
    await resumeMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen bg-ivory-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-bark-600 hover:text-tea-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display text-bark-900 mb-2">
            My Subscription
          </h1>
          <p className="text-bark-600">
            Manage your tea delivery, preferences, and billing
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <SubscriptionStatus subscription={data.subscription} />
            <NextBoxPreview nextBox={data.nextBox} />
            <PreferenceSummary preferences={data.preferences} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <NextBilling subscription={data.subscription} />
            <CancelSubscription
              status={data.subscription.status}
              onCancel={handleCancel}
              onPause={
                data.subscription.status === "paused"
                  ? handleResume
                  : handlePause
              }
              isLoading={
                cancelMutation.isPending ||
                pauseMutation.isPending ||
                resumeMutation.isPending
              }
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
