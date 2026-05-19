# Design Rules

## Application Type

Desktop-first web POS and inventory system.

The UI must be optimized for shop counter usage.

## Design Goals

- Fast billing
- Fast product search
- Minimal clicks
- Clear stock visibility
- Dealer-wise batch selection
- Easy OCR bill review
- Owner-only report visibility
- Future PWA support

## UI Stack

- Next.js
- Tailwind CSS
- shadcn/ui
- Lucide icons
- Responsive layout

## Main Layout

Use dashboard layout:

- Sidebar navigation
- Top bar
- Main content area
- User menu
- Shop selector in future
- Offline indicator in future

## Main Screens

### Login

Fields:

- Phone/email
- Password

### Dashboard

Cards:

- Today revenue
- Today sales count
- Pending customer amount
- Pending dealer amount
- Low stock count
- Draft bills count

### POS Billing

Must support:

- Fast product search
- Product result list
- Dealer-wise batch selection
- Multi-bill tabs
- Draft/Hold/Complete buttons
- Manual selling price
- Payment section

### Product Search

Search by:

- Product name
- Hindi name
- Bike model
- Color
- Graphic
- Dealer
- Misspelling

### Product Detail

Show:

- Product information
- Product image
- Dealer-wise stock batches
- MRP
- Purchase code
- Actual purchase price only for owner

### Inventory

Show table:

- Product
- Category
- Model
- Dealer
- Current stock
- Reserved stock
- Available stock
- Minimum stock
- Status

### Purchase Bill Upload

Flow:

1. Upload PDF
2. Show extraction progress
3. Show review table
4. Allow mapping product
5. Allow creating new product
6. Confirm purchase bill

### Dealer Management

Show:

- Dealer list
- Dealer details
- Pending amount
- Purchase history
- Payment history

### Reports

Owner-only screens:

- Revenue report
- Profit report
- Dealer report
- Customer credit report
- Damaged stock report

### Settings

Show:

- Shop details
- Users
- Roles
- Categories
- Brands
- Bike models
- Colors
- Graphics

## POS UX Rules

- Billing screen must be very fast.
- User should be able to search and add product quickly.
- Multi-bill tabs should be visible.
- Current draft total should always be visible.
- Payment completion should be clear.
- Cancel draft should ask confirmation.
- Remove item should release reserved stock.

## Visual Rules

- Use clean table design.
- Use badges for statuses.
- Use cards for dashboard.
- Use modals for quick add/edit.
- Use drawer/sidebar for product detail if useful.
- Use toast notifications for quick feedback.

## Status Badge Examples

Draft: Gray
Hold: Yellow
Completed: Green
Cancelled: Red
Low Stock: Orange
Out of Stock: Red

Color names are descriptive; final UI can use Tailwind/shadcn defaults.

## Future Mobile/PWA Design

The web app should be responsive enough for tablet/mobile use.

Future PWA should support:

- Installable app
- Offline indicator
- Local draft bills
- Sync status
