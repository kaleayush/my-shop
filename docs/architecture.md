# Architecture

## System Type

Web-first Auto Parts Inventory & POS SaaS system.

The application should be built as a clean, modular, maintainable system.

## High-Level Architecture

Frontend Web App
-> .NET 8 Web API
-> Application Layer
-> Domain Layer

Infrastructure implements Application contracts and talks to PostgreSQL.

## Backend Architecture

Use Onion Architecture.

Projects:

- AutoPartsPOS.API
- AutoPartsPOS.Application
- AutoPartsPOS.Domain
- AutoPartsPOS.Infrastructure

Dependency direction:

- Domain depends on nothing.
- Application depends on Domain.
- Infrastructure depends on Application and Domain.
- API depends on Application and Infrastructure for composition.

Application and Domain must never reference Infrastructure or API.

## Layer Responsibilities

### AutoPartsPOS.API

Responsible for:

- Controllers
- Middleware
- Authentication setup
- Swagger
- CORS
- Request routing
- Global exception handling
- API response formatting
- HTTP-specific adapters such as current user/claims access
- Application and Infrastructure dependency injection composition

Not allowed:

- Business logic
- Repository logic
- Direct repository calls from controllers
- EF Core DbContext usage
- Domain entity exposure as API response
- Infrastructure persistence logic

### AutoPartsPOS.Application

Responsible for:

- Business use cases
- Services
- CQRS handlers where useful
- DTOs
- Validators
- Repository/service contracts for Infrastructure and API adapters
- Result pattern usage
- Business workflows
- Save/commit abstraction using IAppDbContext

Examples:

- CreateProductService
- DraftSaleService
- PurchaseBillReviewService
- InventoryBatchService

Not allowed:

- EF Core DbSet<T> exposure
- EF Core query APIs such as Include, AnyAsync, ToListAsync
- ASP.NET HttpContext access
- Infrastructure or API project references
- External service implementation details

### AutoPartsPOS.Domain

Responsible for:

- Entities
- Value objects
- Domain enums
- Domain constants
- Domain rules that do not depend on external services

Domain must not depend on:

- EF Core
- API
- Application
- Infrastructure

### AutoPartsPOS.Infrastructure

Responsible for:

- EF Core DbContext
- Repository implementations
- PostgreSQL configuration
- EF Core migrations
- File storage
- OCR integration
- External service implementations
- Email/WhatsApp integration in future

Not allowed:

- Controllers or API response formatting
- HTTP context or claims access
- Business workflow orchestration

Infrastructure depends inward on Application contracts and Domain entities.

## Data Access Pattern

Use Repository pattern plus a minimal save abstraction. No separate Unit of Work interface is currently used.

Rules:

- EF Core DbContext is registered as scoped.
- AppDbContext is the implicit unit of work.
- Each repository implementation receives AppDbContext via constructor injection.
- Repositories only build queries and track entity changes.
- Repositories must NOT call SaveChangesAsync internally.
- Application services call IAppDbContext.SaveChangesAsync after all repository operations complete.
- This keeps multi-repository operations in one service method under one transaction boundary.
- Application services must not use EF Core DbSet<T>, Include, AnyAsync, or other EF query APIs directly.
- Application services must use repository interfaces for all persistence reads/writes.

Example:

Application service injects IProductRepository and IInventoryBatchRepository.
Service calls repository methods to stage changes.
Service calls IAppDbContext.SaveChangesAsync() once at the end.

Repository interfaces live in Application because Application owns use-case contracts.
Repository implementations live in Infrastructure because Infrastructure owns EF Core and PostgreSQL details.

## Testability

IAppDbContext is defined in Application and implemented by AppDbContext in Infrastructure.

IAppDbContext exposes only:

- Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)

This lets Application services control the commit boundary without referencing EF Core.

Repositories depend on AppDbContext because they are Infrastructure implementations.
Application services depend on repository interfaces and IAppDbContext.

Current user access:

- ICurrentUserService interface lives in Application.
- API implements ICurrentUserService using IHttpContextAccessor and JWT claims.
- Application services depend only on ICurrentUserService.
- Infrastructure must not use IHttpContextAccessor.

## Frontend Architecture

Use React with Vite (JavaScript/JSX).

Actual structure:

frontend/
- src/
  - api/          (axiosInstance — response interceptor unwraps ApiResponse envelope)
  - components/   (shared UI: Button, Input, Select, Modal)
  - config/       (routes, config)
  - layouts/      (AppLayout, Sidebar, SidebarContext)
  - pages/        (one folder per feature module)
  - services/     (API service files per feature)
  - store/        (Redux store + slices)
  - utils/        (formatters)

## Frontend Stack

- React (Vite, JavaScript/JSX — no TypeScript)
- Tailwind CSS
- Redux Toolkit (global state, createAsyncThunk for API calls)
- React Router v6
- Formik + Yup (forms and validation)
- Axios (API client)
- React Toastify (notifications)

## Frontend State Management

Redux Toolkit slices per feature:

- authSlice
- dealerSlice
- inventorySlice
- posSlice
- productSlice
- purchaseBillSlice
- settingsSlice
- uiSlice

## Frontend Pages

Pages are co-located with their feature folder under src/pages/:

- Auth/ — LoginPage, RegisterPage
- Dashboard/ — DashboardPage
- Dealers/ — DealersPage
- POS/ — PosPage
- Payments/ — PaymentsPage
- Products/ — ProductsPage, InventoryPage
- PurchaseBills/ — PurchaseBillsPage (upload + inline review)
- Reports/ — ReportsPage
- Returns/ — ReturnsPage
- Settings/ — SettingsPage

## Database

Use PostgreSQL.

Use EF Core migrations.

## Authentication

Use JWT authentication.

Current implementation:

- JWT validation is configured in API service extensions.
- Current user claims are adapted in API through ICurrentUserService.
- Application receives only the current user abstraction.

Future:

- Refresh token
- HttpOnly cookie support
- Role-based access control
- Permission-based access control

## SaaS/Multi-Tenant Design

Use ShopId/TenantId in shop-specific tables.

Every business table must be connected to ShopId where applicable.

Examples:

- Products
- Dealers
- InventoryBatches
- Sales
- PurchaseBills
- Reports

## Offline/PWA Architecture

Web app should be designed to support PWA later.

MVP can start online-first.

Future PWA:

- IndexedDB for local storage
- Sync queue
- Offline draft bills
- Offline product search cache
- Sync when internet returns

## Future Mobile Architecture

Mobile app can be built later using Flutter or React Native.

Mobile app should use the same backend APIs.

## Business Workflow Architecture

### Purchase Flow

Upload PDF or image
-> Gemini AI extracts structured items (name, qty, mrp, purchasePrice)
-> Review/correct in browser
-> Product matching (exact auto-map, fuzzy suggestion, or manual map)
-> Confirm purchase bill
-> Create inventory batches
-> Update dealer ledger

### Sale Flow

Search product
-> Select dealer batch
-> Enter selling price
-> Add to draft bill
-> Reserve stock
-> Complete payment
-> Create sale
-> Reduce/reserve stock
-> Calculate revenue/profit

### Return Flow

Select sale item
-> Return product
-> Good condition: add back to stock
-> Damaged: add to damaged stock
-> Adjust reports

## Design Principles

- Keep modules independent.
- Avoid large services.
- Avoid God classes.
- Keep controllers thin.
- Keep UI components reusable.
- Keep business rules documented.
