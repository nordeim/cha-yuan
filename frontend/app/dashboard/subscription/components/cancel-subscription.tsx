"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Pause,
  X,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerItemVariants } from "@/lib/animations";

interface CancelSubscriptionProps {
  status: string;
  onCancel: (reason?: string) => Promise<void>;
  onPause: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * CancelSubscription - Handle subscription cancellation with confirmation
 *
 * Features:
 * - Cancel button (destructive)
 * - Confirmation dialog with consequences
 * - Pause as alternative option
 * - Cancellation reason input (optional)
 * - Loading states
 * - Success feedback
 * - Immediate UI update
 *
 * Flow:
 * 1. User clicks "Cancel"
 * 2. Dialog opens with confirmation
 * 3. User confirms + optional reason
 * 4. API call to cancel
 * 5. UI updates to "cancelled" state
 */
export function CancelSubscription({
  status,
  onCancel,
  onPause,
  isLoading = false,
}: CancelSubscriptionProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? {} : staggerItemVariants;

  const [showDialog, setShowDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Don't show if already cancelled
  if (status === "cancelled") {
    return (
      <motion.div
        variants={variants}
        className="bg-red-50 rounded-2xl border border-red-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-red-900">
              Subscription Cancelled
            </h2>
            <p className="text-sm text-red-600">
              Your subscription has ended
            </p>
          </div>
        </div>
        <p className="text-sm text-red-700">
          We are sorry to see you go. You can reactivate your subscription anytime
          by starting a new one.
        </p>
      </motion.div>
    );
  }

  // Show reactivate option if paused
  if (status === "paused") {
    return (
      <motion.div
        variants={variants}
        className="bg-gold-50 rounded-2xl border border-gold-200 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
            <Pause className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-gold-900">
              Subscription Paused
            </h2>
            <p className="text-sm text-gold-700">
              Your deliveries are on hold
            </p>
          </div>
        </div>
        <Button
          onClick={onPause}
          className="w-full bg-gold-500 hover:bg-gold-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Resume Subscription"
          )}
        </Button>
      </motion.div>
    );
  }

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await onCancel(reason || undefined);
      setShowSuccess(true);
      setTimeout(() => {
        setShowDialog(false);
        setShowSuccess(false);
        setReason("");
      }, 2000);
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    setIsSubmitting(true);
    try {
      await onPause();
      setShowPauseDialog(false);
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        variants={variants}
        className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-bark-900">
              Manage Subscription
            </h2>
            <p className="text-sm text-bark-600">
              Pause or cancel anytime
            </p>
          </div>
        </div>

        {/* Pause Option */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowPauseDialog(true)}
            className="w-full border-gold-300 text-gold-700 hover:bg-gold-50 mb-3"
            disabled={isLoading}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause Subscription
          </Button>
          <p className="text-xs text-bark-500 text-center">
            Pause for 1-3 months without losing your preferences
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ivory-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-xs text-bark-500">or</span>
          </div>
        </div>

        {/* Cancel Option */}
        <Button
          variant="outline"
          onClick={() => setShowDialog(true)}
          className="w-full border-red-300 text-red-700 hover:bg-red-50"
          disabled={isLoading}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel Subscription
        </Button>
      </motion.div>

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !isSubmitting && setShowDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {showSuccess ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-bark-900 mb-2">
                    Subscription Cancelled
                  </h3>
                  <p className="text-sm text-bark-600">
                    You will receive confirmation via email.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-display text-bark-900">
                      Cancel Subscription?
                    </h2>
                  </div>
                  
                  <p className="text-sm text-bark-600 mb-4">
                    We are sorry to see you go. Please confirm you would like to cancel.
                  </p>

                  {/* Consequences */}
                  <div className="bg-ivory-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-bark-900 mb-2">
                      What happens next:
                    </h4>
                    <ul className="text-sm text-bark-600 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>You will receive any pending boxes until end of current period</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>Your preferences will be saved for 6 months</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>No future charges after cancellation</span>
                      </li>
                    </ul>
                  </div>

                  {/* Optional Reason */}
                  <div className="mb-4">
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-bark-700 mb-2"
                    >
                      Why are you leaving? (optional)
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Too expensive, moving, etc."
                      className="w-full rounded-lg border border-ivory-300 bg-white px-3 py-2 text-sm text-bark-900 placeholder:text-bark-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent resize-none"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDialog(false)}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Confirm Cancel"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Dialog */}
      <AnimatePresence>
        {showPauseDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !isSubmitting && setShowPauseDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <Pause className="w-5 h-5 text-gold-600" />
                <h2 className="text-lg font-display text-bark-900">
                  Pause Subscription
                </h2>
              </div>

              <p className="text-sm text-bark-600 mb-4">
                Take a break while keeping your preferences saved.
              </p>

              <div className="bg-gold-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gold-900 mb-2">
                  While paused:
                </h4>
                <ul className="text-sm text-gold-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600">•</span>
                    <span>No new boxes will be shipped</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600">•</span>
                    <span>No charges during pause period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600">•</span>
                    <span>Your preferences are preserved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gold-600">•</span>
                    <span>Resume anytime from this dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPauseDialog(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  onClick={handlePause}
                  disabled={isSubmitting}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Pausing...
                    </>
                  ) : (
                    "Pause for Now"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Skeleton loader for CancelSubscription
 */
export function CancelSubscriptionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-ivory-200 rounded-xl animate-pulse" />
        <div>
          <div className="h-5 w-40 bg-ivory-200 rounded mb-1 animate-pulse" />
          <div className="h-4 w-32 bg-ivory-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="h-10 bg-ivory-200 rounded-lg mb-3 animate-pulse" />
      <div className="h-4 w-48 bg-ivory-200 rounded mx-auto mb-4 animate-pulse" />

      <div className="relative my-4">
        <div className="w-full border-t border-ivory-200" />
      </div>

      <div className="h-10 bg-ivory-200 rounded-lg animate-pulse" />
    </div>
  );
}
