# CLAUDE.md

## Project Identity

Project Name: Auto Parts Inventory & POS Management System

This is a web-first SaaS-ready application for bike spare parts shops. The system manages purchase bills, inventory, dealer-wise stock batches, POS billing, stock reservation, partial payments, returns, dealer payments, low-stock reorder, reports, OCR bill upload, and future mobile support.

## Must Read Before Coding

Before writing or modifying code, always read these files:

- docs/requirements.md
- docs/architecture.md
- docs/database.md
- docs/api-contract.md
- docs/coding-rules.md
- docs/design.md
- docs/tasks.md
- docs/skill.md
- docs/roadmap.md
- docs/build-flow.md

## Current Build Direction

Build web app first, then mobile app later.

Current priority:

1. Backend foundation
2. Web frontend foundation
3. Auth and shop setup
4. Master data
5. Product and inventory batch
6. POS billing
7. OCR purchase bill upload
8. Reports
9. PWA/offline support
10. Future mobile app

## Tech Stack

### Backend

- .NET 8 Web API
- Onion Architecture
- EF Core
- PostgreSQL
- JWT Authentication
- FluentValidation
- Result pattern
- CQRS pattern where useful

### Web Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

### Future Mobile

- Flutter or React Native can be planned after stable web MVP.

## Mandatory Rules

- Work on one phase or one module at a time.
- Do not build the full system in one prompt.
- Do not rewrite architecture unless explicitly asked.
- Controllers must not call repositories directly.
- Controllers must call Application services or CQRS handlers only.
- Do not place request/response records inside controllers.
- Do not expose domain entities directly from API responses.
- Use DTOs for all API requests and responses.
- Use Result pattern for service responses.
- Use FluentValidation for input validation.
- Keep business logic inside Application layer.
- Keep repository interfaces and application contracts inside Application layer.
- Keep EF Core and external integrations inside Infrastructure layer.
- Keep HTTP-specific adapters such as current-user claims access inside API layer.
- Domain layer must not depend on Infrastructure or API.
- Update docs/tasks.md after each completed task.
- Update docs/api-contract.md when APIs change.
- Update docs/database.md when entities/tables change.
- Build and fix errors before completing a task.
- Provide changed file summary after each task.

## Important Business Rules

- Same product can be purchased from multiple dealers.
- Same product can have multiple purchase prices.
- Inventory must be stored dealer-wise using InventoryBatch.
- Seller manually selects which dealer batch to sell.
- Product added to draft bill immediately reserves stock.
- Available stock = Total stock - Reserved stock.
- Final sale converts reserved stock into sold stock.
- Owner can see actual purchase price and profit.
- Staff can see MRP and purchase price code only.
- Purchase price coding uses ABCDEFGHIO mapping.
- OCR/PDF upload must always have a manual review step.
- If product matching is doubtful, ask user to map or create new product.
- Low-stock reorder is dealer-wise.
- Customer return can go back to stock if good, or damaged/replacement stock if damaged.
- Partial payment and udhar are supported.
- Dealer payment tracking is supported.
- Offline billing is for one primary device per shop in MVP.
