/**
 * ArticleCard Component
 * TDD Phase: GREEN (Minimal implementation to pass tests)
 *
 * Card component for displaying article previews in grids.
 * Features:
 * - Featured image with fallback gradient
 * - Category badge with color
 * - Title with serif font
 * - Excerpt with line clamp
 * - Reading time and date
 * - Hover animation on image
 * - Links to article detail page
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";

interface ArticleCardProps {
  article: {
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
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/culture/${article.slug}`} className="block">
        {/* Featured Image */}
        <div className="relative aspect-[16/10] bg-ivory-200 rounded-xl overflow-hidden mb-4">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-tea-100 to-ivory-300" />
          )}
          <div className="absolute top-4 left-4">
            <CategoryBadge
              name={article.category.name}
              slug={article.category.slug}
              color={article.category.color}
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-serif text-xl text-bark-900 group-hover:text-tea-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-bark-700/70 text-sm line-clamp-2">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-bark-700/60 pt-2">
            <time dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time_minutes} min read
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
