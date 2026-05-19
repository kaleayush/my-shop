# Architecture

## System Type

Web-first Auto Parts Inventory & POS SaaS system.

The application should be built as a clean, modular, maintainable system.

## High-Level Architecture

Frontend Web App
↓
.NET 8 Web API
↓
Application Layer
↓
Domain Layer
↓
Infrastructure Layer
↓
PostgreSQL Database

## Backend Architecture

Use Onion Architecture.

Projects:

- AutoPartsPOS.API
- AutoPartsPOS.Application
- AutoPartsPOS.Domain
- AutoPartsPOS.Infrastructure

## Layer Responsibilities

### AutoPartsPOS.API

Responsible for:

- Controllers
- Middleware
- Authentication setup
- Swagger
- Request routing
- Global exception handling
- API response formatting

Not allowed:

- Business logic
- Direct repository calls
- EF Core DbContext usage
- Domain entity exposure as API response

### AutoPartsPOS.Application

Responsible for:

- Business use cases
- Services
- CQRS handlers
- DTOs
- Validators
- Interfaces for Infrastructure
- Result pattern usage
- Business workflows

Examples:

- CreateProductService
- DraftSaleService
- PurchaseBillReviewService
- InventoryBatchService

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
- Infrastructure

### AutoPartsPOS.Infrastructure

Responsible for:

- EF Core DbContext
- Repository implementations
- PostgreSQL configuration
- File storage
- OCR integration
- External services
- Email/WhatsApp integration in future

## Data Access Pattern

Use Repository pattern only. No explicit Unit of Work interface.

Rules:

- EF Core DbContext (scoped lifetime) is the implicit unit of work.
- Each repository receives DbContext via constructor injection.
- Repositories only build queries and track entity changes.
- Repositories must NOT call SaveChangesAsync internally.
- Application services call SaveChangesAsync after all repository operations complete.
- This ensures multi-repository operations in one service method are a single transaction.

Example:

Application service injects IProductRepository and IInventoryBatchRepository.
Service calls repo methods to stage changes.
Service calls _context.SaveChangesAsync() once at end.
Single transaction. No explicit UoW wrapper needed.

## Testability

Define IAppDbContext interface in Application layer.
AppDbContext in Infrastructure implements it.
Services depend on IAppDbContext, not AppDbContext directly.

IAppDbContext exposes:

- DbSet<T> per entity
- Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)

This allows unit tests to mock IAppDbContext without hitting PostgreSQL.
Repositories also depend on IAppDbContext, not AppDbContext.

Dependency direction:

Domain <- Application (IAppDbContext) <- Infrastructure (AppDbContext : IAppDbContext)

## Frontend Architecture

Use Next.js 15 with TypeScript.

Recommended structure:

web/
- app/
- components/
- modules/
- services/
- hooks/
- store/
- lib/
- types/

## Frontend Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

## Frontend Module Structure

Each feature should be grouped under modules.

Example:

modules/
- auth/
- dashboard/
- products/
- inventory/
- dealers/
- purchase-bills/
- pos/
- reports/
- settings/

Each module can contain:

- components/
- hooks/
- services/
- schemas/
- types/

## Database

Use PostgreSQL.

Use EF Core migrations.

## Authentication

Use JWT authentication.

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

Upload PDF
↓
OCR extract
↓
Review/correct
↓
Product matching
↓
Create purchase bill
↓
Create inventory batches
↓
Update dealer ledger

### Sale Flow

Search product
↓
Select dealer batch
↓
Enter selling price
↓
Add to draft bill
↓
Reserve stock
↓
Complete payment
↓
Create sale
↓
Reduce/reserve stock
↓
Calculate revenue/profit

### Return Flow

Select sale item
↓
Return product
↓
Good condition: add back to stock
↓
Damaged: add to damaged stock
↓
Adjust reports

## Design Principles

- Keep modules independent.
- Avoid large services.
- Avoid God classes.
- Keep controllers thin.
- Keep UI components reusable.
- Keep business rules documented.
