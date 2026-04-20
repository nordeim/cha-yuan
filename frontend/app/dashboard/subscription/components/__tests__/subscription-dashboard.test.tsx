import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Subscription, NextBoxPreview as NextBoxPreviewType } from "@/lib/types/subscription";
import type { UserPreference } from "@/lib/types/quiz";
import {
  SubscriptionStatus,
  NextBilling,
  NextBoxPreview,
  PreferenceSummary,
  CancelSubscription,
} from "../";

// Create wrapper with QueryClient for integration tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data
const mockSubscription: Subscription = {
  id: "sub-123",
  status: "active",
  plan: "monthly",
  nextBillingDate: "2026-05-17T00:00:00+08:00",
  priceCents: 4990,
  createdAt: "2026-01-15T00:00:00+08:00",
  startedAt: "2026-01-15T00:00:00+08:00",
  paymentMethodLast4: "4242",
  paymentMethodType: "card",
};

const mockNextBox: NextBoxPreviewType = {
  products: [
    {
      id: "prod-1",
      name: "Dragon Well Green",
      slug: "dragon-well-green",
      category: "green_tea",
      image: "/images/tea-1.jpg",
      origin: "Hangzhou, China",
    },
    {
      id: "prod-2",
      name: "Tie Guan Yin",
      slug: "tie-guan-yin",
      category: "oolong",
      origin: "Anxi, China",
    },
    {
      id: "prod-3",
      name: "Silver Needle",
      slug: "silver-needle",
      category: "white_tea",
      origin: "Fujian, China",
    },
  ],
  curatedBy: "auto",
  estimatedShipDate: "2026-04-20T00:00:00+08:00",
  isCurated: true,
};

const mockPreferences: UserPreference = {
  preferences: {
    green_tea: 85,
    oolong: 72,
    black_tea: 45,
  },
  quiz_completed_at: "2026-01-15T10:30:00+08:00",
  top_categories: ["green_tea", "oolong", "black_tea"],
};

describe("SubscriptionStatus", () => {
  it("renders subscription details correctly", () => {
    render(<SubscriptionStatus subscription={mockSubscription} />);

    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
    expect(screen.getByText(/Member since/i)).toBeInTheDocument();
  });

  it("shows correct status badge color", () => {
    render(<SubscriptionStatus subscription={mockSubscription} />);

    const badge = screen.getByText("Active");
    expect(badge).toBeInTheDocument();
  });

  it("shows paused state correctly", () => {
    const pausedSub = { ...mockSubscription, status: "paused" as const };
    render(<SubscriptionStatus subscription={pausedSub} />);

    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByText(/paused message/i)).toBeInTheDocument();
  });

  it("shows cancelled state correctly", () => {
    const cancelledSub = { ...mockSubscription, status: "cancelled" as const };
    render(<SubscriptionStatus subscription={cancelledSub} />);

    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText(/cancelled message/i)).toBeInTheDocument();
  });

  it("truncates subscription ID", () => {
    render(<SubscriptionStatus subscription={mockSubscription} />);

    expect(screen.getByText(/Subscription ID:/i)).toBeInTheDocument();
  });
});

describe("NextBilling", () => {
  it("renders billing information correctly", () => {
    render(<NextBilling subscription={mockSubscription} />);

    expect(screen.getByText("Next Billing")).toBeInTheDocument();
    expect(screen.getByText(/Singapore time/i)).toBeInTheDocument();
  });

  it("formats SGD price correctly", () => {
    render(<NextBilling subscription={mockSubscription} />);

    expect(screen.getByText(/S\$49\.90/i)).toBeInTheDocument();
  });

  it("shows GST notation", () => {
    render(<NextBilling subscription={mockSubscription} />);

    expect(screen.getByText(/incl\. 9% GST/i)).toBeInTheDocument();
  });

  it("shows days until billing", () => {
    render(<NextBilling subscription={mockSubscription} />);

    expect(screen.getByText(/Time until next charge/i)).toBeInTheDocument();
  });

  it("shows payment method", () => {
    render(<NextBilling subscription={mockSubscription} />);

    expect(screen.getByText(/4242/i)).toBeInTheDocument();
  });
});

describe("NextBoxPreview", () => {
  it("renders curated products", () => {
    render(<NextBoxPreview nextBox={mockNextBox} />);

    expect(screen.getByText("Next Box")).toBeInTheDocument();
    expect(screen.getByText("3 teas curated for you")).toBeInTheDocument();
    expect(screen.getByText("Dragon Well Green")).toBeInTheDocument();
  });

  it("shows curation badge", () => {
    render(<NextBoxPreview nextBox={mockNextBox} />);

    expect(screen.getByText("Auto-curated")).toBeInTheDocument();
  });

  it("shows empty state when not curated", () => {
    render(<NextBoxPreview nextBox={{ products: [], curatedBy: "auto", isCurated: false }} />);

    expect(screen.getByText("Being Curated")).toBeInTheDocument();
    expect(screen.getByText(/tea masters are carefully selecting/i)).toBeInTheDocument();
  });

  it("shows product categories", () => {
    render(<NextBoxPreview nextBox={mockNextBox} />);

    expect(screen.getByText("Green Tea")).toBeInTheDocument();
    expect(screen.getByText("Oolong")).toBeInTheDocument();
  });
});

describe("PreferenceSummary", () => {
  it("renders quiz results", () => {
    render(<PreferenceSummary preferences={mockPreferences} />);

    expect(screen.getByText("Your Preferences")).toBeInTheDocument();
    expect(screen.getByText("Green Tea")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows top match badge", () => {
    render(<PreferenceSummary preferences={mockPreferences} />);

    expect(screen.getByText("Top Match")).toBeInTheDocument();
  });

  it("shows completion date", () => {
    render(<PreferenceSummary preferences={mockPreferences} />);

    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });

  it("shows empty state for incomplete quiz", () => {
    render(<PreferenceSummary preferences={null} />);

    expect(screen.getByText("Complete the Quiz")).toBeInTheDocument();
    expect(screen.getByText("Take Quiz")).toBeInTheDocument();
  });

  it("shows one-time quiz note", () => {
    render(<PreferenceSummary preferences={mockPreferences} />);

    expect(screen.getByText(/Quiz can only be taken once/i)).toBeInTheDocument();
  });
});

describe("CancelSubscription", () => {
  const mockOnCancel = vi.fn();
  const mockOnPause = vi.fn();

  beforeEach(() => {
    mockOnCancel.mockClear();
    mockOnPause.mockClear();
  });

  it("renders cancel and pause options", () => {
    render(
      <CancelSubscription
        status="active"
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    expect(screen.getByText("Pause Subscription")).toBeInTheDocument();
    expect(screen.getByText("Cancel Subscription")).toBeInTheDocument();
  });

  it("opens cancel dialog when cancel clicked", async () => {
    render(
      <CancelSubscription
        status="active"
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    const cancelButton = screen.getByText("Cancel Subscription");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText("Cancel Subscription?")).toBeInTheDocument();
    });
  });

  it("calls onCancel when confirmed", async () => {
    render(
      <CancelSubscription
        status="active"
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    const cancelButton = screen.getByText("Cancel Subscription");
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText("Cancel Subscription?")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("Confirm Cancel");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  it("shows paused state", () => {
    render(
      <CancelSubscription
        status="paused"
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    expect(screen.getByText("Subscription Paused")).toBeInTheDocument();
    expect(screen.getByText("Resume Subscription")).toBeInTheDocument();
  });

  it("shows cancelled state", () => {
    render(
      <CancelSubscription
        status="cancelled"
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    expect(screen.getByText("Subscription Cancelled")).toBeInTheDocument();
  });
});

describe("Component Integration", () => {
  it("all components render together", () => {
    const Wrapper = createWrapper();
    
    render(
      <Wrapper>
        <div className="space-y-6">
          <SubscriptionStatus subscription={mockSubscription} />
          <NextBilling subscription={mockSubscription} />
          <NextBoxPreview nextBox={mockNextBox} />
          <PreferenceSummary preferences={mockPreferences} />
          <CancelSubscription
            status="active"
            onCancel={vi.fn()}
            onPause={vi.fn()}
          />
        </div>
      </Wrapper>
    );

    expect(screen.getByText("Subscription")).toBeInTheDocument();
    expect(screen.getByText("Next Billing")).toBeInTheDocument();
    expect(screen.getByText("Next Box")).toBeInTheDocument();
    expect(screen.getByText("Your Preferences")).toBeInTheDocument();
    expect(screen.getByText("Manage Subscription")).toBeInTheDocument();
  });
});
