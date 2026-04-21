"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/* ============================================
LOGIN PAGE - User Authentication
Handles login with returnTo redirect for checkout flow
============================================ */

// Login form component with search params
function LoginForm() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call backend login endpoint via BFF proxy
      const response = await fetch("/api/proxy/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to returnTo URL after short delay to show success message
        setTimeout(() => {
          router.push(returnTo);
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 pb-20 paper-texture">
        <div className="container-chayuan">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            {/* Login Card */}
            <div className="bg-white rounded-2xl border border-ivory-300 p-8 shadow-sm">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-tea-600" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-bark-800 mb-2">
                  Welcome Back
                </h1>
                <p className="text-bark-700/70">
                  Sign in to continue your tea journey
                </p>
                {returnTo !== "/" && (
                  <p className="text-sm text-gold-600 mt-2">
                    You will be redirected to checkout after login
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-tea-50 border border-tea-200 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-tea-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-tea-700">
                    Login successful! Redirecting...
                  </p>
                </motion.div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-bark-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-500" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 h-12"
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-bark-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12"
                      disabled={isLoading || isSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-500 hover:text-bark-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-tea-600 hover:text-tea-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full bg-tea-600 hover:bg-tea-700 text-white h-12 rounded-full text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ivory-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-bark-500">
                    New to CHA YUAN?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                href={`/auth/register${returnTo !== "/" ? `?returnTo=${returnTo}` : ""}`}
              >
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full text-base font-semibold border-2"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Back Link */}
            <div className="text-center mt-6">
              <Link
                href={returnTo}
                className="text-sm text-bark-600 hover:text-tea-600"
              >
                ← Back to {returnTo === "/checkout" ? "checkout" : "previous page"}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Main page component with Suspense for useSearchParams
export default function LoginPage() {
  return (
    <Suspense fallback={
      <>
        <Navigation />
        <main className="min-h-screen pt-32 pb-20 paper-texture">
          <div className="container-chayuan">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl border border-ivory-300 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4 animate-pulse" />
                <div className="h-8 bg-ivory-200 rounded mb-2 animate-pulse" />
                <div className="h-4 bg-ivory-200 rounded w-3/4 mx-auto animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <LoginForm />
    </Suspense>
  );
}
