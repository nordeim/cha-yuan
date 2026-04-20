/**
 * ArticleGrid Component
 * TDD Phase: GREEN (Minimal implementation to pass tests)
 *
 * Responsive grid for displaying article cards.
 * Features:
 * - Responsive columns (1 mobile, 2 tablet, 3 desktop)
 * - Staggered animation on mount
 * - Reuses ArticleCard component
 */

"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "./article-card";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string | null;
  category: {
    name: string;
    slug: string;
    color?: string;
  };
  reading_time_minutes: number;
  published_at: string;
}

interface ArticleGridProps {
  articles: Article[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {articles.map((article, index) => (
        <motion.div
          key={article.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <ArticleCard article={article} />
        </motion.div>
      ))}
    </motion.div>
  );
}
