**Core Architecture & Identity**
CHA YUAN is a premium tea e-commerce platform built for the Singapore market, featuring a sophisticated 60/30/10 curation algorithm (60% preferences, 30% seasonality, 10% inventory). The system follows a BFF (Backend for Frontend)
pattern to secure authentication via HttpOnly cookies, ensuring that JWT tokens are never exposed to client-side storage.

**Tech Stack & Configuration**
 - Frontend: Next.js 16.2.3+ (App Router), React 19.2.5+ (Concurrent Mode), Tailwind CSS v4.2.2 (CSS-first configuration), and Framer Motion 12.38.0+ for animations.
 - Backend: Django 6.0.4+, Django Ninja 1.6.2+ (Pydantic v2), PostgreSQL 17, and Redis 7.4 (used for sessions and a 30-day persistent cart).
 - API Pattern: Implements a Centralized API Registry (backend/api_registry.py) for eager router registration at import time, preventing circular dependencies.
 - Singapore Compliance: Hardcoded SGD currency, 9% GST calculation (IRAS-compliant rounding), SGT timezone, PDPA consent tracking, and specific address/phone validation (+65 XXXX XXXX).

**Codebase Organization & Key Modules**
 - frontend/app/api/proxy/: The critical BFF proxy that forwards client requests to the Django API, injecting JWTs and handling token refresh.
 - backend/apps/commerce/: Contains the core business logic, including the Redis-backed cart service and the curation engine.
 - backend/apps/core/: Manages the custom User model with Singapore-specific validators and authentication.py for secure session handling.
 - frontend/lib/auth-fetch.ts: A unified fetch wrapper that intelligently routes requests directly to the backend (server-side) or through the BFF proxy (client-side).

**Documentation & Project Status**
The README.md and GEMINI.md files provide an accurate representation of the project structure and implementation status. The project is currently in Phase 8 (Testing & Deployment), with core features functional and production-ready,
though backend test coverage (currently ~30%) is a noted area for improvement. All key configuration files (package.json, tsconfig.json, requirements/base.txt, settings/base.py) are properly configured to support the current stack.
