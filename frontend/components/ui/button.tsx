"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ============================================
   BUTTON COMPONENT - Shadcn UI Style
   React 19 Compatible (no forwardRef)
   ============================================ */

const buttonVariants = cva(
  // Base styles matching our tea brand aesthetic
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tea-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary: Tea green background
        default:
          "bg-tea-600 text-white hover:bg-tea-700 shadow-sm hover:shadow-md",
        // Tea: Explicit tea variant for semantic clarity
        tea:
          "bg-tea-600 text-white hover:bg-tea-700 shadow-sm hover:shadow-md",
        // Destructive: For delete/remove actions
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        // Outline: Bordered style
        outline:
          "border-2 border-ivory-300 bg-ivory-50 text-bark-900 hover:bg-ivory-100 hover:border-ivory-400",
        // Secondary: Muted background
        secondary:
          "bg-ivory-200 text-bark-900 hover:bg-ivory-300",
        // Ghost: Transparent with hover
        ghost:
          "text-bark-700 hover:bg-ivory-100 hover:text-bark-900",
        // Link: Text only
        link:
          "text-tea-600 underline-offset-4 hover:underline hover:text-tea-700",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/* ============================================
   TYPES & INTERFACES
   ============================================ */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element using Radix Slot */
  asChild?: boolean;
  /** Show loading state with spinner */
  loading?: boolean;
  /** Loading text to display (default: "Loading...") */
  loadingText?: string;
}

/* ============================================
   COMPONENT
   ============================================ */

/**
 * Button component with tea brand styling
 * React 19 compatible - uses ref as standard prop
 *
 * @example
 * <Button>Click me</Button>
 * <Button variant="outline" size="lg">Large Outline</Button>
 * <Button loading>Loading...</Button>
 * <Button asChild><a href="/">Link Button</a></Button>
 */
export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText = "Loading...",
  disabled,
  children,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

/* ============================================
   SPINNER SUBCOMPONENT
   ============================================ */

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <svg
      className={cn("animate-spin", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

Button.displayName = "Button";
export { buttonVariants };
export type { VariantProps };
