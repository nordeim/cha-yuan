# Phase 3 Sub-Plan: Design System & Frontend Foundation

> **Phase:** 3  
> **Duration:** Days 13-16  
> **TDD Principle:** Visual regression tests → Component implementation  
> **Status:** READY FOR EXECUTION

---

## Deep Analysis: Design System Architecture

### Visual Identity Philosophy

**CHA YUAN (茶源)** represents Eastern tea heritage blended with modern lifestyle. The design system must evoke:

1. **Serenity & Mindfulness** - Calm, uncluttered interfaces
2. **Eastern Aesthetics** - Tea greens, warm ivories, terracotta accents
3. **Premium Quality** - Generous whitespace, refined typography
4. **Cultural Richness** - Playfair Display serif for headings

### Technical Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Tailwind v4** | CSS-first with `@theme` blocks, NO `tailwind.config.js` |
| **React 19** | Components use `ref` as standard prop, NO `forwardRef` |
| **Shadcn UI** | React 19-compatible components with Radix primitives |
| **Animations** | Framer Motion with reduced-motion support |
| **Typography** | Playfair Display (serif) + Inter (sans-serif) |

---

## TDD Workflow for Phase 3

### Step 1: Write Visual Test (RED)
```typescript
// components/ui/__tests__/button.test.tsx
describe("Button", () => {
  it("renders with tea-green variant", () => {
    render(<Button variant="tea">Click</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-tea-500");
  });
});
```

### Step 2: Run Test (Fails)
```bash
npm test -- Button
# EXPECTED: FAILED - Component doesn't exist
```

### Step 3: Implement Component (GREEN)
```typescript
// components/ui/button.tsx
export function Button({ variant, children }) {
  return (
    <button className={variant === "tea" ? "bg-tea-500" : ""}>
      {children}
    </button>
  );
}
```

### Step 4: Run Test (Passes)
```bash
npm test -- Button
# EXPECTED: PASSED
```

### Step 5: Refactor
Add proper TypeScript types, accessibility, and polish.

---

## Task Breakdown

### Task 3.1: Tailwind v4 Configuration

**Rationale**: Tailwind v4 uses CSS-first configuration with `@theme` blocks.

**Files to Create:**

| File | Purpose | Lines | TDD Status |
|------|---------|-------|------------|
| `app/globals.css` | Tailwind v4 entry + @theme | ~100 | Write first |
| `app/layout.tsx` | Root layout with fonts | ~60 | Write first |

**globals.css Structure:**

```css
@import "tailwindcss";

@theme {
  /* Tea Brand Color Tokens */
  --color-tea-50: #f4f7f1;
  --color-tea-100: #e6ede0;
  --color-tea-200: #cddbc2;
  --color-tea-300: #a8c290;
  --color-tea-400: #7da35e;
  --color-tea-500: #5C8A4d;
  --color-tea-600: #4a7040;
  --color-tea-700: #3b5a34;
  --color-tea-800: #31482c;
  --color-tea-900: #2a3d26;
  --color-tea-950: #141f12;
  
  --color-ivory-50: #FDFBF7;
  --color-ivory-100: #FAF6EE;
  --color-ivory-200: #F5F0E8;
  --color-ivory-300: #EDE5D8;
  --color-ivory-400: #E0D4C3;
  --color-ivory-500: #D1C1AA;
  
  --color-terra-300: #D99068;
  --color-terra-400: #C4724B;
  --color-terra-500: #B5613F;
  --color-terra-600: #A04E32;
  --color-terra-700: #86402B;
  
  --color-bark-700: #4A3728;
  --color-bark-800: #3D2B1F;
  --color-bark-900: #2A1D14;
  
  --color-gold-300: #D4B96A;
  --color-gold-400: #C5A55A;
  --color-gold-500: #B8944D;
  --color-gold-600: #A07E3C;
  
  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", "Noto Serif SC", Georgia, serif;
  
  /* Extended Spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-3xl: 2rem;
  
  /* Animations */
  --animate-fade-in-up: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-fade-in: fadeIn 0.6s ease forwards;
  --animate-slide-in-left: slideInLeft 0.6s ease forwards;
  --animate-leaf-float: leafFloat 4s ease-in-out infinite;
  --animate-steam-rise: steamRise 2.5s ease-in-out infinite;
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes leafFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(5deg); }
  }
  
  @keyframes steamRise {
    0% { opacity: 0; transform: translateY(0) scaleX(1); }
    50% { opacity: 0.6; transform: translateY(-20px) scaleX(1.2); }
    100% { opacity: 0; transform: translateY(-40px) scaleX(0.8); }
  }
}

/* Base styles */
@layer base {
  * {
    @apply border-ivory-300;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-ivory-100 text-bark-800 font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .glass-panel {
    @apply bg-ivory-50/80 backdrop-blur-xl border border-ivory-300/50;
  }
  
  .paper-texture {
    background-color: #FAF6EE;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  }
}
```

**layout.tsx with Fonts:**

```typescript
import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CHA YUAN | Premium Tea House",
  description: "Premium Eastern tea curated for the Singapore lifestyle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-SG"
      className={`${inter.variable} ${playfair.variable} ${notoSerifSC.variable}`}
    >
      <body className="min-h-screen bg-ivory-100">
        {children}
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] Write test for Tailwind config loading
- [ ] Create globals.css with @theme block
- [ ] Create layout.tsx with font loading
- [ ] Verify no tailwind.config.js exists
- [ ] Run visual test - should PASS
- [ ] Verify colors render correctly

---

### Task 3.2: Shadcn UI Components

**Rationale**: Build accessible, styled components using Shadcn patterns.

**Components to Build (Test-First):**

| Component | File | Features | Tests |
|-----------|------|----------|-------|
| `Button` | `components/ui/button.tsx` | Variants: default, tea, outline, ghost | variant rendering, click handling |
| `Card` | `components/ui/card.tsx` | Header, content, footer slots | slot rendering, styling |
| `Input` | `components/ui/input.tsx` | Label, error state, SG validation | validation, focus states |
| `Dialog` | `components/ui/dialog.tsx` | Modal with Radix, focus trap | open/close, accessibility |
| `Sheet` | `components/ui/sheet.tsx` | Slide-out panel for mobile nav | slide animation, close on overlay |

**Button Component (React 19, NO forwardRef):**

```typescript
// components/ui/button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-bark-800 text-ivory-50 hover:bg-bark-900",
        tea: "bg-tea-500 text-white hover:bg-tea-600",
        outline: "border border-ivory-400 bg-transparent hover:bg-ivory-200",
        ghost: "hover:bg-ivory-200",
        gold: "bg-gold-500 text-bark-900 hover:bg-gold-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// React 19: NO forwardRef, use ref as standard prop
export function Button({
  ref,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? React.Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

**Card Component:**

```typescript
// components/ui/card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-ivory-300 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h3
      ref={ref}
      className={cn("font-serif text-xl font-semibold text-bark-800", className)}
      {...props}
    />
  );
}

export function CardContent({
  ref,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn("pt-0", className)} {...props} />;
}
```

**Checklist:**
- [ ] Write Button component test
- [ ] Implement Button component (React 19, no forwardRef)
- [ ] Write Card component test
- [ ] Implement Card component
- [ ] Write Input component test
- [ ] Implement Input component
- [ ] Write Dialog component test
- [ ] Implement Dialog component
- [ ] Write Sheet component test
- [ ] Implement Sheet component
- [ ] Run all component tests - should PASS

---

### Task 3.3: Animation System

**Rationale**: Framer Motion animations with reduced-motion support for accessibility.

**Files to Create:**

| File | Purpose | Lines |
|------|---------|-------|
| `lib/animations.ts` | Animation variants | ~80 |
| `lib/hooks/use-reduced-motion.ts` | Detect prefers-reduced-motion | ~25 |
| `components/animation-wrapper.tsx` | Wrapper with reduced-motion support | ~40 |

**animations.ts:**

```typescript
// lib/animations.ts
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Product card hover
export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Leaf float animation
export const leafFloat = {
  animate: {
    y: [-12, 0, -12],
    rotate: [0, 5, 0],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
```

**use-reduced-motion.ts:**

```typescript
// lib/hooks/use-reduced-motion.ts
"use client";

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}
```

**Checklist:**
- [ ] Write animation variants test
- [ ] Implement animation variants
- [ ] Write use-reduced-motion test
- [ ] Implement use-reduced-motion hook
- [ ] Test with prefers-reduced-motion: reduce
- [ ] Verify all animations respect reduced-motion preference

---

## Phase 3 Success Criteria

| Criteria | Verification Method | Expected Result |
|----------|---------------------|-----------------|
| Tailwind v4 loads | `npm run dev` | No tailwind.config.js warnings |
| Colors render | Visual inspection | Tea green, ivory, gold colors visible |
| Fonts load | Browser DevTools | Playfair Display for headings, Inter for body |
| Button variants | Component test | All 5 variants render correctly |
| Card component | Component test | Slots render correctly |
| Dialog works | Manual test | Opens/closes, focus trap works |
| Sheet slides | Manual test | Slides in/out smoothly |
| Animations respect reduced-motion | Accessibility test | No motion when pref is set |

---

## Phase 3 Execution Order

1. **Write Tailwind config test** (15 min)
2. **Create globals.css with @theme** (30 min)
3. **Create layout.tsx with fonts** (20 min)
4. **Write Button component test** (15 min)
5. **Implement Button component** (30 min)
6. **Write Card component test** (15 min)
7. **Implement Card component** (25 min)
8. **Write Dialog component test** (15 min)
9. **Implement Dialog component** (35 min)
10. **Write Sheet component test** (15 min)
11. **Implement Sheet component** (30 min)
12. **Write animation tests** (15 min)
13. **Implement animation utilities** (25 min)
14. **Run all tests** (10 min)

**Total Estimated Time:** ~5.5 hours

---

## TDD Commitment for Phase 3

```typescript
// Example TDD workflow for Button component

// 1. RED - Write failing test
describe("Button", () => {
  it("renders tea variant with correct classes", () => {
    render(<Button variant="tea">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-tea-500");
  });
});

// 2. Run test - FAILS

// 3. GREEN - Implement minimal code
export function Button({ variant, children, ...props }) {
  return (
    <button
      className={variant === "tea" ? "bg-tea-500 text-white" : ""}
      {...props}
    >
      {children}
    </button>
  );
}

// 4. Run test - PASSES

// 5. REFACTOR - Add full implementation with cva
```

---

## Validation Checklist Against Master Plan

| Master Plan Requirement | Phase 3 Implementation | Status |
|-------------------------|----------------------|--------|
| Tailwind v4 @theme | ✅ globals.css with @theme block | Planned |
| No tailwind.config.js | ✅ CSS-first configuration | Planned |
| React 19 no forwardRef | ✅ Components use ref prop | Planned |
| Shadcn UI components | ✅ Button, Card, Dialog, Sheet | Planned |
| Tea brand colors | ✅ Complete color palette in @theme | Planned |
| Typography | ✅ Playfair Display + Inter | Planned |
| Animations | ✅ Framer Motion with reduced-motion | Planned |

**Ready to execute Phase 3?**

> `✅ CONFIRM: Proceed with Phase 3 Implementation`
