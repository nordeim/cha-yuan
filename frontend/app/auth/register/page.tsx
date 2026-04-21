"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

/* ============================================
REGISTER PAGE - User Account Creation
Handles registration with returnTo redirect for checkout flow
Includes password complexity validation
============================================ */

// Password complexity requirements
interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

// Singapore postal code validation (6 digits)
const isValidPostalCode = (code: string): boolean => /^\d{6}$/.test(code);

// Singapore phone validation (+65 XXXX XXXX or XXXX XXXX)
const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\s/g, "");
  return /^\+?65\d{8}$/.test(cleaned) || /^\d{8}$/.test(cleaned);
};

// Registration form component with search params
function RegisterForm() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    postalCode: "",
    pdpaConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password strength calculation
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    const passedTests = passwordRequirements.filter((req) => req.test(password)).length;
    return (passedTests / passwordRequirements.length) * 100;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Validation
  const getFieldError = (field: string): string | null => {
    switch (field) {
      case "email":
        if (!formData.email) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
        return null;
      case "password":
        if (!formData.password) return "Password is required";
        if (formData.password.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(formData.password)) return "Password must contain an uppercase letter";
        if (!/[a-z]/.test(formData.password)) return "Password must contain a lowercase letter";
        if (!/\d/.test(formData.password)) return "Password must contain a number";
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
          return "Password must contain a special character";
        }
        return null;
      case "confirmPassword":
        if (formData.confirmPassword !== formData.password) return "Passwords do not match";
        return null;
      case "firstName":
        if (!formData.firstName.trim()) return "First name is required";
        return null;
      case "lastName":
        if (!formData.lastName.trim()) return "Last name is required";
        return null;
      case "phone":
        if (!formData.phone) return "Phone number is required";
        if (!isValidPhone(formData.phone)) return "Invalid phone number (e.g., +65 9123 4567)";
        return null;
      case "postalCode":
        if (!formData.postalCode) return "Postal code is required";
        if (!isValidPostalCode(formData.postalCode)) return "Invalid postal code (6 digits)";
        return null;
      case "pdpaConsent":
        if (!formData.pdpaConsent) return "PDPA consent is required";
        return null;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      firstName: true,
      lastName: true,
      phone: true,
      postalCode: true,
      pdpaConsent: true,
    });

    // Validate all fields
    const errors = [
      getFieldError("email"),
      getFieldError("password"),
      getFieldError("confirmPassword"),
      getFieldError("firstName"),
      getFieldError("lastName"),
      getFieldError("phone"),
      getFieldError("postalCode"),
      getFieldError("pdpaConsent"),
    ].filter(Boolean);

    if (errors.length > 0) {
      setError(errors[0] || "Please fix the errors above");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call backend register endpoint via BFF proxy
      const response = await fetch("/api/proxy/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone.startsWith("+") ? formData.phone : `+65 ${formData.phone}`,
          postal_code: formData.postalCode,
          pdpa_consent: formData.pdpaConsent,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        // Redirect to returnTo URL after short delay to show success message
        setTimeout(() => {
          router.push(returnTo);
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Registration failed. Please try again.");
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
            className="max-w-lg mx-auto"
          >
            {/* Register Card */}
            <div className="bg-white rounded-2xl border border-ivory-300 p-8 shadow-sm">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-tea-600" />
                </div>
                <h1 className="font-display text-2xl font-semibold text-bark-800 mb-2">
                  Create Account
                </h1>
                <p className="text-bark-700/70">
                  Join CHA YUAN for exclusive tea experiences
                </p>
              </div>

              {/* Error Alert */}
              {error && !isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-tea-50 border border-tea-200 flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-tea-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-tea-800 font-medium">Account created successfully!</p>
                    <p className="text-xs text-tea-600 mt-1">Redirecting...</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-bark-800">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        onBlur={() => setTouched({ ...touched, firstName: true })}
                        className="pl-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                        placeholder="John"
                        disabled={isLoading || isSuccess}
                      />
                    </div>
                    {touched.firstName && getFieldError("firstName") && (
                      <p className="text-xs text-red-600">{getFieldError("firstName")}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-bark-800">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onBlur={() => setTouched({ ...touched, lastName: true })}
                        className="pl-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                        placeholder="Tan"
                        disabled={isLoading || isSuccess}
                      />
                    </div>
                    {touched.lastName && getFieldError("lastName") && (
                      <p className="text-xs text-red-600">{getFieldError("lastName")}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-bark-800">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      className="pl-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                      placeholder="john@example.com"
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                  {touched.email && getFieldError("email") && (
                    <p className="text-xs text-red-600">{getFieldError("email")}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-bark-800">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onBlur={() => setTouched({ ...touched, phone: true })}
                      className="pl-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                      placeholder="+65 9123 4567"
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                  {touched.phone && getFieldError("phone") && (
                    <p className="text-xs text-red-600">{getFieldError("phone")}</p>
                  )}
                  <p className="text-xs text-bark-500">Singapore format: +65 XXXX XXXX or XXXX XXXX</p>
                </div>

                {/* Postal Code */}
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-sm font-medium text-bark-800">
                    Postal Code
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                    <Input
                      id="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      onBlur={() => setTouched({ ...touched, postalCode: true })}
                      className="pl-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                      placeholder="123456"
                      maxLength={6}
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                  {touched.postalCode && getFieldError("postalCode") && (
                    <p className="text-xs text-red-600">{getFieldError("postalCode")}</p>
                  )}
                  <p className="text-xs text-bark-500">Singapore postal code (6 digits)</p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-bark-800">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      className="pl-10 pr-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                      placeholder="••••••••"
                      disabled={isLoading || isSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-400 hover:text-bark-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.password && getFieldError("password") && (
                    <p className="text-xs text-red-600">{getFieldError("password")}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2 mt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-bark-600">Password Strength</span>
                        <span className={
                          passwordStrength === 100 ? "text-tea-600" : "text-amber-600"
                        }>
                          {passwordStrength === 100 ? "Strong" : passwordStrength >= 60 ? "Medium" : "Weak"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-ivory-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            passwordStrength === 100
                              ? "bg-tea-500"
                              : passwordStrength >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>

                      {/* Password Requirements List */}
                      <ul className="space-y-1.5 mt-3">
                        {passwordRequirements.map((req, index) => {
                          const isMet = req.test(formData.password);
                          return (
                            <li
                              key={index}
                              className={`flex items-center gap-2 text-xs ${
                                isMet ? "text-tea-600" : "text-bark-500"
                              }`}
                            >
                              {isMet ? (
                                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                              ) : (
                                <X className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                              )}
                              {req.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-bark-800">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bark-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                      className="pl-10 pr-10 h-12 rounded-xl border-ivory-300 focus:border-tea-400 focus:ring-tea-400"
                      placeholder="••••••••"
                      disabled={isLoading || isSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-400 hover:text-bark-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && getFieldError("confirmPassword") && (
                    <p className="text-xs text-red-600">{getFieldError("confirmPassword")}</p>
                  )}
                </div>

                {/* PDPA Consent */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-4 bg-ivory-100 rounded-xl">
                    <Checkbox
                      id="pdpaConsent"
                      checked={formData.pdpaConsent}
onCheckedChange={(checked: boolean | "indeterminate") =>
                      setFormData({ ...formData, pdpaConsent: checked === true })
                    }
                      onBlur={() => setTouched({ ...touched, pdpaConsent: true })}
                      disabled={isLoading || isSuccess}
                      className="mt-0.5 border-bark-300"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="pdpaConsent" className="text-sm text-bark-800 cursor-pointer">
                        I consent to the processing of my personal data in accordance with the
                        Personal Data Protection Act (PDPA) of Singapore
                      </Label>
                      <p className="text-xs text-bark-600">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
                  {touched.pdpaConsent && getFieldError("pdpaConsent") && (
                    <p className="text-xs text-red-600">{getFieldError("pdpaConsent")}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-12 rounded-full text-base font-semibold bg-bark-800 hover:bg-bark-900 text-white"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-ivory-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-bark-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                href={`/auth/login${returnTo !== "/" ? `?returnTo=${returnTo}` : ""}`}
              >
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full text-base font-semibold border-2"
                >
                  Sign In
                </Button>
              </Link>

              {/* Back Link */}
              <div className="text-center mt-6">
                <Link
                  href={returnTo}
                  className="text-sm text-bark-600 hover:text-tea-600"
                >
                  ← Back to {returnTo === "/checkout" ? "checkout" : "previous page"}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Main page component with Suspense for useSearchParams
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navigation />
          <main className="min-h-screen pt-32 pb-20 paper-texture">
            <div className="container-chayuan">
              <div className="max-w-lg mx-auto">
                <div className="bg-white rounded-2xl border border-ivory-300 p-8 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4 animate-pulse" />
                  <div className="h-8 bg-ivory-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-ivory-200 rounded w-3/4 mx-auto animate-pulse" />
                  <div className="mt-8 space-y-4">
                    <div className="h-12 bg-ivory-200 rounded animate-pulse" />
                    <div className="h-12 bg-ivory-200 rounded animate-pulse" />
                    <div className="h-12 bg-ivory-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
