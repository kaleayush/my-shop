# Requirements

## Project Overview

Auto Parts Inventory & POS Management System is a web-first SaaS-ready application for bike spare parts shops.

The system helps shop owners manage:

- Dealer purchase bills
- Product inventory
- Dealer-wise stock batches
- Product search
- POS billing
- Multiple active draft bills
- Stock reservation
- Customer payments and udhar
- Dealer payments
- Returns and damaged stock
- Low-stock reorder
- Revenue and profit reports
- OCR/PDF purchase bill upload
- Future mobile app and SaaS expansion

## Platform Priority

Current priority:

1. Web application first
2. PWA/offline support
3. Mobile app later

## User Roles

### Super Admin

For SaaS owner.

Permissions:

- Manage shops
- Manage subscriptions in future
- View system-level analytics in future

### Shop Owner

Main shop owner.

Permissions:

- Full shop access
- Actual purchase price visible
- Profit visible
- Reports visible
- User management
- Dealer payment
- Customer credit
- Inventory correction

### Manager

Permissions:

- Inventory management
- Billing
- Dealer management
- Limited reports

### Sales Staff

Permissions:

- Product search
- Create draft bill
- Complete sale
- View MRP
- View purchase price code
- Cannot view actual purchase price
- Cannot view profit

### Inventory Staff

Permissions:

- Add/update products
- Upload purchase bill
- Review OCR result
- Manage stock
- Manage dealer-wise reorder

## Product Categories

Initial categories:

- Fiber Parts
- Spare Parts
- Accessories

## Product Fields

Product should support:

- Product name
- Category
- Brand
- Bike company
- Bike model
- Color
- Graphic
- MRP
- Product image
- Barcode/QR code future field
- Search keywords
- Hindi name/search keyword
- Active/inactive status

## Inventory Batch Requirement

Product and stock batch must be separate.

Reason:

Same product can be purchased from multiple dealers with different purchase prices.

Example:

Product: Activa Side Panel Black

Batch 1:
- Dealer: Raj Auto
- Purchase Price: 750
- MRP: 1000
- Stock: 2
- Code: HFA

Batch 2:
- Dealer: Sharma Parts
- Purchase Price: 650
- MRP: 1000
- Stock: 3
- Code: GFA

Seller must select which batch to sell.

## Purchase Price Coding

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

Examples:

- 750 = HFA
- 650 = GFA
- 1000 = BAAA

Actual purchase price is visible only to owner.

Staff sees only code.

## Purchase Bill Upload

PDF can be:

- Typed PDF
- Scanned image PDF

Flow:

1. Upload purchase bill PDF.
2. Extract text using PDF parser/OCR.
3. Convert extracted data into bill items.
4. Show review screen.
5. User confirms/corrects data.
6. If product exact match is found, update stock.
7. If product matching is doubtful, ask user to map with existing product or create new product.
8. Save purchase bill.
9. Create inventory batches.
10. Update dealer payment if amount pending/paid.

## Product Matching Rule

If product name exactly matches, system can auto-map.

If product name is similar but not exact, system must ask:

- Map to existing product
- Create new product

Example:

Existing:
Activa Side Panel Black

New from bill:
Activa Panel RH Black

System must ask user to confirm.

## Search Requirement

Search must support:

- English
- Hindi
- Common spelling mistakes
- Product name
- Bike model
- Color
- Graphic
- Category
- Dealer
- Search keywords

Examples:

- Activa panel
- Activa pannel
- एक्टिवा पैनल
- Activa black side fiber

## POS Billing

Billing must support:

- Fast product search
- Dealer-wise stock selection
- Manual selling price
- Multiple active draft bills
- Hold bill
- Cancel bill
- Complete bill
- Cash/UPI/Card payment
- Partial payment
- Customer credit/udhar

## Multiple Active Bills

At one time, multiple draft bills can be active.

Bill statuses:

- Draft
- Hold
- Completed
- Cancelled

When product is added to draft bill:

- Stock is reserved immediately.
- Available stock decreases.
- Final bill completion converts reserved stock into sold stock.
- Cancel/remove item releases reserved stock.

## Stock Reservation

Formula:

Available Stock = Total Stock - Reserved Stock

Reservation starts when product is added to draft bill.

## Payment Requirement

Supported payment scenarios:

- Full cash
- Full UPI
- Full card
- Mixed payment in future
- Partial payment
- Udhar/pending amount

Sale stores:

- Total amount
- Paid amount
- Pending amount
- Payment mode
- Customer details optional

## Return Requirement

Customer return flow:

1. Customer returns product.
2. User selects original sale item if available.
3. If product is good, add back to stock.
4. If product is damaged, add to damaged/replacement stock.
5. Adjust revenue/profit if needed.

## Dealer Payment Requirement

Dealer payment tracking:

- Total purchase amount
- Paid amount
- Pending amount
- Payment date
- Payment mode
- Dealer ledger

## Low Stock Requirement

Low-stock reorder must be dealer-wise.

Example:

- Product: Activa Side Panel
- Dealer: Raj Auto
- Minimum stock: 3
- Current stock: 2
- Required order quantity: 1

## Reports

Owner-only reports:

- Day-wise revenue
- Day-wise profit
- Product-wise profit
- Dealer-wise purchase
- Dealer pending payment
- Customer pending payment
- Low-stock report
- Fast-moving products
- Damaged stock report

## Product Image

Search result does not need image by default.

Product detail page can show product image.

Images must be manually uploaded initially.

## Bill Sharing

Bill sharing is optional.

Future support:

- PDF bill
- WhatsApp share
- Print bill

## GST

GST billing is not required in MVP.

Future-ready design should allow GST support later.

## Offline Mode

MVP offline mode rule:

- One shop mostly uses one primary billing device.
- Offline billing can be supported through PWA/local storage/IndexedDB later.
- Complex multi-device offline conflict is not needed in MVP.

## Bill Number Format

Format:

SHOPCODE-YEAR-SEQUENCE

Example:

SHOP-2026-0001
