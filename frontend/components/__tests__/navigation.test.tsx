/**
 * Navigation Component Tests
 * TDD Phase: RED (Write failing test first)
 * Tests for header navigation link behavior on non-home pages
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Navigation } from "@/components/sections/navigation";

// Mock useReducedMotion hook
vi.mock("@/lib/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => false,
}));

// Mock useCart hook
vi.mock("@/lib/hooks/use-cart", () => ({
  useCart: () => ({
    cart: undefined,
    isLoading: false,
    error: null,
    itemCount: 0,
    totalItems: 0,
    subtotal: "0.00",
    gstAmount: "0.00",
    total: "0.00",
    addItem: { mutate: vi.fn(), isPending: false },
    updateItem: { mutate: vi.fn(), isPending: false },
    removeItem: { mutate: vi.fn(), isPending: false },
    clear: { mutate: vi.fn(), isPending: false },
  }),
}));

// Mock Next.js Link to capture href values
const mockHrefValues: string[] = [];
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => {
    mockHrefValues.push(href);
    return (
      <a href={href} className={className} onClick={onClick} data-href={href}>
        {children}
      </a>
    );
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    nav: ({ children, ...props }: { children: React.ReactNode }) => (
      <nav {...props}>{children}</nav>
    ),
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("Navigation", () => {
  beforeEach(() => {
    mockHrefValues.length = 0;
    // Mock window.scrollY
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 0,
    });
  });

  describe("Navigation Link Hrefs", () => {
    it("nav items should use absolute paths for anchor links", () => {
      render(<Navigation />);

      // Check that nav items use absolute paths (/#section instead of #section)
      const expectedAbsolutePaths = [
        "/#philosophy",
        "/#collection",
        "/#culture",
        "/#subscribe",
      ];

      // Each nav item should use absolute path starting with /
      expectedAbsolutePaths.forEach((expectedPath) => {
        const found = mockHrefValues.some((href) => href === expectedPath);
        expect(
          found,
          `Expected nav item to use absolute path ${expectedPath}, but found ${JSON.stringify(
            mockHrefValues
          )}`
        ).toBe(true);
      });
    });

    it("should not use relative anchor paths that break on non-home pages", () => {
      render(<Navigation />);

      // Check that there are NO relative anchor paths (without leading /)
      const relativeAnchorPaths = ["#philosophy", "#collection", "#culture", "#subscribe"];

      relativeAnchorPaths.forEach((relativePath) => {
        const found = mockHrefValues.some((href) => href === relativePath);
        expect(
          found,
          `Nav items should NOT use relative path ${relativePath} as it breaks on non-home pages. Found ${JSON.stringify(
            mockHrefValues
          )}`
        ).toBe(false);
      });
    });

    it("shop link should use /products path", () => {
      render(<Navigation />);

      // Shop now points to /products as a normal link
      const shopLinkFound = mockHrefValues.some((href) => href === "/products");
      expect(
        shopLinkFound,
        `Expected shop link to use /products, but found ${JSON.stringify(mockHrefValues)}`
      ).toBe(true);

      // Should NOT use old /#shop anchor
      const oldShopFound = mockHrefValues.some((href) => href === "/#shop");
      expect(
        oldShopFound,
        `Shop link should NOT use old /#shop. Found ${JSON.stringify(mockHrefValues)}`
      ).toBe(false);
    });
  });

  describe("Logo Link", () => {
    it("logo should link to home page /", () => {
      render(<Navigation />);

      const homeLinkFound = mockHrefValues.some((href) => href === "/");
      expect(homeLinkFound).toBe(true);
    });
  });
});
