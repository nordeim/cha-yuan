#!/bin/bash
# Initialize monorepo directory structure for CHA YUAN

set -e

echo "Creating monorepo directory structure..."

# Root directories
mkdir -p cha-yuan/{backend,frontend,infra,shared,docs}

# Backend structure
mkdir -p cha-yuan/backend/apps/{core,commerce,content,api}
mkdir -p cha-yuan/backend/{tests,requirements}

# Frontend structure
mkdir -p cha-yuan/frontend/app/{auth/login,products,cart,checkout,culture,quiz,dashboard}
mkdir -p cha-yuan/frontend/components/ui
mkdir -p cha-yuan/frontend/lib/{hooks,animations}
mkdir -p cha-yuan/frontend/types
mkdir -p cha-yuan/frontend/tests/{unit,e2e}

# Infrastructure
mkdir -p cha-yuan/infra/{docker,deploy,scripts}
mkdir -p cha-yuan/shared/types

# Documentation
mkdir -p cha-yuan/docs/{adr,api}

echo "✅ Directory structure created successfully"
echo ""
echo "Structure:"
find cha-yuan -type d | head -40
