import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn(() => "/checkout") }),
}));

// Mock Navigation and Footer components
vi.mock("@/components/sections/navigation", () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock("@/components/sections/footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

// Mock useReducedMotion hook
vi.mock("@/lib/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => true,
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export default component", async () => {
    // Import dynamically since Vitest module resolution
    const { default: RegisterPage } = await import("@/app/auth/register/page");
    expect(RegisterPage).toBeDefined();
    expect(typeof RegisterPage).toBe("function");
  });
});

describe("RegisterPage UI", () => {
  it("renders Navigation and Footer", async () => {
    const { default: RegisterPage } = await import("@/app/auth/register/page");
    render(<RegisterPage />);

    expect(screen.getByTestId("navigation")).toBeDefined();
    expect(screen.getByTestId("footer")).toBeDefined();
  });

  it("has link to login page", async () => {
    const { default: RegisterPage } = await import("@/app/auth/register/page");
    render(<RegisterPage />);

    // Find all links and check for login link
    const links = screen.getAllByRole("link");
    const loginLink = links.find(l => l.textContent?.includes("Sign In"));
    expect(loginLink).toBeDefined();
    expect(loginLink?.getAttribute("href")).toContain("/auth/login");
  });

  it("renders form elements", async () => {
    const { default: RegisterPage } = await import("@/app/auth/register/page");
    render(<RegisterPage />);

    // Check for email input
    expect(screen.getByLabelText(/email/i)).toBeDefined();

    // Check for first name
    expect(screen.getByLabelText(/first name/i)).toBeDefined();

    // Check for last name
    expect(screen.getByLabelText(/last name/i)).toBeDefined();

    // Check for phone
    expect(screen.getByLabelText(/phone/i)).toBeDefined();

    // Check for postal code
    expect(screen.getByLabelText(/postal code/i)).toBeDefined();

    // Check for consent text
    expect(screen.getByText(/i consent to the processing/i)).toBeDefined();
  });
});
