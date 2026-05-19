# Coding Rules

## General Rules

- Keep code simple and maintainable.
- Do not over-engineer MVP.
- Work module-by-module.
- Avoid duplicate code.
- Avoid large files.
- Avoid business logic in UI or controllers.
- Always update docs when behavior changes.

## Backend Rules

- Use .NET 8.
- Use Onion Architecture.
- Use EF Core.
- Use PostgreSQL.
- Use async/await.
- Use DTOs.
- Use FluentValidation.
- Use Result pattern.
- Use CQRS where useful.
- Do not expose domain entities from API.
- Do not place request/response records inside controllers.
- Do not call repositories from controllers.
- Do not inject DbContext into controllers.
- Use dependency injection properly.
- Use soft delete where business data should not be permanently deleted.

## Backend Project Rules

### API Project

Allowed:

- Controllers
- Middleware
- Swagger
- Authentication config
- Dependency injection composition

Not allowed:

- Business logic
- Repository logic
- DbContext direct usage

### Application Project

Allowed:

- Services
- DTOs
- Validators
- Interfaces
- CQRS handlers
- Business workflows

### Domain Project

Allowed:

- Entities
- Enums
- Constants
- Value objects

Not allowed:

- EF Core dependency
- Infrastructure dependency

### Infrastructure Project

Allowed:

- DbContext
- Repository implementation
- External service implementation
- OCR implementation
- File storage implementation

Repository rules:

- Repositories must NOT call SaveChangesAsync.
- SaveChangesAsync is called only in Application services.
- DbContext registered as scoped — same instance shared across repos per request.
- Repositories depend on IAppDbContext, not AppDbContext.
- Application services depend on IAppDbContext, not AppDbContext.
- IAppDbContext defined in Application layer.
- AppDbContext in Infrastructure implements IAppDbContext.
- Never inject AppDbContext directly into Application layer classes.

## Naming Rules

Entities:

- Singular name
- Example: Product, Dealer, InventoryBatch

DTOs:

- Request DTO ends with Request
- Response DTO ends with Response

Examples:

- CreateProductRequest
- ProductResponse
- AddDraftSaleItemRequest

Services:

- Interface starts with I
- Implementation ends with Service

Examples:

- IProductService
- ProductService

Repositories:

- Interface starts with I
- Implementation ends with Repository

Examples:

- IProductRepository
- ProductRepository

Controllers:

- End with Controller
- Example: ProductsController

## Frontend Rules

- Use Next.js App Router.
- Use TypeScript only.
- Use Tailwind CSS.
- Use shadcn/ui.
- Use TanStack Query for server state.
- Use Zustand for global client state.
- Use React Hook Form with Zod for forms.
- Keep API calls in service files.
- Keep UI components reusable.
- Avoid prop drilling.
- Avoid any type unless unavoidable.
- Keep feature code inside modules.

## Frontend Folder Rules

web/
- app/
- components/
- modules/
- services/
- hooks/
- store/
- lib/
- types/

Feature modules:

modules/products/
- components/
- hooks/
- services/
- schemas/
- types/

## Security Rules

- Use JWT auth.
- Owner-only endpoints must check role.
- Profit and actual purchase price must never be returned to staff users.
- Staff users should receive purchase price code only.
- Validate all input.
- Do not trust frontend role checks.

## Business Rules in Code

- InventoryBatch stores purchase price.
- Product does not store purchase price.
- Reserved stock must be tracked.
- Sale completion must be transactional.
- Draft cancellation must release reserved stock.
- Return must update stock/damaged stock correctly.
- Profit must be calculated from purchase price snapshot and selling price.

## Testing Rules

Use real PostgreSQL for all tests. No in-memory database.

Use Testcontainers (Testcontainers.PostgreSql NuGet) to spin up isolated PostgreSQL container per test run.

Each test class or collection gets a fresh migrated database.

Unit test pure domain logic (price code, calculations) without DB.
Integration tests hit real PostgreSQL via Testcontainers.

Test these modules:

- Purchase price code generation
- Stock reservation
- Sale completion
- Draft cancellation
- Profit calculation
- Partial payment
- Return flow
