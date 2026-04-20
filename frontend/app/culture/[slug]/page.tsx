/**
 * Article Detail Page
 * Dynamic route for displaying full article content
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authFetch } from "@/lib/auth-fetch";
import { ArticleContent } from "@/components/article-content";
import { CategoryBadge } from "@/components/category-badge";
import { ArticleCard } from "@/components/article-card";
import { formatDate } from "@/lib/utils";
import { Clock, ChevronLeft } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  featured_image?: string | null;
  category: Category;
  reading_time_minutes: number;
  published_at: string;
  is_featured: boolean;
}

interface RelatedArticle {
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string | null;
  category: Category;
  reading_time_minutes: number;
  published_at: string;
}

async function getArticle(slug: string): Promise<Article> {
  const response = await authFetch(`/api/v1/articles/${slug}/`);

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch article");
  }

  return response.json();
}

async function getRelatedArticles(slug: string): Promise<RelatedArticle[]> {
  const response = await authFetch(`/api/v1/articles/${slug}/related/?limit=3`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const article = await getArticle(params.slug);

    return {
      title: `${article.title} | CHA YUAN (茶源)`,
      description: article.meta_description || article.excerpt,
      openGraph: {
        title: article.title,
        description: article.meta_description || article.excerpt,
        type: "article",
        publishedTime: article.published_at,
        images: article.featured_image
          ? [{ url: article.featured_image }]
          : undefined,
      },
    };
  } catch {
    return {
      title: "Article | CHA YUAN (茶源)",
    };
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, relatedArticles] = await Promise.all([
    getArticle(params.slug),
    getRelatedArticles(params.slug),
  ]);

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Back Link */}
      <div className="container-chayuan pt-8">
        <Link
          href="/culture"
          className="inline-flex items-center gap-2 text-bark-700 hover:text-tea-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tea Culture
        </Link>
      </div>

      {/* Hero Section with Featured Image */}
      {article.featured_image && (
        <section className="relative mt-8">
          <div className="container-chayuan">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 hero-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="container-chayuan">
                  <CategoryBadge
                    name={article.category.name}
                    slug={article.category.slug}
                    color={article.category.color}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Header */}
      <section className={`${article.featured_image ? "pt-8" : "pt-16"} pb-8`}>
        <div className="container-chayuan max-w-4xl">
          {!article.featured_image && (
            <div className="mb-6">
              <CategoryBadge
                name={article.category.name}
                slug={article.category.slug}
                color={article.category.color}
              />
            </div>
          )}

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-bark-900 mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-bark-700/70">
            <time dateTime={article.published_at}>
              {formatDate(article.published_at, { includeTime: false })}
            </time>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.reading_time_minutes} min read
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8">
        <div className="container-chayuan max-w-4xl">
          <ArticleContent content={article.content} />
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="section-spacing border-t border-ivory-300">
          <div className="container-chayuan">
            <h2 className="font-serif text-2xl text-bark-900 mb-8">
              More from {article.category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.slug}
                  article={relatedArticle}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
