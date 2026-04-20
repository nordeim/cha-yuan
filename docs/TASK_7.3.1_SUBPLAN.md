# Task 7.3.1: Quiz Frontend API Integration

> **Task ID:** 7.3.1  
> **Duration:** 0.5 day  
> **Status:** READY FOR EXECUTION  
> **TDD Principle:** Test API layer → Implement functions → Verify integration

---

## Executive Summary

Implements the frontend API integration layer for the quiz system. This task creates type-safe API functions that communicate with the Django backend through the BFF proxy pattern, enabling the quiz frontend to fetch questions, submit answers, and retrieve user preferences.

### Key Features
1. **Type-Safe API Functions** - TypeScript interfaces for quiz data
2. **BFF Proxy Integration** - Uses existing authFetch utility
3. **Error Handling** - Proper error messages for each endpoint
4. **React Query Hooks** - For state management and caching

---

## Implementation Plan

### Step 1: Define TypeScript Interfaces (Type Definitions) ⏳

**File:** `/frontend/lib/types/quiz.ts`

**Interfaces:**
```typescript
export interface QuizChoice {
  id: number;
  choice_text: string;
  order: number;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  order: number;
  is_required: boolean;
  choices: QuizChoice[];
}

export interface QuizAnswers {
  [questionId: number]: number; // question_id: choice_id
}

export interface QuizResult {
  preferences: Record<string, number>; // category_slug: score
  top_categories: string[];
}

export interface UserPreference {
  preferences: Record<string, number>;
  quiz_completed_at: string | null;
  top_categories: string[];
}
```

### Step 2: Create API Functions (Core Implementation) ⏳

**File:** `/frontend/lib/api/quiz.ts`

**Functions:**

#### `getQuizQuestions()`
- **Endpoint:** `GET /api/v1/quiz/questions/`
- **Auth:** Not required (public endpoint)
- **Returns:** `Promise<QuizQuestion[]>`
- **Error:** Throws if fetch fails

#### `submitQuiz(answers: QuizAnswers)`
- **Endpoint:** `POST /api/v1/quiz/submit/`
- **Auth:** Required (JWT via HttpOnly cookie)
- **Body:** `{ answers: Record<number, number> }`
- **Returns:** `Promise<QuizResult>`
- **Error:** Throws if validation fails or already completed

#### `getUserPreferences()`
- **Endpoint:** `GET /api/v1/quiz/preferences/`
- **Auth:** Required (JWT via HttpOnly cookie)
- **Returns:** `Promise<UserPreference>`
- **Error:** Throws if not authenticated

#### `hasCompletedQuiz()`
- **Endpoint:** `GET /api/v1/quiz/preferences/`
- **Auth:** Required
- **Returns:** `Promise<boolean>`
- **Logic:** Returns true if `quiz_completed_at` is not null

### Step 3: Create React Query Hooks (State Management) ⏳

**File:** `/frontend/lib/hooks/use-quiz.ts`

**Hooks:**

#### `useQuizQuestions()`
```typescript
export function useQuizQuestions() {
  return useQuery({
    queryKey: ['quiz', 'questions'],
    queryFn: getQuizQuestions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

#### `useSubmitQuiz()`
```typescript
export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitQuiz,
    onSuccess: () => {
      // Invalidate preferences cache
      queryClient.invalidateQueries({ queryKey: ['quiz', 'preferences'] });
    },
  });
}
```

#### `useUserPreferences()`
```typescript
export function useUserPreferences() {
  return useQuery({
    queryKey: ['quiz', 'preferences'],
    queryFn: getUserPreferences,
  });
}
```

#### `useQuizCompletionStatus()`
```typescript
export function useQuizCompletionStatus() {
  const { data, isLoading } = useUserPreferences();
  return {
    hasCompleted: data?.quiz_completed_at != null,
    isLoading,
  };
}
```

### Step 4: Test the API Integration ⏳

**Test File:** `/frontend/lib/api/__tests__/quiz.test.ts`

**Test Cases:**
- [ ] `getQuizQuestions fetches and returns questions`
- [ ] `submitQuiz sends correct payload`
- [ ] `getUserPreferences returns user data`
- [ ] `handles network errors gracefully`
- [ ] `handles 401 unauthorized`
- [ ] `handles 409 already completed`

---

## TODO List

```
[ ] Step 1: Create TypeScript interfaces
[ ] Step 1.1: QuizChoice interface
[ ] Step 1.2: QuizQuestion interface
[ ] Step 1.3: QuizAnswers type
[ ] Step 1.4: QuizResult interface
[ ] Step 1.5: UserPreference interface

[ ] Step 2: Create API functions
[ ] Step 2.1: getQuizQuestions function
[ ] Step 2.2: submitQuiz function
[ ] Step 2.3: getUserPreferences function
[ ] Step 2.4: hasCompletedQuiz helper

[ ] Step 3: Create React Query hooks
[ ] Step 3.1: useQuizQuestions hook
[ ] Step 3.2: useSubmitQuiz hook
[ ] Step 3.3: useUserPreferences hook
[ ] Step 3.4: useQuizCompletionStatus hook

[ ] Step 4: Verify integration
[ ] Step 4.1: Test with backend API
[ ] Step 4.2: Verify type safety
[ ] Step 4.3: Test error handling
[ ] Step 4.4: Run TypeScript check

[ ] Step 5: Documentation
[ ] Step 5.1: Add JSDoc comments
[ ] Step 5.2: Update exports
[ ] Step 5.3: Usage examples

TASK 7.3.1 COMPLETE ✅
```

---

## Dependencies

### Existing Infrastructure
- ✅ `authFetch` utility (from Phase 2)
- ✅ TanStack Query (React Query)
- ✅ Backend API endpoints (from 7.1.3)

### Required Imports
```typescript
import { authFetch } from '@/lib/auth-fetch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

---

## API Endpoint Mapping

| Frontend Function | Method | Endpoint | Auth |
|-------------------|--------|----------|------|
| `getQuizQuestions()` | GET | `/api/v1/quiz/questions/` | No |
| `submitQuiz()` | POST | `/api/v1/quiz/submit/` | Yes |
| `getUserPreferences()` | GET | `/api/v1/quiz/preferences/` | Yes |

---

## Error Handling Strategy

| Error Type | HTTP Status | Frontend Behavior |
|------------|-------------|-------------------|
| Network Error | - | `throw new Error('Network error')` |
| Invalid Answers | 400 | Show validation message |
| Already Completed | 409 | Redirect to results |
| Unauthorized | 401 | Redirect to login |
| Server Error | 500 | Show error toast |

---

## Usage Example

```typescript
// In a React component
function QuizPage() {
  const { data: questions, isLoading } = useQuizQuestions();
  const { hasCompleted } = useQuizCompletionStatus();
  const submitQuiz = useSubmitQuiz();

  if (hasCompleted) {
    return <Redirect to="/quiz/results" />;
  }

  const handleSubmit = async (answers: QuizAnswers) => {
    try {
      const result = await submitQuiz.mutateAsync(answers);
      console.log('Top categories:', result.top_categories);
    } catch (error) {
      console.error('Quiz submission failed:', error);
    }
  };
}
```

---

## Validation Criteria

- [ ] All TypeScript interfaces defined
- [ ] All API functions implemented
- [ ] All React Query hooks created
- [ ] Error handling in place
- [ ] TypeScript strict mode passes
- [ ] Integration with backend verified

---

## Next Steps After Completion

- Task 7.3.2: Quiz Page Multi-step Interface
- Task 7.4.1: Subscription Dashboard Page

---

**Ready for Execution:**

> Reply "EXECUTE TASK 7.3.1" to begin implementation.

This plan has been validated against:
- ✅ PHASE_7_SUBPLAN.md requirements
- ✅ MASTER_EXECUTION_PLAN.md architecture
- ✅ Existing codebase patterns
