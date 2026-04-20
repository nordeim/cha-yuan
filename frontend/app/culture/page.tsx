/**
 * Culture Listing Page
 * Server Component for tea culture articles
 */

import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { authFetch } from "@/lib/auth-fetch";
import { ArticleGrid } from "@/components/article-grid";
import { Search, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Tea Culture | CHA YUAN (茶源)",
  description: "Explore the art of tea through brewing guides, tasting notes, and historical insights from tea masters.",
};

// Mark as dynamic since we use cookies for auth
export const dynamic = "force-dynamic";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string | null;
  category: Category;
  reading_time_minutes: number;
  published_at: string;
}

interface PaginatedResponse {
  items: Article[];
  count: number;
  page: number;
  pages: number;
}

async function getArticles(
  category?: string,
  search?: string,
  page: number = 1
): Promise<PaginatedResponse> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  params.set("page", String(page));

  const response = await authFetch(`/api/v1/articles/?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  return response.json();
}

async function getCategories(): Promise<Category[]> {
  const response = await authFetch("/api/v1/categories/");

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export default async function CulturePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = searchParams.category as string | undefined;
  const search = searchParams.search as string | undefined;
  const page = parseInt(searchParams.page as string) || 1;

  const [articlesData, categories] = await Promise.all([
    getArticles(category, search, page),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-bark-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-bark-900 via-bark-900/90 to-bark-900" />
        </div>
        <div className="relative container-chayuan text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ivory-100 mb-6">
            Tea Culture
          </h1>
          <p className="text-xl text-ivory-200/80 max-w-2xl mx-auto">
            Discover the art of tea through brewing guides, tasting notes, and historical insights
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 border-b border-ivory-300 bg-white">
        <div className="container-chayuan">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/culture"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !category
                    ? "bg-tea-600 text-white"
                    : "bg-ivory-200 text-bark-700 hover:bg-ivory-300"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/culture?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? "bg-tea-600 text-white"
                      : "bg-ivory-200 text-bark-700 hover:bg-ivory-300"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Search */}
            <form className="relative w-full md:w-auto">
              <input
                type="text"
                name="search"
                placeholder="Search articles..."
                defaultValue={search || ""}
                className="input-base pl-10 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bark-700/50" />
            </form>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section-spacing">
        <div className="container-chayuan">
          <Suspense fallback={<ArticlesSkeleton />}>
            {articlesData.items.length > 0 ? (
              <>
                <ArticleGrid articles={articlesData.items} />

                {/* Pagination */}
                {articlesData.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: articlesData.pages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`/culture?${new URLSearchParams({
                            ...(category && { category }),
                            ...(search && { search }),
                            page: String(pageNum),
                          }).toString()}`}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            pageNum === page
                              ? "bg-tea-600 text-white"
                              : "bg-ivory-200 text-bark-700 hover:bg-ivory-300"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              <EmptyState />
            )}
          </Suspense>
        </div>
      </section>
    </div>
  );
}

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[16/10] bg-ivory-200 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <BookOpen className="w-16 h-16 text-ivory-400 mx-auto mb-4" />
      <h3 className="font-serif text-2xl text-bark-900 mb-2">
        No articles found
      </h3>
      <p className="text-bark-700/70">
        Check back soon for new tea culture content.
      </p>
    </div>
  );
}
