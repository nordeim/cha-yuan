/**
 * ArticleCard Component Tests
 * TDD Phase: RED (Write failing test first)
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "../article-card";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, className }: { src: string; alt: string; fill?: boolean; className?: string }) => (
    <img src={src} alt={alt} className={className} data-fill={fill} />
  ),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const mockArticle = {
  slug: "how-to-brew-green-tea",
  title: "How to Brew Green Tea",
  excerpt: "Learn the ancient art of brewing green tea with our comprehensive guide.",
  featured_image: "/images/green-tea.jpg",
  category: {
    name: "Brewing Guides",
    slug: "brewing",
    color: "#5C8A4D",
  },
  reading_time_minutes: 5,
  published_at: "2024-01-15T10:00:00Z",
};

describe("ArticleCard", () => {
  it("renders article title", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText("How to Brew Green Tea")).toBeInTheDocument();
  });

  it("title has font-serif class", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const title = container.querySelector("h3");
    expect(title?.className).toContain("font-serif");
  });

  it("renders article excerpt", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/Learn the ancient art/)).toBeInTheDocument();
  });

  it("excerpt has line-clamp-2 class", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const excerpt = container.querySelector("p");
    expect(excerpt?.className).toContain("line-clamp-2");
  });

  it("shows category badge", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText("Brewing Guides")).toBeInTheDocument();
  });

  it("displays reading time with Clock icon", () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("shows formatted published date", () => {
    render(<ArticleCard article={mockArticle} />);
    // Should show date like "15/01/2024"
    const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });

  it("renders featured image", () => {
    render(<ArticleCard article={mockArticle} />);
    const image = screen.getByAltText("How to Brew Green Tea");
    expect(image).toHaveAttribute("src", "/images/green-tea.jpg");
  });

  it("links to article detail page", () => {
    render(<ArticleCard article={mockArticle} />);
    const links = screen.getAllByRole("link");
    const articleLink = links.find(l => l.getAttribute("href")?.includes(mockArticle.slug));
    expect(articleLink).toHaveAttribute("href", "/culture/how-to-brew-green-tea");
  });

  it("has hover effect class on image container", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    const imageWrapper = container.querySelector("[class*='group-hover']");
    expect(imageWrapper).toBeTruthy();
  });

  it("handles missing featured image gracefully", () => {
    const articleWithoutImage = { ...mockArticle, featured_image: null };
    const { container } = render(<ArticleCard article={articleWithoutImage} />);
    // Should show fallback gradient div
    const fallback = container.querySelector("[class*='bg-gradient']");
    expect(fallback).toBeTruthy();
  });

  it("renders as article element", () => {
    const { container } = render(<ArticleCard article={mockArticle} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });
});
