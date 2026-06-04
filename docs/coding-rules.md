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
- Use EF Core only in Infrastructure.
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
- CORS
- Authentication config
- Dependency injection composition
- API response envelope formatting
- HTTP-specific adapters such as CurrentUserService

Not allowed:

- Business logic
- Repository logic
- DbContext direct usage
- Domain entity exposure as response payload

### Application Project

Allowed:

- Services
- DTOs
- Validators
- Repository/service contracts
- CQRS handlers
- Business workflows
- Result pattern
- IAppDbContext save abstraction

Not allowed:

- EF Core dependency
- EF Core DbSet<T> exposure
- EF Core query APIs such as Include, AnyAsync, ToListAsync
- ASP.NET HttpContext access
- Infrastructure or API project references
- External service implementation details

### Domain Project

Allowed:

- Entities
- Enums
- Constants
- Value objects
- Pure domain rules

Not allowed:

- EF Core dependency
- Application dependency
- Infrastructure dependency
- API dependency

### Infrastructure Project

Allowed:

- AppDbContext
- EF Core entity configurations
- EF Core migrations
- Repository implementations
- PostgreSQL configuration
- External service implementations
- OCR implementation
- File storage implementation

Not allowed:

- Controllers
- API response envelope formatting
- IHttpContextAccessor/current HTTP claims access
- Business workflow orchestration

## Repository Rules

- Repository interfaces live in Application.
- Repository implementations live in Infrastructure.
- Repositories must NOT call SaveChangesAsync.
- SaveChangesAsync is called only in Application services.
- DbContext is registered as scoped; same instance shared across repositories per request.
- Repository implementations depend on AppDbContext.
- Application services depend on repository interfaces and IAppDbContext, not AppDbContext.
- IAppDbContext is defined in Application.
- AppDbContext in Infrastructure implements IAppDbContext.
- IAppDbContext exposes only SaveChangesAsync.
- Never expose DbSet<T> from Application interfaces.
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

- Use React (Vite, JavaScript/JSX — no TypeScript).
- Use Tailwind CSS for all styling.
- Use Redux Toolkit for all global state and async API calls (createAsyncThunk).
- Use React Router v6 for routing.
- Use Formik + Yup for forms and validation.
- Keep all API calls in src/services/ files.
- Keep shared UI components in src/components/.
- Keep Redux slices in src/store/slices/.
- Use axiosInstance (not fetch) for all HTTP — interceptor unwraps ApiResponse envelope automatically.
- Use React Toastify for user notifications.
- Keep feature pages in src/pages/{FeatureName}/.

## Frontend Folder Rules

frontend/src/
- api/           (axiosInstance.js — do not duplicate)
- components/    (Button, Input, Select, Modal — shared only)
- config/        (routes.js, config.js)
- layouts/       (AppLayout.jsx, Sidebar.jsx)
- pages/         (one subfolder per feature)
- services/      (one file per feature: ProductService.js, etc.)
- store/
  - slices/      (one slice per feature)
  - store.js
- utils/         (formatters.js)

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

Unit test pure domain logic such as price code and calculations without DB.
Integration tests hit real PostgreSQL via Testcontainers.

Test these modules:

- Purchase price code generation
- Stock reservation
- Sale completion
- Draft cancellation
- Profit calculation
- Partial payment
- Return flow
