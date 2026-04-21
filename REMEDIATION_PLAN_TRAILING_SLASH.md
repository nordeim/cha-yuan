# CHA YUAN Trailing Slash Remediation Plan

**Issue: "Add to Cart" 500 Error Due to Missing Trailing Slash**

| Attribute | Value |
|-----------|-------|
| **Status** | Root Cause Identified |
| **Created** | 2026-04-21 |
| **Priority** | P0 - Critical |
| **Approach** | Test-Driven Development (TDD) |

---

## Executive Summary

The "Add to Cart" button fails with a 500 error because the BFF proxy strips trailing slashes from URLs. Django Ninja requires trailing slashes for all endpoints, and POST requests without trailing slashes trigger a RuntimeError in Django's CommonMiddleware.

### Error Chain

```
User clicks "Add to Cart"
    ↓
Frontend calls POST /api/v1/cart/add/ (WITH trailing slash)
    ↓
clientFetch transforms to /api/proxy/cart/add/ (WITH trailing slash)
    ↓
Next.js route handler receives path=["cart", "add"] (trailing slash STRIPPED)
    ↓
BFF proxy joins path: "cart/add" (NO trailing slash)
    ↓
Backend receives POST /api/v1/cart/add (NO trailing slash)
    ↓
Django CommonMiddleware raises RuntimeError (can't redirect POST with data)
    ↓
500 Internal Server Error
```

---

## Root Cause Analysis

### Location

**File:** `frontend/app/api/proxy/[...path]/route.ts`

**Lines:** 38-39

```typescript
const pathString = path.join("/");
const targetUrl = new URL(`/api/v1/${pathString}`, BACKEND_URL);
```

### The Problem

When a request is made to `/api/proxy/cart/add/`:

1. Next.js App Router receives: `params: { path: ["cart", "add"] }`
2. The trailing slash is **stripped by Next.js routing**
3. `path.join("/")` produces: `"cart/add"`
4. Target URL becomes: `http://localhost:8000/api/v1/cart/add`
5. Django Ninja expects: `http://localhost:8000/api/v1/cart/add/`

### Why This Breaks POST Requests

Django's `CommonMiddleware` has `APPEND_SLASH=True` by default. When a POST request comes to a URL without a trailing slash:

```python
# Django tries to redirect
return HttpResponsePermanentRedirect(self.get_full_path_with_slash(request))

# But POST data is lost in redirect, so it raises:
raise RuntimeError(
    "You called this URL via POST, but the URL doesn't end in a slash..."
)
```

### Evidence from Logs

```
# Frontend log: POST with trailing slash
POST /api/proxy/cart/add/

# Backend log: POST without trailing slash (WRONG)
POST /api/v1/cart/add HTTP/1.1" 500

# Expected:
POST /api/v1/cart/add/ HTTP/1.1" 200
```

---

## Remediation Strategy

### Solution

Ensure the BFF proxy always appends a trailing slash to the target URL for Django Ninja compatibility.

**Option A: Always append trailing slash (RECOMMENDED)**

```typescript
const pathString = path.join("/");
const targetUrl = new URL(`/api/v1/${pathString}/`, BACKEND_URL);
//                                                ↑ Always append
```

**Option B: Preserve from original request**

```typescript
const pathString = path.join("/");
const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");
const targetPath = hasTrailingSlash ? `${pathString}/` : pathString;
const targetUrl = new URL(`/api/v1/${targetPath}`, BACKEND_URL);
```

**Recommendation:** Option A - Django Ninja requires trailing slashes for all endpoints. It's simpler and more reliable to always append them.

---

## TDD Test Specifications

### Test 1: BFF Proxy Appends Trailing Slash

**File:** `frontend/app/api/proxy/__tests__/route.test.ts`

```typescript
/**
 * Test that BFF proxy always appends trailing slash to backend URLs.
 */
import { NextRequest } from "next/server";
import { ALL } from "../[...path]/route";

describe("BFF Proxy Trailing Slash", () => {
  it("should append trailing slash to cart/add endpoint", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/proxy/cart/add/",
      { method: "POST", body: JSON.stringify({ product_id: 1, quantity: 1 }) }
    );
    
    const context = { params: Promise.resolve({ path: ["cart", "add"] }) };
    
    // Mock fetch to capture the target URL
    const mockFetch = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], item_count: 0 }))
    );
    
    await ALL(request, context);
    
    // Verify the URL passed to fetch has trailing slash
    const callArgs = mockFetch.mock.calls[0];
    const targetUrl = callArgs[0];
    
    expect(targetUrl).toMatch(/\/api\/v1\/cart\/add\/$/);
    
    mockFetch.mockRestore();
  });
  
  it("should append trailing slash to products endpoint", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/proxy/products/",
      { method: "GET" }
    );
    
    const context = { params: Promise.resolve({ path: ["products"] }) };
    
    const mockFetch = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [] }))
    );
    
    await ALL(request, context);
    
    const targetUrl = mockFetch.mock.calls[0][0];
    expect(targetUrl).toMatch(/\/api\/v1\/products\/$/);
    
    mockFetch.mockRestore();
  });
});
```

---

## Implementation Plan

### Step 1: Create Failing Test

Create test that verifies trailing slash is appended.

### Step 2: Fix BFF Proxy

Modify `frontend/app/api/proxy/[...path]/route.ts`:

```typescript
// Line 38-39 - BEFORE:
const pathString = path.join("/");
const targetUrl = new URL(`/api/v1/${pathString}`, BACKEND_URL);

// Line 38-39 - AFTER:
const pathString = path.join("/");
// Django Ninja requires trailing slashes for all endpoints
const targetUrl = new URL(`/api/v1/${pathString}/`, BACKEND_URL);
```

### Step 3: Verify Fix

1. Run tests to confirm they pass
2. Manual test: Click "Add to Cart" button
3. Verify no more 500 errors
4. Verify cart items persist

---

## Validation Checklist

### Before Fix

- [ ] GET /api/v1/products/ works (trailing slash optional for GET)
- [ ] POST /api/v1/cart/add FAILS (500 error)
- [ ] Backend log shows URL without trailing slash

### After Fix

- [ ] POST /api/v1/cart/add/ succeeds (200 OK)
- [ ] Backend log shows URL with trailing slash
- [ ] Cart items are added successfully
- [ ] Cart persists across page refreshes
- [ ] All cart operations work (add, update, remove, clear)

---

## Impact Assessment

### Affected Endpoints

All endpoints accessed through the BFF proxy will now have trailing slashes:

| Endpoint | Before | After |
|----------|--------|-------|
| /api/v1/cart/add | /api/v1/cart/add | /api/v1/cart/add/ ✅ |
| /api/v1/cart/update | /api/v1/cart/update | /api/v1/cart/update/ ✅ |
| /api/v1/cart/remove/1 | /api/v1/cart/remove/1 | /api/v1/cart/remove/1/ ✅ |
| /api/v1/cart/clear | /api/v1/cart/clear | /api/v1/cart/clear/ ✅ |
| /api/v1/products | /api/v1/products | /api/v1/products/ ✅ |
| /api/v1/products/slug | /api/v1/products/slug | /api/v1/products/slug/ ✅ |

### Risk Assessment

**Risk Level:** LOW

- Django Ninja already requires trailing slashes
- All existing backend endpoints expect trailing slashes
- This fix aligns the BFF proxy with Django's expectations
- GET requests work with or without trailing slashes (Django redirects)
- POST/PUT/DELETE require trailing slashes (Django fails without them)

---

## Commands

```bash
# Test the fix manually
curl -X POST http://localhost:3000/api/proxy/cart/add/ \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -v 2>&1 | grep "HTTP/1.1"

# Should return: HTTP/1.1 200 OK
# Not: HTTP/1.1 500 Internal Server Error

# Check backend log
tail -f /tmp/django.log | grep "POST /api/v1/cart"

# Should show: POST /api/v1/cart/add/ 200
# Not: POST /api/v1/cart/add 500
```

---

## Summary

The root cause is that the BFF proxy strips trailing slashes when constructing the backend URL. Django Ninja requires trailing slashes for all endpoints. The fix is to always append a trailing slash in the BFF proxy.

**Estimated Fix Time:** 15 minutes

**Current Status:** Ready to implement
