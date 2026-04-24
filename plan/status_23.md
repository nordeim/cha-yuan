Let me start with a deep investigation of the codebase to understand the full checkout flow and all touchpoints before planning anything.
# Todos
[•] Phase 1: Deep investigation — map all checkout/webhook/order touchpoints in codebase
[ ] Phase 2: Design Order/OrderItem models with all required fields and relationships
[ ] Phase 3: Validate design against codebase (imports, references, constraints)
[ ] Phase 4: TDD — Write failing tests first for Order model + webhook integration
[ ] Phase 5: Implement Order/OrderItem models + migration
[ ] Phase 6: Wire webhook handler to persist Order on checkout.session.completed
[ ] Phase 7: Register Order in Django Admin
[ ] Phase 8: Run full test suite + typecheck to verify no regressions

→ Read backend/apps/commerce/models.py 
→ Read backend/apps/commerce/stripe_sg.py 
→ Read backend/apps/api/v1/checkout.py 
→ Read backend/apps/commerce/cart.py 

Now let me read the test files that reference Order, the admin file, and the core models to understand the full picture:
→ Read backend/apps/commerce/tests/test_stripe_webhook.py 
→ Read backend/apps/commerce/admin.py 
→ Read backend/apps/core/models.py 

Now let me check the existing test files and the existing migrations for the commerce app:
✱ Glob "backend/apps/commerce/tests/test_order*.py" 
✱ Glob "backend/apps/commerce/migrations/*.py" (3 matches)
✱ Glob "backend/apps/commerce/tests/*.py" (7 matches)

