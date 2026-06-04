# Roadmap

## Phase 1: Foundation

Goal:
Create clean project structure and backend foundation.

Includes:

- Backend solution
- Onion Architecture projects
- EF Core setup
- PostgreSQL setup
- Result pattern
- Global exception handling
- Swagger
- Base entities
- Dependency injection

## Phase 2: Web Foundation

Goal:
Create React (Vite) web app foundation.

Includes:

- Vite + React setup (JavaScript/JSX)
- Tailwind CSS
- React Router v6
- Redux Toolkit store and base slices
- axiosInstance with ApiResponse interceptor
- App layout (sidebar + top bar)
- Dashboard shell
- Placeholder pages for all modules

## Phase 3: Auth and Shop

Goal:
Allow shop owner registration and login.

Includes:

- Shop entity
- User entity
- Role entity
- JWT login
- Role-based access control

## Phase 4: Master Data

Goal:
Create required master data modules.

Includes:

- Dealers
- Categories
- Brands
- Bike companies
- Bike models
- Colors
- Graphics

## Phase 5: Product and Inventory

Goal:
Create product and dealer-wise stock management.

Includes:

- Product CRUD
- Product images
- InventoryBatch
- Purchase price code
- Dealer-wise stock
- Low-stock logic

## Phase 6: POS Billing

Goal:
Create counter sale system.

Includes:

- Draft bills
- Multiple active bills
- Stock reservation
- Manual selling price
- Complete sale
- Partial payment
- Customer credit

## Phase 7: Purchase Bill Upload

Goal:
Upload dealer bills (PDF or image) and convert into inventory using Gemini AI.

Includes:

- Multipart upload (PDF + images)
- Gemini Flash AI extraction (structured JSON output)
- Inline review screen with empty state handling
- Product matching (exact, suggested, manual)
- Inventory batch creation on confirm
- Gemini API key stored in gitignored appsettings.Development.json

## Phase 8: Returns and Payments

Goal:
Handle real shop money and return flows.

Includes:

- Customer returns
- Damaged stock
- Dealer payments
- Customer pending payments

## Phase 9: Reports

Goal:
Owner analytics.

Includes:

- Day-wise revenue
- Day-wise profit
- Product-wise profit
- Dealer-wise purchase
- Pending payments
- Low stock

## Phase 10: PWA and Offline

Goal:
Make web app usable like app.

Includes:

- PWA installation
- Offline indicator
- Local draft bills
- Sync queue
- One primary device offline mode

## Phase 11: Future Mobile

Goal:
Mobile application after stable web MVP.

Includes:

- Flutter or React Native app
- Barcode scanning
- Push notifications
- Mobile POS
