"use client";

import Link from "next/link";

/**
 * QuizLayout - Consistent layout wrapper for quiz pages
 *
 * Features:
 * - Ivory background with paper texture
 * - Centered content with max-width
 * - Header with logo/home link
 * - Responsive padding
 */
export function QuizLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-100 paper-texture">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-display text-bark-900 hover:text-tea-700 transition-colors"
          >
            茶源 <span className="text-sm text-bark-700">CHA YUAN</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-bark-700 hover:text-tea-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-2xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
