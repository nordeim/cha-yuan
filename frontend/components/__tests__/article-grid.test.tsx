/**
 * ArticleGrid Component Tests
 * TDD Phase: RED (Write failing test first)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleGrid } from "../article-grid";

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockArticles = [
  {
    slug: "article-1",
    title: "Article 1",
    excerpt: "Excerpt 1",
    featured_image: "/img1.jpg",
    category: { name: "Category 1", slug: "cat1", color: "#5C8A4D" },
    reading_time_minutes: 3,
    published_at: "2024-01-15T10:00:00Z",
  },
  {
    slug: "article-2",
    title: "Article 2",
    excerpt: "Excerpt 2",
    featured_image: "/img2.jpg",
    category: { name: "Category 2", slug: "cat2", color: "#C4724B" },
    reading_time_minutes: 5,
    published_at: "2024-01-14T10:00:00Z",
  },
  {
    slug: "article-3",
    title: "Article 3",
    excerpt: "Excerpt 3",
    featured_image: null,
    category: { name: "Category 3", slug: "cat3", color: "#2A3D26" },
    reading_time_minutes: 7,
    published_at: "2024-01-13T10:00:00Z",
  },
];

describe("ArticleGrid", () => {
  it("renders grid container", () => {
    const { container } = render(<ArticleGrid articles={mockArticles} />);
    const grid = container.querySelector("[class*='grid']");
    expect(grid).toBeInTheDocument();
  });

  it("renders correct number of articles", () => {
    render(<ArticleGrid articles={mockArticles} />);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
  });

  it("renders all article titles", () => {
    render(<ArticleGrid articles={mockArticles} />);
    expect(screen.getByText("Article 1")).toBeInTheDocument();
    expect(screen.getByText("Article 2")).toBeInTheDocument();
    expect(screen.getByText("Article 3")).toBeInTheDocument();
  });

  it("has responsive grid classes", () => {
    const { container } = render(<ArticleGrid articles={mockArticles} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid?.className).toContain("grid-cols-1");
    expect(grid?.className).toContain("md:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-3");
  });

  it("handles empty articles array", () => {
    const { container } = render(<ArticleGrid articles={[]} />);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(0);
  });
});
