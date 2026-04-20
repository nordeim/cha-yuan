# Phase 6.9 Remediation Plan: Markdown Rendering Tests

> **Task:** 6.9 - Markdown Rendering Tests  
> **Status:** PENDING (Last remaining Phase 6 item)  
> **Approach:** Test-Driven Development (TDD) - Red-Green-Refactor  
> **Estimated Duration:** 45 minutes  

---

## Executive Summary

This remediation plan closes the final gap in Phase 6 by creating comprehensive tests for the `ArticleContent` markdown rendering component. The component already exists and functions correctly; this plan adds test coverage to ensure all markdown elements render with proper styling.

### Alignment Verification

| Document | Reference | Alignment |
|----------|-----------|-----------|
| **Master Execution Plan** | Section 6.2 - "Article rendering with markdown" | ✅ Covered by ArticleContent component |
| **Phase 6 Subplan** | Section 6.9 - "Markdown Rendering Tests" | ✅ Direct match |
| **TODO List** | Item 6.9 | ✅ Direct match |

---

## Current State Analysis

### ✅ Existing Implementation (Green Phase Already Complete)

**File:** `/frontend/components/article-content.tsx`

**Implemented Features:**
- ✅ ReactMarkdown with remark-gfm plugin
- ✅ Custom h1, h2, h3 with `font-serif` typography
- ✅ Paragraphs with `text-bark-700 leading-relaxed`
- ✅ Links with `text-tea-600 hover:underline`
- ✅ Blockquotes with left border styling
- ✅ Unordered/ordered lists with proper markers
- ✅ Inline code with `bg-ivory-200` background
- ✅ Code blocks with overflow handling
- ✅ Tables with responsive wrapper
- ✅ Images with rounded corners
- ✅ Horizontal rules

### ❌ Missing: Test Coverage (RED Phase)

**Gap:** No test file exists for ArticleContent component.

---

## TDD Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  RED: Write ArticleContent tests that define expected behavior │
│     ↓                                                          │
│  RUN: Execute tests (expect FAIL - component exists but        │
│       no test file)                                            │
│     ↓                                                          │
│  GREEN: Tests pass (component already implemented)            │
│     ↓                                                          │
│  REFACTOR: Add edge case tests if needed                       │
│     ↓                                                          │
│  VERIFY: Full test suite passes                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Test Specifications

### Test File Location

**Path:** `/frontend/components/__tests__/article-content.test.tsx`

### Test Coverage Requirements

Per Phase 6 Subplan Section 6.9:

| Test Case | Priority | Verification |
|-----------|----------|--------------|
| `test_renders_headings_correctly` | HIGH | H1, H2, H3 with font-serif class |
| `test_renders_paragraphs` | HIGH | Text with proper spacing classes |
| `test_renders_links` | HIGH | Links with tea-600 color class |
| `test_renders_images` | HIGH | Images with lazy loading |
| `test_renders_lists` | HIGH | UL and OL styling |
| `test_renders_blockquotes` | MEDIUM | Styled blockquotes |
| `test_renders_code_blocks` | MEDIUM | Syntax highlighting structure |
| `test_renders_tables` | MEDIUM | Responsive tables |

---

## Implementation Plan

### Step 1: Write Test File (RED Phase)

**Duration:** 20 minutes

**Pattern:** Follow existing test structure from `article-card.test.tsx`

**Required Elements:**
1. Mock ReactMarkdown if necessary (check if needed)
2. Test data with comprehensive markdown content
3. Tests for all custom component renderers
4. CSS class verification for tea brand styling

### Step 2: Run Tests (Verify RED)

**Duration:** 5 minutes

**Command:**
```bash
cd /home/project/tea-culture/cha-yuan/frontend
npm run test -- article-content
```

**Expected:** Tests execute, component renders, assertions verify styling

### Step 3: Fix Any Issues (GREEN Phase)

**Duration:** 15 minutes (if needed)

**Potential Issues:**
- TypeScript type mismatches
- Missing test utilities
- Component prop interface issues

### Step 4: Verify Full Suite

**Duration:** 5 minutes

**Commands:**
```bash
npm run test
npm run typecheck
```

---

## Test Cases Detail

### Test Data Structure

```typescript
const markdownContent = `# Brewing Green Tea

## Introduction

Green tea is one of the most popular teas in the world.

### Benefits

- Rich in antioxidants
- Boosts metabolism
- Improves brain function

## Instructions

1. Heat water to 80°C
2. Add 2g of tea leaves
3. Steep for 2 minutes

> Pro tip: Don't use boiling water!

Visit [our guide](/guides) for more.

\`\`\`python
# Example code
brew_time = 180  # seconds
\`\`\`

| Temperature | Time |
|-------------|------|
| 80°C        | 2 min|

---

![Green tea](/images/green-tea.jpg)
`;
```

### Expected Rendered Output Verifications

| Element | Expected Classes | Expected Content |
|---------|------------------|------------------|
| H1 | `font-serif text-4xl text-bark-900 mb-6` | "Brewing Green Tea" |
| H2 | `font-serif text-2xl text-bark-900 mt-8 mb-4` | "Introduction" |
| H3 | `font-serif text-xl text-bark-900 mt-6 mb-3` | "Benefits" |
| P | `text-bark-700 leading-relaxed mb-4` | Text content |
| UL | `list-disc list-inside space-y-2 mb-4` | List items |
| OL | `list-decimal list-inside space-y-2 mb-4` | Ordered items |
| Blockquote | `border-l-4 border-tea-500 pl-4 italic` | Quote text |
| A | `text-tea-600 hover:underline` | Link text |
| Code (inline) | `bg-ivory-200 px-2 py-1 rounded text-sm font-mono` | Code text |
| Code (block) | `bg-ivory-200 p-4 rounded-lg overflow-x-auto` | Code block |
| Table | `min-w-full border-collapse` | Table structure |
| IMG | `rounded-lg my-6 w-full` | Image element |

---

## Integration Checklist

- [ ] Test file created at correct location
- [ ] All 8 test cases implemented
- [ ] Tests use consistent patterns (like article-card.test.tsx)
- [ ] Mock setup complete for any dependencies
- [ ] All tests pass
- [ ] TypeScript check passes
- [ ] No ESLint warnings

---

## Success Criteria

1. ✅ **Test File Exists:** `/frontend/components/__tests__/article-content.test.tsx`
2. ✅ **All Tests Pass:** 8/8 tests passing
3. ✅ **TDD Compliance:** Tests written first, component already exists
4. ✅ **Coverage:** All markdown element types tested
5. ✅ **Design Alignment:** Tea brand colors verified (bark-900, tea-600, ivory-200)
6. ✅ **Code Quality:** TypeScript strict mode, no warnings

---

## Verification Gates

| Gate | Command | Expected Result |
|------|---------|-----------------|
| **Tests Run** | `npm run test -- article-content` | 8 tests passing |
| **Type Check** | `npm run typecheck` | 0 errors |
| **Full Suite** | `npm run test` | All component tests pass |

---

## Dependencies

**Already Installed:**
- ✅ `react-markdown`
- ✅ `remark-gfm`
- ✅ `@testing-library/react`
- ✅ `vitest`

**No New Dependencies Required**

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| ReactMarkdown mocking complexity | Test actual rendered output, mock only if necessary |
| CSS class assertion fragility | Use partial class matching (`.toContain()`) |
| Async rendering issues | Use `findBy` queries if needed |

---

## Post-Completion

After Task 6.9 completion:

1. Update `phase-6-todo.txt`:
   ```diff
   - [ ] Phase 6.9: Markdown Rendering Tests
   + [✓] Phase 6.9: Markdown Rendering Tests
   ```

2. Phase 6 is **FULLY COMPLETE**

3. Ready to proceed to **Phase 7: Subscription & Preference Quiz**

---

## Approval

**Ready for Execution:**

> Reply "**EXECUTE 6.9**" to begin implementation following TDD methodology.

This plan has been validated against:
- ✅ Master Execution Plan Phase 6 requirements
- ✅ Phase 6 Subplan Section 6.9 specifications
- ✅ Existing codebase patterns and conventions
- ✅ ArticleContent component implementation
