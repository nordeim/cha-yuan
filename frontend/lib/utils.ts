import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-tea-green-600", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for Singapore Dollar (SGD)
 * Follows Singapore conventions with $ symbol
 *
 * @example
 * formatPrice(29.90) // "$29.90"
 * formatPrice(29.90, { includeGST: true }) // "$29.90 (incl. GST)"
 */
export function formatPrice(
  price: number,
  options: { includeGST?: boolean; showCents?: boolean } = {}
): string {
  const { includeGST = false, showCents = true } = options;

  const formatter = new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });

  const formatted = formatter.format(price);
  return includeGST ? `${formatted} (incl. GST)` : formatted;
}

/**
 * Calculate GST amount for Singapore (9%)
 * Returns both the GST amount and total with GST
 *
 * @example
 * calculateGST(100) // { amount: 9, total: 109, rate: 0.09 }
 */
export function calculateGST(price: number): {
  amount: number;
  total: number;
  rate: number;
} {
  const GST_RATE = 0.09; // 9% GST for Singapore
  const amount = Math.round(price * GST_RATE * 100) / 100;
  const total = Math.round((price + amount) * 100) / 100;

  return { amount, total, rate: GST_RATE };
}

/**
 * Format a date for Singapore locale
 * Uses DD/MM/YYYY format common in Singapore
 *
 * @example
 * formatDate(new Date("2024-01-15")) // "15/01/2024"
 * formatDate(new Date(), { includeTime: true }) // "15/01/2024, 2:30 PM"
 */
export function formatDate(
  date: Date | string | number,
  options: { includeTime?: boolean; relative?: boolean } = {}
): string {
  const { includeTime = false, relative = false } = options;
  const d = new Date(date);

  if (relative) {
    const now = new Date();
    const diffInMs = now.getTime() - d.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
      }
      return `${diffInHours}h ago`;
    }
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  }

  const formatter = new Intl.DateTimeFormat("en-SG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  });

  return formatter.format(d);
}

/**
 * Generate a unique ID for React keys or DOM IDs
 * Uses crypto.randomUUID if available, falls back to timestamp + random
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce a function call
 * Delays execution until after wait milliseconds have elapsed
 *
 * @example
 * const debouncedSearch = debounce((query) => searchAPI(query), 300)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle a function call
 * Limits execution to once per wait period
 *
 * @example
 * const throttledScroll = throttle(() => handleScroll(), 100)
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
    }
  };
}

/**
 * Wait for a specified duration
 * Useful for adding delays in async flows
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if code is running on the client side
 * Safe to use for browser-only APIs
 */
export function isClient(): boolean {
  return typeof window !== "undefined";
}

/**
 * Check if code is running on the server side
 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/**
 * Safely access localStorage with fallback
 * Handles SSR and disabled localStorage scenarios
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail (e.g., private browsing mode)
  }
}
