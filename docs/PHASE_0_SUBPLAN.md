# Phase 0 Sub-Plan: Foundation & Environment Setup

> **Phase:** 0  
> **Duration:** Days 1-3  
> **TDD Principle:** Write test infrastructure before implementation  
> **Status:** IN PROGRESS

---

## Deep Analysis: The Foundation Philosophy

Before writing any business logic, we must establish a **rock-solid foundation** that enables:

1. **Reproducibility** - Identical environments across dev/staging/prod
2. **Observability** - Health checks and monitoring from day one
3. **Testability** - TDD infrastructure ready before feature code
4. **Type Safety** - Strict TypeScript and Python typing from the start
5. **Self-Healing** - Services verify their own health

---

## Task Breakdown

### Task 0.1: Monorepo Directory Structure

**Rationale:** Clear separation of concerns enables parallel development and independent scaling.

**Files to Create:**

| File/Directory | Purpose | Dependencies |
|----------------|---------|--------------|
| `/cha-yuan/` | Monorepo root | Git |
| `/cha-yuan/backend/` | Django 6 application | Python 3.12+ |
| `/cha-yuan/backend/apps/` | Modular Django apps | - |
| `/cha-yuan/backend/apps/core/` | User, Address, SG utilities | PostgreSQL 17 |
| `/cha-yuan/backend/apps/commerce/` | Products, Orders, Stripe | Redis 7.4 |
| `/cha-yuan/backend/apps/content/` | Articles, Quiz, Subscriptions | - |
| `/cha-yuan/backend/apps/api/` | Django Ninja API layer | All apps |
| `/cha-yuan/backend/tests/` | Shared test utilities | pytest |
| `/cha-yuan/backend/requirements/` | Split requirements | - |
| `/cha-yuan/frontend/` | Next.js 16 application | Node.js 20+ |
| `/cha-yuan/frontend/app/` | App Router | - |
| `/cha-yuan/frontend/components/ui/` | Shadcn UI components | Radix UI |
| `/cha-yuan/frontend/lib/` | Utilities, hooks | - |
| `/cha-yuan/frontend/types/` | TypeScript types | - |
| `/cha-yuan/frontend/tests/` | Unit and E2E tests | Vitest, Playwright |
| `/cha-yuan/infra/docker/` | Docker configurations | Docker |
| `/cha-yuan/infra/deploy/` | Production configs | - |
| `/cha-yuan/shared/types/` | Shared TypeScript types | - |
| `/cha-yuan/docs/adr/` | Architecture decisions | - |

**Checklist:**
- [ ] All directories created
- [ ] .gitignore configured (Python, Node, .env)
- [ ] README.md created

---

### Task 0.2: Docker Compose Configuration

**Rationale:** Docker ensures identical environments and eliminates "works on my machine" problems.

**Files to Create:**

| File | Purpose | Size Estimate |
|------|---------|---------------|
| `/infra/docker/docker-compose.yml` | Main orchestration | ~150 lines |
| `/infra/docker/Dockerfile.backend.dev` | Backend dev image | ~50 lines |
| `/infra/docker/Dockerfile.frontend.dev` | Frontend dev image | ~40 lines |
| `/infra/docker/Dockerfile.backend.prod` | Backend production | ~60 lines |
| `/infra/docker/.env.example` | Environment template | ~30 lines |

**Services:**

| Service | Image | Ports | Health Check |
|---------|-------|-------|--------------|
| postgres | postgres:17-trixie | 5432 | pg_isready |
| redis | redis:7.4-alpine | 6379 | redis-cli ping |
| backend | (build) | 8000 | HTTP /api/v1/health/ |
| frontend | (build) | 3000 | HTTP /api/health |

**Docker Configuration Details:**

**PostgreSQL 17 Configuration:**
```yaml
environment:
  POSTGRES_DB: chayuan
  POSTGRES_USER: chayuan
  POSTGRES_PASSWORD: ${DB_PASSWORD}
  TZ: Asia/Singapore
  PGDATA: /var/lib/postgresql/data/pgdata
command: >
  postgres
  -c lc_collate=en_SG.utf8
  -c lc_ctype=en_SG.utf8
  -c timezone=Asia/Singapore
```

**Redis 7.4 Configuration:**
```yaml
command: >
  redis-server
  --maxmemory 256mb
  --maxmemory-policy allkeys-lru
  --appendonly yes
  --save 60 1000
```

**Checklist:**
- [ ] docker-compose.yml created with health checks
- [ ] Backend Dockerfile created (dev)
- [ ] Frontend Dockerfile created (dev)
- [ ] .env.example created
- [ ] Network configuration (172.20.0.0/16)
- [ ] Volume persistence configured

---

### Task 0.3: Backend Test Infrastructure

**Rationale:** TDD requires test infrastructure before any feature code.

**Files to Create:**

| File | Purpose | Lines |
|------|---------|-------|
| `/backend/requirements/base.txt` | Production deps | ~30 lines |
| `/backend/requirements/dev.txt` | Dev deps | ~25 lines |
| `/backend/requirements/prod.txt` | Production extras | ~10 lines |
| `/backend/pytest.ini` | pytest configuration | ~40 lines |
| `/backend/.coveragerc` | Coverage configuration | ~20 lines |
| `/backend/tests/__init__.py` | Test package | 0 lines |
| `/backend/tests/conftest.py` | Shared fixtures | ~50 lines |
| `/backend/tests/test_health.py` | First TDD test | ~20 lines |

**Dependencies (base.txt):**
- Django==6.0.*
- django-ninja==1.0.*
- psycopg2-binary==2.9.*
- redis==5.2.*
- stripe==12.0.*
- pydantic==2.10.*
- PyJWT==2.10.*

**Dependencies (dev.txt):**
- pytest==8.3.*
- pytest-django==4.9.*
- pytest-cov==6.0.*
- factory-boy==3.3.*
- black==25.1.*
- mypy==1.15.*

**First TDD Test:**
```python
# tests/test_health.py
import pytest


@pytest.mark.unit
class TestInfrastructure:
    """Tests for foundational infrastructure."""

    def test_postgresql_version(self, db):
        """Ensure PostgreSQL 17 is running."""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            result = cursor.fetchone()[0]
            assert "PostgreSQL 17" in result

    def test_redis_connection(self):
        """Ensure Redis 7.4 is accessible."""
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        assert r.ping() is True

    def test_singapore_timezone(self, db):
        """Ensure database uses Singapore timezone."""
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SHOW timezone;")
            result = cursor.fetchone()[0]
            assert result == "Asia/Singapore"
```

**Checklist:**
- [ ] Requirements files created
- [ ] pytest.ini configured
- [ ] Coverage target set to 85%
- [ ] conftest.py with fixtures
- [ ] First TDD test written (should FAIL)

---

### Task 0.4: Frontend Test Infrastructure

**Rationale:** Next.js 16 + React 19 requires specific test configuration.

**Files to Create:**

| File | Purpose | Lines |
|------|---------|-------|
| `/frontend/package.json` | Node dependencies | ~60 lines |
| `/frontend/vitest.config.ts` | Unit test config | ~30 lines |
| `/frontend/playwright.config.ts` | E2E test config | ~50 lines |
| `/frontend/tsconfig.json` | TypeScript config | ~35 lines |
| `/frontend/.eslintrc.json` | Linting config | ~20 lines |
| `/frontend/tests/unit/example.test.ts` | First unit test | ~15 lines |
| `/frontend/tests/e2e/health.spec.ts` | First E2E test | ~20 lines |

**package.json Key Dependencies:**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "zod": "^4.0.0",
    "framer-motion": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.9.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "playwright": "^1.50.0"
  }
}
```

**TypeScript Configuration (strict):**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["dom", "dom.iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "strictInference": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Checklist:**
- [ ] package.json created
- [ ] tsconfig.json with strict mode
- [ ] vitest.config.ts created
- [ ] playwright.config.ts created
- [ ] First unit test written (should FAIL)
- [ ] First E2E test written (should FAIL)

---

### Task 0.5: Documentation & Automation

**Rationale:** Clear documentation enables team scaling and knowledge transfer.

**Files to Create:**

| File | Purpose | Lines |
|------|---------|-------|
| `/docs/adr/0001-monorepo-structure.md` | Why monorepo | ~50 lines |
| `/docs/adr/0002-postgresql-17.md` | Why PG 17 | ~40 lines |
| `/docs/adr/0003-docker-first.md` | Why Docker | ~40 lines |
| `/docs/setup.md` | Developer onboarding | ~100 lines |
| `/docs/TESTING.md` | Testing standards | ~80 lines |
| `/Makefile` | Common commands | ~50 lines |
| `/.env.example` | Environment template | ~40 lines |

**Makefile Commands:**
```makefile
.PHONY: help setup test dev build prod

help:
	@echo "CHA YUAN Development Commands"
	@echo "  make setup    - Initialize development environment"
	@echo "  make dev      - Start all services in development mode"
	@echo "  make test     - Run all tests"
	@echo "  make test-be  - Run backend tests only"
	@echo "  make test-fe  - Run frontend tests only"
	@echo "  make build    - Build production images"
	@echo "  make prod     - Start production environment"
	@echo "  make clean    - Clean up containers and volumes"

setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	cd infra/docker && docker-compose pull
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements/dev.txt
	cd frontend && npm install

dev:
	cd infra/docker && docker-compose up -d

test:
	make test-be
	make test-fe

test-be:
	cd backend && pytest

test-fe:
	cd frontend && npm run test

test-e2e:
	cd frontend && npx playwright test

build:
	cd infra/docker && docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

prod:
	cd infra/docker && docker-compose -f docker-compose.prod.yml up -d

clean:
	cd infra/docker && docker-compose down -v
	cd infra/docker && docker-compose -f docker-compose.prod.yml down -v
```

**Checklist:**
- [ ] ADR documents created
- [ ] setup.md with step-by-step guide
- [ ] TESTING.md with TDD workflow
- [ ] Makefile with common commands
- [ ] .env.example with all variables

---

## Phase 0 Success Criteria

| Criteria | Verification Command | Expected Result |
|----------|---------------------|-----------------|
| Directory structure | `find cha-yuan -type d \| wc -l` | > 20 directories |
| Docker Compose valid | `docker-compose config` | No errors |
| PostgreSQL 17 starts | `docker-compose up postgres` | Healthy status |
| Redis 7.4 starts | `docker-compose up redis` | Healthy status |
| Backend requirements | `pip install -r requirements/dev.txt` | Success |
| Frontend dependencies | `npm install` | Success |
| pytest configured | `pytest --version` | Version 8.x |
| Vitest configured | `npx vitest --version` | Version 3.x |
| Playwright configured | `npx playwright --version` | Version 1.x |
| First tests written | `pytest tests/test_health.py` | Tests FAIL (TDD) |
| First tests written | `npm run test` | Tests FAIL (TDD) |
| Health checks | `curl localhost:5432` | Connection refused (expected) |
| Health checks | `docker-compose ps` | All healthy |

---

## Phase 0 Execution Order

1. **Create directory structure** (15 min)
2. **Create Docker files** (30 min)
3. **Create backend requirements** (15 min)
4. **Create backend test infrastructure** (20 min)
5. **Create frontend package.json** (15 min)
6. **Create frontend test infrastructure** (20 min)
7. **Create documentation** (30 min)
8. **Create Makefile** (10 min)
9. **Verify everything** (15 min)

**Total Estimated Time:** ~2.5 hours

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Docker volumes don't persist | Low | High | Named volumes configured |
| PostgreSQL 17 health check fails | Low | High | Proper pg_isready command |
| Redis 7.4 persistence fails | Low | High | appendonly yes configured |
| Node version incompatibility | Medium | Medium | Node 20 specified |
| Python version incompatibility | Medium | Medium | Python 3.12 specified |
| Port conflicts | Medium | Low | Custom subnet (172.20.0.0/16) |

---

## Next Steps

After Phase 0 completion:
1. Run `make setup` to initialize environment
2. Run `make dev` to start all services
3. Verify health checks pass
4. Proceed to **Phase 1: Backend Foundation & Models**

---

## TDD Commitment

Every file created in Phase 0 includes:
- Clear purpose and interface documentation
- Error handling patterns
- Test infrastructure for future TDD
- No business logic yet (Phase 1+)

**This is the foundation. Everything else builds on top of this.**
