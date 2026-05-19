# skill.md

## Skill Context

This project is a web-first Auto Parts Inventory and POS Management SaaS system for bike spare parts shops.

Claude should use this file as business and technical context before implementing features.

## Business Domain

The shop sells:

- Bike spare parts
- Fiber parts
- Accessories

Products can vary by:

- Bike company
- Bike model
- Brand
- Color
- Graphic
- Dealer
- Purchase price
- MRP

## Critical Business Concepts

### Product

Represents the common product identity.

Example:

Activa Side Panel Black

### InventoryBatch

Represents dealer-wise purchased stock.

Same product can have multiple batches from different dealers with different purchase prices.

### Purchase Price Code

Actual purchase price is encoded for staff.

Mapping:

- 0 = A
- 1 = B
- 2 = C
- 3 = D
- 4 = E
- 5 = F
- 6 = G
- 7 = H
- 8 = I
- 9 = O

Example:

750 = HFA

### Draft Sale

A bill that is not completed yet.

When product is added to draft sale, stock is reserved.

### Stock Reservation

Available stock = Current stock - Reserved stock.

### Sale

Completed bill.

When draft sale is completed, reserved stock is converted into sold stock.

### Return

Returned product can be:

- Good condition: add back to stock
- Damaged: add to damaged stock/replacement

## Technical Skills Needed

Backend:

- .NET 8
- ASP.NET Core Web API
- EF Core
- PostgreSQL
- Onion Architecture
- CQRS
- Result pattern
- FluentValidation
- JWT Authentication

Frontend:

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod

OCR:

- Start with simple PDF text extraction
- Add OCR support for scanned PDFs
- Always include manual review screen

## Important Constraints

- Do not merge Product and InventoryBatch.
- Do not show actual purchase price to staff.
- Do not calculate profit on frontend only.
- Do not complete sale without transaction safety.
- Do not reduce stock without batch selection.
- Do not auto-map doubtful OCR products without user confirmation.
- Do not implement GST in MVP, but keep future scope clean.

## MVP Focus

Build in this order:

1. Backend foundation
2. Web foundation
3. Auth and shop setup
4. Master data
5. Product and inventory batch
6. POS draft sale
7. Stock reservation
8. Sale completion and payments
9. Purchase bill upload/review
10. Reports
