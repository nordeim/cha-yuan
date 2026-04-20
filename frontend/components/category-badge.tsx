/**
 * CategoryBadge Component
 * TDD Phase: GREEN (Minimal implementation to pass tests)
 *
 * A colored badge for article categories with link to category page.
 * Features:
 * - Customizable background color
 * - Default color: tea-500 (#5C8A4D)
 * - Rounded pill shape
 * - Hover scale animation
 * - Links to category filter page
 */

"use client";

import Link from "next/link";

interface CategoryBadgeProps {
  /** Display name of the category */
  name: string;
  /** URL-friendly slug for the category */
  slug: string;
  /** Hex color code (default: #5C8A4D) */
  color?: string | undefined;
}

/**
 * CategoryBadge - A styled badge for article categories
 *
 * @example
 * <CategoryBadge name="Brewing Guides" slug="brewing" />
 * <CategoryBadge name="History" slug="history" color="#C4724B" />
 */
export function CategoryBadge({
  name,
  slug,
  color = "#5C8A4D",
}: CategoryBadgeProps) {
  return (
    <Link
      href={`/culture?category=${slug}`}
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
      aria-label={`Filter by category: ${name}`}
    >
      {name}
    </Link>
  );
}
