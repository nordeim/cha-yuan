import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizIntro } from "../quiz-intro";
import { QuizQuestion } from "../quiz-question";
import { QuizProgress } from "../quiz-progress";
import { QuizResults } from "../quiz-results";
import { QuizLayout } from "../quiz-layout";

// Mock hooks
vi.mock("@/lib/hooks/use-reduced-motion", () => ({
  useReducedMotion: () => false,
}));

// Mock auth hooks
vi.mock("@/lib/auth-fetch", () => ({
  getCurrentUser: vi.fn(() =>
    Promise.resolve({
      email: "test@example.com",
      first_name: "Test",
      last_name: "User",
    })
  ),
}));

vi.mock("@/lib/hooks/use-quiz", () => ({
  useQuizCompletionStatus: () => ({
    hasCompleted: false,
    isLoading: false,
    error: null,
  }),
}));

describe("QuizIntro", () => {
  const mockStart = vi.fn();
  const mockSkip = vi.fn();

  it("renders intro screen with title", () => {
    render(<QuizIntro onStart={mockStart} onSkip={mockSkip} />);

    expect(screen.getByText("Discover Your Tea Preferences")).toBeInTheDocument();
  });

  it("renders subtitle and benefits", () => {
    render(<QuizIntro onStart={mockStart} onSkip={mockSkip} />);

    expect(
      screen.getByText(/personalized tea recommendations/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Personalized Curation/i)).toBeInTheDocument();
    expect(screen.getByText(/Seasonal Recommendations/i)).toBeInTheDocument();
  });

  it("calls onStart when start button clicked", () => {
    render(<QuizIntro onStart={mockStart} onSkip={mockSkip} />);

    const startButton = screen.getByText("Start Quiz");
    fireEvent.click(startButton);

    expect(mockStart).toHaveBeenCalled();
  });

  it("calls onSkip when browse first button clicked", () => {
    render(<QuizIntro onStart={mockStart} onSkip={mockSkip} />);

    const skipButton = screen.getByText("Browse First");
    fireEvent.click(skipButton);

    expect(mockSkip).toHaveBeenCalled();
  });

  it("shows time estimate", () => {
    render(<QuizIntro onStart={mockStart} onSkip={mockSkip} />);

    expect(screen.getByText(/2-3 minutes/i)).toBeInTheDocument();
  });
});

describe("QuizQuestion", () => {
  const mockQuestion = {
    id: 1,
    question_text: "What tea strength do you prefer?",
    order: 1,
    is_required: true,
    choices: [
      { id: 1, choice_text: "Light and delicate", order: 1 },
      { id: 2, choice_text: "Medium and balanced", order: 2 },
      { id: 3, choice_text: "Strong and bold", order: 3 },
    ],
  };

  const mockSelect = vi.fn();

  it("renders question text", () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        currentAnswer={null}
        onSelect={mockSelect}
        questionNumber={1}
        totalQuestions={3}
        direction="next"
      />
    );

    expect(screen.getByText(mockQuestion.question_text)).toBeInTheDocument();
  });

  it("renders all choices", () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        currentAnswer={null}
        onSelect={mockSelect}
        questionNumber={1}
        totalQuestions={3}
        direction="next"
      />
    );

    mockQuestion.choices.forEach((choice) => {
      expect(screen.getByText(choice.choice_text)).toBeInTheDocument();
    });
  });

  it("calls onSelect when choice clicked", () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        currentAnswer={null}
        onSelect={mockSelect}
        questionNumber={1}
        totalQuestions={3}
        direction="next"
      />
    );

    const choice = screen.getByText("Light and delicate");
    fireEvent.click(choice);

    expect(mockSelect).toHaveBeenCalledWith(1);
  });

  it("shows selected state for current answer", () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        currentAnswer={2}
        onSelect={mockSelect}
        questionNumber={1}
        totalQuestions={3}
        direction="next"
      />
    );

    const selectedChoice = screen.getByText("Medium and balanced");
    expect(selectedChoice).toBeInTheDocument();
  });

  it("has proper aria attributes", () => {
    render(
      <QuizQuestion
        question={mockQuestion}
        currentAnswer={null}
        onSelect={mockSelect}
        questionNumber={1}
        totalQuestions={3}
        direction="next"
      />
    );

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Question 1")
    );
  });
});

describe("QuizProgress", () => {
  it("renders progress bar", () => {
    render(
      <QuizProgress
        currentStep={2}
        totalSteps={5}
        completedSteps={[1]}
      />
    );

    expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();
    expect(screen.getByText(/\d+% complete/)).toBeInTheDocument();
  });

  it("calculates progress percentage correctly", () => {
    render(
      <QuizProgress
        currentStep={3}
        totalSteps={5}
        completedSteps={[1, 2]}
      />
    );

    // 3/5 = 60%
    expect(screen.getByText("60% complete")).toBeInTheDocument();
  });

  it("marks completed steps", () => {
    render(
      <QuizProgress
        currentStep={3}
        totalSteps={5}
        completedSteps={[1, 2]}
      />
    );

    // Step 1 and 2 should be marked as done
    expect(screen.getAllByText("Done").length).toBeGreaterThan(0);
  });

  it("shows current step", () => {
    render(
      <QuizProgress
        currentStep={3}
        totalSteps={5}
        completedSteps={[1, 2]}
      />
    );

    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});

describe("QuizResults", () => {
  const mockPreferences = {
    green_tea: 85,
    oolong: 72,
    black_tea: 45,
  };

  const mockCategories = ["green_tea", "oolong", "black_tea"];
  const mockContinue = vi.fn();

  it("renders success message", () => {
    render(
      <QuizResults
        preferences={mockPreferences}
        topCategories={mockCategories}
        onContinue={mockContinue}
      />
    );

    expect(
      screen.getByText("Your Tea Profile is Ready!")
    ).toBeInTheDocument();
  });

  it("displays top categories with scores", () => {
    render(
      <QuizResults
        preferences={mockPreferences}
        topCategories={mockCategories}
        onContinue={mockContinue}
      />
    );

    expect(screen.getByText("Green Tea")).toBeInTheDocument();
    expect(screen.getByText("Oolong")).toBeInTheDocument();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it("marks top match", () => {
    render(
      <QuizResults
        preferences={mockPreferences}
        topCategories={mockCategories}
        onContinue={mockContinue}
      />
    );

    expect(screen.getByText("Top Match")).toBeInTheDocument();
  });

  it("calls onContinue when button clicked", () => {
    render(
      <QuizResults
        preferences={mockPreferences}
        topCategories={mockCategories}
        onContinue={mockContinue}
      />
    );

    const button = screen.getByText("Browse Recommendations");
    fireEvent.click(button);

    expect(mockContinue).toHaveBeenCalled();
  });
});

describe("QuizLayout", () => {
  it("renders header with logo", () => {
    render(
      <QuizLayout>
        <div>Test content</div>
      </QuizLayout>
    );

    expect(screen.getByText(/CHA YUAN/i)).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders back to home link", () => {
    render(
      <QuizLayout>
        <div>Test content</div>
      </QuizLayout>
    );

    expect(screen.getByText("Back to Home")).toBeInTheDocument();
  });
});
