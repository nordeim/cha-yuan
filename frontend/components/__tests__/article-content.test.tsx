/**
 * ArticleContent Component Tests
 * TDD Phase: RED (Write failing test first)
 *
 * Tests for markdown rendering with custom styling.
 * Validates all markdown elements render with correct tea brand classes.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleContent } from "../article-content";

// Comprehensive markdown test content covering all element types
const markdownContent = `# Brewing Green Tea

## Introduction

Green tea is one of the most popular teas in the world. It offers numerous health benefits and a delicate flavor profile.

### Health Benefits

- Rich in antioxidants
- Boosts metabolism
- Improves brain function
- Supports heart health

## Brewing Instructions

1. Heat water to 80°C
2. Add 2g of tea leaves per 100ml
3. Steep for 2-3 minutes
4. Strain and enjoy

> Pro tip: Don't use boiling water! High temperatures can make green tea bitter.

Visit [our complete guide](/guides/brewing) for more detailed instructions.

For best results, use \`filtered water\` instead of tap water.

\`\`\`python
# Example brewing timer
steep_time = 180  # seconds
temperature = 80  # celsius
print(f"Steep for {steep_time} seconds at {temperature}°C")
\`\`\`

| Temperature | Time | Tea Type |
|-------------|------|----------|
| 80°C | 2-3 min | Green Tea |
| 90°C | 3-4 min | Oolong |
| 100°C | 4-5 min | Black Tea |

---

Learn more about the [history of green tea](https://example.com/history).

![Green tea brewing](/images/green-tea-brewing.jpg)

That's all for now!`;

describe("ArticleContent", () => {
  it("renders h1 heading with correct styling", () => {
    render(<ArticleContent content="# Main Title" />);
    const h1 = screen.getByText("Main Title");
    expect(h1.tagName).toBe("H1");
    expect(h1.className).toContain("font-serif");
    expect(h1.className).toContain("text-4xl");
    expect(h1.className).toContain("text-bark-900");
  });

  it("renders h2 heading with correct styling", () => {
    const { container } = render(<ArticleContent content="## Section Title" />);
    const h2 = container.querySelector("h2");
    expect(h2).toBeInTheDocument();
    expect(h2?.className).toContain("font-serif");
    expect(h2?.className).toContain("text-2xl");
    expect(h2?.className).toContain("text-bark-900");
    expect(h2?.className).toContain("mt-8");
  });

  it("renders h3 heading with correct styling", () => {
    const { container } = render(<ArticleContent content="### Subsection" />);
    const h3 = container.querySelector("h3");
    expect(h3).toBeInTheDocument();
    expect(h3?.className).toContain("font-serif");
    expect(h3?.className).toContain("text-xl");
  });

  it("renders paragraphs with correct styling", () => {
    const { container } = render(
      <ArticleContent content="This is a paragraph." />
    );
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.className).toContain("text-bark-700");
    expect(paragraph?.className).toContain("leading-relaxed");
  });

  it("renders links with tea brand colors", () => {
    const { container } = render(
      <ArticleContent content="[Link text](/path)" />
    );
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link?.className).toContain("text-tea-600");
    expect(link?.className).toContain("hover:underline");
    expect(link).toHaveAttribute("href", "/path");
  });

  it("renders unordered lists with proper styling", () => {
    const { container } = render(
      <ArticleContent content={"- Item 1\n- Item 2"} />
    );
    const ul = container.querySelector("ul");
    expect(ul).toBeInTheDocument();
    expect(ul?.className).toContain("list-disc");
    expect(ul?.className).toContain("list-inside");

    const lis = container.querySelectorAll("li");
    expect(lis).toHaveLength(2);
  });

  it("renders ordered lists with proper styling", () => {
    const { container } = render(
      <ArticleContent content={"1. First\n2. Second"} />
    );
    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();
    expect(ol?.className).toContain("list-decimal");
  });

  it("renders blockquotes with left border styling", () => {
    const { container } = render(
      <ArticleContent content="> This is a quote" />
    );
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.className).toContain("border-l-4");
    expect(blockquote?.className).toContain("border-tea-500");
    expect(blockquote?.className).toContain("italic");
  });

  it("renders inline code with proper styling", () => {
    const { container } = render(
      <ArticleContent content="Use `console.log()` for debugging" />
    );
    const code = container.querySelector("code");
    expect(code).toBeInTheDocument();
    expect(code?.className).toContain("bg-ivory-200");
    expect(code?.className).toContain("font-mono");
  });

  it("renders code blocks with proper styling", () => {
    const { container } = render(
      <ArticleContent content={"```\nconst x = 1;\n```"} />
    );
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.className).toContain("bg-ivory-200");
    expect(pre?.className).toContain("rounded-lg");
  });

  it("renders tables with responsive wrapper", () => {
    const { container } = render(
      <ArticleContent content={"| A | B |\n|---|---|\n| 1 | 2 |"} />
    );
    const tableWrapper = container.querySelector(".overflow-x-auto");
    expect(tableWrapper).toBeInTheDocument();

    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
    expect(table?.className).toContain("min-w-full");
  });

  it("renders images with rounded corners", () => {
    const { container } = render(
      <ArticleContent content="![Alt text](/image.jpg)" />
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/image.jpg");
    expect(img).toHaveAttribute("alt", "Alt text");
    expect(img?.className).toContain("rounded-lg");
  });

  it("renders horizontal rules", () => {
    const { container } = render(<ArticleContent content="---" />);
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
    expect(hr?.className).toContain("border-ivory-300");
  });

  it("renders complex markdown with all elements", () => {
    const { container } = render(<ArticleContent content={markdownContent} />);

    // Verify structure exists
    expect(container.querySelector("h1")).toBeInTheDocument();
    expect(container.querySelector("h2")).toBeInTheDocument();
    expect(container.querySelector("h3")).toBeInTheDocument();
    expect(container.querySelectorAll("p").length).toBeGreaterThan(0);
    expect(container.querySelector("ul")).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(container.querySelector("blockquote")).toBeInTheDocument();
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("hr")).toBeInTheDocument();

    // Verify specific content
    expect(screen.getByText("Brewing Green Tea")).toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Health Benefits")).toBeInTheDocument();
    expect(screen.getByText("Brewing Instructions")).toBeInTheDocument();

    // Verify links
    expect(screen.getByText("our complete guide")).toBeInTheDocument();

    // Verify list items
    expect(screen.getByText("Rich in antioxidants")).toBeInTheDocument();
    expect(screen.getByText("Heat water to 80°C")).toBeInTheDocument();

    // Verify code
    expect(screen.getByText(/Example brewing timer/)).toBeInTheDocument();

    // Verify table content
    expect(screen.getByText("80°C")).toBeInTheDocument();
    expect(screen.getByText("Green Tea")).toBeInTheDocument();
  });

  it("handles empty content gracefully", () => {
    render(<ArticleContent content="" />);
    expect(document.querySelector(".article-content")).toBeInTheDocument();
  });

  it("handles content with special characters", () => {
    render(
      <ArticleContent content="# Special: chars & symbols < >" />
    );
    expect(screen.getByText(/Special: chars & symbols/)).toBeInTheDocument();
  });
});
