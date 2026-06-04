# Step-by-Step Build Flow with Claude AI

Use this file to build the project with low token usage.

## Golden Rule

Never ask Claude to build the full app in one prompt.

Always say:

Read docs/CLAUDE.md first.
Implement only Phase X / Task Y.

## Step 1: Create Repository

Folder structure:

auto-parts-pos/
- backend/
- web/
- docs/
- README.md

Place all documentation files inside docs/.

## Step 2: Start Claude Session

Use this prompt:

Read docs/CLAUDE.md first.

Verify that you understand the project direction:
- Web-first
- .NET 8 backend
- React (Vite) frontend — JavaScript/JSX, Redux Toolkit, Formik
- PostgreSQL
- Onion Architecture
- SaaS-ready
- Future mobile later

Do not write code yet.
Give me a short implementation plan.

## Step 3: Backend Foundation

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 1: Backend Foundation only from docs/tasks.md.

Requirements:
- Create .NET 8 backend solution
- Create API, Application, Domain, Infrastructure projects
- Add project references
- Setup base folders
- Add Result pattern
- Add BaseEntity and AuditableEntity
- Setup global exception handling
- Setup Swagger
- Setup dependency injection structure

Do not implement business modules yet.

Before finishing:
1. Build the solution
2. Fix errors
3. Update docs/tasks.md
4. Give changed files summary

## Step 4: Web Foundation

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 2: Web Foundation only from docs/tasks.md.

Requirements:
- Create React app with Vite (JavaScript/JSX, no TypeScript)
- Setup Tailwind CSS
- Setup React Router v6
- Setup Redux Toolkit store and base slices
- Setup axiosInstance with ApiResponse interceptor
- Setup dashboard layout with sidebar and top bar
- Add placeholder pages for all modules
- Setup Formik + Yup

Do not implement business features yet.

Before finishing:
1. Run build/lint
2. Fix errors
3. Update docs/tasks.md
4. Give changed files summary

## Step 5: Auth and Shop

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 3: Auth and Shop only.

Requirements:
- Shop entity
- User entity
- Role entity
- EF Core configuration
- Migration
- Seed default roles
- Register shop owner API
- Login API
- JWT authentication
- Current user API
- Web login page
- Protected routes

Rules:
- Controllers must not call repositories directly
- Use DTOs
- Use FluentValidation
- Use Result pattern
- Update docs/api-contract.md if API changes

Before finishing:
1. Build backend
2. Build web
3. Fix errors
4. Update docs/tasks.md
5. Give changed files summary

## Step 6: Master Data

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 4: Master Data only.

Modules:
- Dealers
- Categories
- Brands
- Bike companies
- Bike models
- Colors
- Graphics

Requirements:
- CRUD APIs
- DTOs
- Validators
- Services
- Web UI screens
- Search/filter where useful

Do not implement product or inventory yet.

## Step 7: Product and Inventory

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 5: Product and Inventory only.

Requirements:
- Product entity
- ProductImage entity
- InventoryBatch entity
- Product CRUD
- Product search
- Dealer-wise stock batch
- Purchase price code generation
- Low-stock logic
- Product UI
- Inventory UI

Important:
- Product must not store purchase price directly
- Purchase price belongs to InventoryBatch
- Staff must see purchase price code only
- Owner can see actual purchase price

## Step 8: POS Billing

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 6: POS Billing only.

Requirements:
- DraftSale
- DraftSaleItem
- StockReservation
- Multiple active bills
- Add item to draft
- Reserve stock when item is added
- Remove item and release stock
- Hold draft
- Cancel draft
- Complete sale
- Sale and SaleItem
- Payment
- Partial payment
- POS web UI

Important:
- Sale completion must be transactional
- Available stock = Current stock - Reserved stock
- Profit owner-only

## Step 9: Purchase Bill Upload

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 7: Purchase Bill Upload only.

Requirements:
- Multipart form upload API (PDF or image)
- Gemini AI extraction (set Gemini:ApiKey in appsettings.Development.json)
- Structured item response (name, qty, mrp, purchasePrice)
- Purchase bill review screen (inline, same page)
- Product matching flow
- Confirm bill and create inventory batches
- Show empty state with guidance when no items extracted

Important:
- Never auto-map doubtful products
- Always show review screen
- User confirms map or create new product
- Gemini:ApiKey must NOT be committed to git (use appsettings.Development.json)

## Step 10: Returns and Payments

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 8: Returns and Payments only.

Requirements:
- Customer return
- Good return adds back to stock
- Damaged return adds damaged stock
- Dealer payment tracking
- Customer credit tracking
- UI screens

## Step 11: Reports

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 9: Reports only.

Reports:
- Day-wise revenue
- Day-wise profit
- Product-wise profit
- Dealer-wise purchase
- Pending customer payments
- Pending dealer payments
- Low-stock report

Important:
- Profit reports owner-only

## Step 12: PWA and Offline

Prompt:

Read docs/CLAUDE.md first.

Implement Phase 10: PWA and Offline planning/prototype only.

Requirements:
- PWA support
- Offline indicator
- IndexedDB/local cache structure
- Sync queue structure
- Offline draft sale prototype for one primary device

Do not over-engineer multi-device conflict handling.

## Low Token Usage Tips

- Do not paste full requirements again.
- Use docs/CLAUDE.md as the entry point.
- Work one task at a time.
- Ask Claude to update docs after each feature.
- Ask for changed file summary only, not full code dump.
- Ask Claude to build and fix errors before finishing.
