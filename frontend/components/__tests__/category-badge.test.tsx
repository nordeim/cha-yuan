/**
 * CategoryBadge Component Tests
 * TDD Phase: RED (Write failing test first)
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBadge } from "../category-badge";

describe("CategoryBadge", () => {
  it("renders category name", () => {
    render(<CategoryBadge name="Brewing Guides" slug="brewing" />);
    expect(screen.getByText("Brewing Guides")).toBeInTheDocument();
  });

  it("renders with custom color", () => {
    const { container } = render(
      <CategoryBadge name="History" slug="history" color="#C4724B" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: "#C4724B" });
  });

  it("uses default color when not provided", () => {
    const { container } = render(
      <CategoryBadge name="Tasting" slug="tasting" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: "#5C8A4D" });
  });

  it("links to category page", () => {
    render(<CategoryBadge name="Brewing" slug="brewing" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/culture?category=brewing");
  });

  it("applies hover scale animation class", () => {
    const { container } = render(
      <CategoryBadge name="Tea" slug="tea" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("hover:scale-105");
  });

  it("has rounded-full border radius", () => {
    const { container } = render(
      <CategoryBadge name="Test" slug="test" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("rounded-full");
  });
});
