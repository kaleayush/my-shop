# Database Design

## Database

Use PostgreSQL.

Use EF Core Code First migrations.

## Core Tables

### Shops

Stores tenant/shop data.

Fields:

- Id
- ShopCode
- Name
- OwnerName
- Phone
- Address
- IsActive
- CreatedAt
- UpdatedAt

### Users

Fields:

- Id
- ShopId
- FullName
- Email
- Phone
- PasswordHash
- RoleId
- IsActive
- CreatedAt
- UpdatedAt

### Roles

Fields:

- Id
- Name
- Description

Roles:

- SuperAdmin
- ShopOwner
- Manager
- SalesStaff
- InventoryStaff

### Dealers

Fields:

- Id
- ShopId
- Name
- Phone
- Address
- Notes
- IsActive
- CreatedAt
- UpdatedAt

### Categories

Initial categories:

- Fiber Parts
- Spare Parts
- Accessories

Fields:

- Id
- ShopId nullable for global category
- Name
- IsActive

### Brands

Fields:

- Id
- ShopId
- Name
- IsActive

### BikeCompanies

Fields:

- Id
- Name
- IsActive

Examples:

- Honda
- Hero
- TVS
- Bajaj
- Yamaha

### BikeModels

Fields:

- Id
- BikeCompanyId
- Name
- IsActive

Examples:

- Activa
- Splendor
- Pulsar
- Jupiter

### Colors

Fields:

- Id
- ShopId
- Name
- IsActive

### Graphics

Fields:

- Id
- ShopId
- Name
- IsActive

### Products

Fields:

- Id
- ShopId
- ProductName
- CategoryId
- BrandId
- BikeCompanyId
- BikeModelId
- ColorId
- GraphicId
- MRP
- HindiName
- SearchKeywords
- Barcode
- QRCode
- MinimumStockQuantity
- IsActive
- CreatedAt
- UpdatedAt

Important:
Product does not store purchase price directly.
Purchase price is stored in InventoryBatch.

### ProductImages

Fields:

- Id
- ShopId
- ProductId
- ImageUrl
- IsPrimary
- CreatedAt

### PurchaseBills

Fields:

- Id
- ShopId
- DealerId
- BillNumber
- BillDate
- UploadedFileUrl
- TotalAmount
- PaidAmount
- PendingAmount
- Status
- CreatedAt
- UpdatedAt

Status:

- Uploaded
- ReviewPending
- Confirmed
- Cancelled

### PurchaseBillItems

Fields:

- Id
- ShopId
- PurchaseBillId
- ProductId nullable before mapping
- RawProductName
- Quantity
- MRP
- PurchasePrice
- SuggestedProductId
- MatchConfidence
- IsConfirmed
- CreatedAt

Phase 7 note:
Uploaded PDF text is not stored long-term in MVP. The API returns a short extraction preview immediately after upload, and PurchaseBillItems store the parsed review rows that the user must confirm/map.

### InventoryBatches

Most important table.

Fields:

- Id
- ShopId
- ProductId
- DealerId
- PurchaseBillId
- PurchaseBillItemId
- BatchNumber
- MRP
- PurchasePrice
- PurchasePriceCode
- InitialQuantity
- CurrentQuantity
- ReservedQuantity
- SoldQuantity
- DamagedQuantity
- MinimumStockQuantity
- PurchaseDate
- IsActive
- CreatedAt
- UpdatedAt

Formula:

AvailableQuantity = CurrentQuantity - ReservedQuantity

### DraftSales

Fields:

- Id
- ShopId
- DraftNumber
- CustomerName
- CustomerPhone
- Status
- TotalAmount
- CreatedByUserId
- CreatedAt
- UpdatedAt

Status:

- Draft
- Hold
- Completed
- Cancelled

### DraftSaleItems

Fields:

- Id
- ShopId
- DraftSaleId
- ProductId
- InventoryBatchId
- Quantity
- MRP
- SellingPrice
- PurchasePriceSnapshot
- PurchasePriceCodeSnapshot
- CreatedAt

Important:
When DraftSaleItem is added, InventoryBatch.ReservedQuantity increases.

### Sales

Fields:

- Id
- ShopId
- SaleNumber
- DraftSaleId
- CustomerName
- CustomerPhone
- TotalAmount
- PaidAmount
- PendingAmount
- ProfitAmount
- PaymentStatus
- CreatedByUserId
- CreatedAt

PaymentStatus:

- Paid
- Partial
- Pending

### SaleItems

Fields:

- Id
- ShopId
- SaleId
- ProductId
- InventoryBatchId
- Quantity
- MRP
- SellingPrice
- PurchasePriceSnapshot
- PurchasePriceCodeSnapshot
- ProfitAmount
- CreatedAt

### Payments

Fields:

- Id
- ShopId
- SaleId nullable
- DealerId nullable
- PaymentType
- Amount
- PaymentMode
- Notes
- CreatedAt

PaymentType:

- CustomerPayment
- DealerPayment

PaymentMode:

- Cash
- UPI
- Card
- BankTransfer
- Other

### CustomerCredits

Fields:

- Id
- ShopId
- SaleId
- CustomerName
- CustomerPhone
- TotalAmount
- PaidAmount
- PendingAmount
- Status
- CreatedAt
- UpdatedAt

### DealerPayments

Fields:

- Id
- ShopId
- DealerId
- PurchaseBillId nullable
- TotalAmount
- PaidAmount
- PendingAmount
- Status
- CreatedAt
- UpdatedAt

### StockReservations

Fields:

- Id
- ShopId
- DraftSaleId
- DraftSaleItemId
- InventoryBatchId
- Quantity
- Status
- CreatedAt
- ReleasedAt nullable

Status:

- Active
- Released
- ConvertedToSale

### Returns

Fields:

- Id
- ShopId
- SaleId
- SaleItemId
- ProductId
- InventoryBatchId
- Quantity
- ReturnType
- Reason
- CreatedAt

ReturnType:

- GoodCondition
- Damaged
- Replacement

### DamagedStocks

Fields:

- Id
- ShopId
- ProductId
- InventoryBatchId
- Quantity
- Reason
- Status
- CreatedAt

Status:

- Pending
- Replaced
- Scrapped

### ReorderItems

Fields:

- Id
- ShopId
- DealerId
- ProductId
- InventoryBatchId nullable
- CurrentQuantity
- MinimumQuantity
- RequiredQuantity
- Status
- CreatedAt

Status:

- Pending
- Ordered
- Received
- Cancelled

### AuditLogs

Fields:

- Id
- ShopId
- UserId
- Action
- EntityName
- EntityId
- OldValueJson
- NewValueJson
- CreatedAt

## Future Tables

- DeviceSyncLogs
- OfflineSyncQueue
- Subscriptions
- ShopPlans
- Notifications
- WhatsAppMessages
