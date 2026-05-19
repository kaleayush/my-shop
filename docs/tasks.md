# Tasks

## Phase 1: Backend Foundation

- [x] Create backend solution
- [x] Create AutoPartsPOS.API project
- [x] Create AutoPartsPOS.Application project
- [x] Create AutoPartsPOS.Domain project
- [x] Create AutoPartsPOS.Infrastructure project
- [x] Add project references
- [x] Setup EF Core
- [x] Setup PostgreSQL connection
- [x] Create BaseEntity
- [x] Create AuditableEntity
- [x] Create Result pattern
- [x] Create global exception handling
- [x] Setup Swagger
- [x] Setup dependency injection structure
- [x] Build solution successfully
- [x] Create standardized API response envelope (ApiResponse<T>, PagedResponse<T>, BaseApiController)

## Phase 2: Web Foundation

- [x] Create Next.js web project
- [x] Setup TypeScript
- [x] Setup Tailwind CSS
- [x] Setup shadcn/ui
- [x] Create dashboard layout
- [x] Create sidebar navigation
- [x] Create top bar
- [x] Setup API client
- [x] Setup TanStack Query
- [x] Setup Zustand
- [x] Setup React Hook Form and Zod
- [x] Create placeholder pages for all modules

## Phase 3: Auth and Shop

- [x] Create Shop entity
- [x] Create Role entity
- [x] Create User entity
- [x] Create EF configurations
- [x] Create migration
- [x] Seed default roles
- [x] Implement shop owner registration
- [x] Implement login
- [x] Implement JWT authentication
- [x] Implement current user endpoint
- [x] Add auth UI in web app
- [x] Add protected routes

## Phase 4: Master Data

- [x] Dealer CRUD API
- [x] Category CRUD API
- [x] Brand CRUD API
- [x] BikeCompany CRUD API
- [x] BikeModel CRUD API
- [x] Color CRUD API
- [x] Graphic CRUD API
- [x] Dealer UI
- [x] Master data settings UI

## Phase 5: Product and Inventory

- [ ] Product entity
- [ ] ProductImage entity
- [ ] InventoryBatch entity
- [ ] Product CRUD API
- [ ] Product search API
- [ ] Product image upload API
- [ ] Inventory batch API
- [ ] Purchase price code service
- [ ] Low-stock API
- [ ] Product UI
- [ ] Inventory UI
- [ ] Product detail UI

## Phase 6: POS Billing

- [ ] DraftSale entity
- [ ] DraftSaleItem entity
- [ ] StockReservation entity
- [ ] Create draft sale API
- [ ] Add item to draft API
- [ ] Reserve stock on add item
- [ ] Remove item and release stock
- [ ] Hold draft API
- [ ] Cancel draft API
- [ ] Complete sale API
- [ ] Sale entity
- [ ] SaleItem entity
- [ ] Payment entity
- [ ] Partial payment support
- [ ] POS billing UI
- [ ] Multi-bill tabs UI
- [ ] Payment UI

## Phase 7: Purchase Bill OCR

- [ ] PurchaseBill entity
- [ ] PurchaseBillItem entity
- [ ] PDF upload API
- [ ] PDF text extraction
- [ ] OCR integration placeholder
- [ ] Review extracted bill API
- [ ] Product matching API
- [ ] Confirm purchase bill API
- [ ] Create inventory batches from confirmed bill
- [ ] Purchase bill upload UI
- [ ] Review and mapping UI

## Phase 8: Returns and Payments

- [ ] Return entity
- [ ] DamagedStock entity
- [ ] CustomerCredit entity
- [ ] DealerPayment entity
- [ ] Customer return API
- [ ] Damaged stock API
- [ ] Dealer payment API
- [ ] Customer credit API
- [ ] Return UI
- [ ] Dealer payment UI
- [ ] Customer credit UI

## Phase 9: Reports

- [ ] Revenue report API
- [ ] Profit report API
- [ ] Product-wise profit report API
- [ ] Dealer-wise purchase report API
- [ ] Pending customer payment report API
- [ ] Pending dealer payment report API
- [ ] Low-stock report API
- [ ] Reports UI

## Phase 10: PWA and Offline

- [ ] Add PWA support
- [ ] Add offline indicator
- [ ] Add IndexedDB/local cache plan
- [ ] Add sync queue structure
- [ ] Add offline draft sale prototype
- [ ] Add sync endpoint
