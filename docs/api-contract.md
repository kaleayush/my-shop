# API Contract

Base URL:

/api

## Standard Response Envelope

All endpoints return a consistent JSON envelope:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "isSuccess": true,
  "utcTimestamp": "2026-05-19T10:00:00Z",
  "errors": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| statusCode | int | HTTP status code mirrored in body |
| message | string | Human-readable result message |
| data | T or null | Response payload |
| isSuccess | bool | true when statusCode is 2xx |
| utcTimestamp | datetime | UTC time of response |
| errors | string[] or null | Validation error list (populated on 400 validation failures) |

### Paginated Response

For list endpoints that support pagination, `data` is:

```json
{
  "items": [...],
  "totalCount": 50,
  "page": 1,
  "pageSize": 20,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### Error Response (validation)

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "isSuccess": false,
  "utcTimestamp": "2026-05-19T10:00:00Z",
  "errors": ["Name is required", "Phone must be at most 20 characters"]
}
```

### Error Response (not found / business rule)

```json
{
  "statusCode": 404,
  "message": "Dealer not found",
  "data": null,
  "isSuccess": false,
  "utcTimestamp": "2026-05-19T10:00:00Z",
  "errors": null
}
```

---

## Auth

### POST /api/auth/register-shop-owner

Registers a new shop and shop owner.

### POST /api/auth/login

Logs user into system.

### POST /api/auth/refresh-token

Future use.

### POST /api/auth/logout

Future use.

## Shops

### GET /api/shops/current

Returns current shop details.

### PUT /api/shops/current

Updates current shop details.

## Users

### GET /api/users

Returns shop users.

### POST /api/users

Creates user.

### PUT /api/users/{id}

Updates user.

### PATCH /api/users/{id}/status

Activates/deactivates user.

## Dealers

### GET /api/dealers

Returns dealers.

### GET /api/dealers/{id}

Returns dealer detail.

### POST /api/dealers

Creates dealer.

### PUT /api/dealers/{id}

Updates dealer.

### DELETE /api/dealers/{id}

Soft deletes dealer.

## Master Data

### Categories

- GET /api/categories
- POST /api/categories
- PUT /api/categories/{id}

### Brands

- GET /api/brands
- POST /api/brands
- PUT /api/brands/{id}

### Bike Companies

- GET /api/bike-companies
- POST /api/bike-companies
- PUT /api/bike-companies/{id}

### Bike Models

- GET /api/bike-models
- POST /api/bike-models
- PUT /api/bike-models/{id}

### Colors

- GET /api/colors
- POST /api/colors
- PUT /api/colors/{id}

### Graphics

- GET /api/graphics
- POST /api/graphics
- PUT /api/graphics/{id}

## Products

### GET /api/products/search

Search products by:

- product name
- Hindi name
- spelling mistake
- bike model
- color
- graphic
- category
- dealer

### GET /api/products/{id}

Returns product detail.

### POST /api/products

Creates product.

### PUT /api/products/{id}

Updates product.

### POST /api/products/{id}/images

Uploads product image.

## Inventory

### GET /api/inventory/batches/{productId}

Returns dealer-wise inventory batches for product.

### POST /api/inventory/adjust

Manual stock adjustment.

### GET /api/inventory/low-stock

Returns low-stock items.

### GET /api/inventory/reorder/dealer-wise

Returns dealer-wise reorder list.

## Purchase Bills

### POST /api/purchase-bills/upload

Uploads PDF bill.

### GET /api/purchase-bills/{id}/review

Returns extracted bill items for review.

### POST /api/purchase-bills/{id}/confirm

Confirms purchase bill items and creates inventory batches.

### POST /api/purchase-bills/{id}/map-item

Maps extracted item to existing product.

### POST /api/purchase-bills/{id}/create-product-from-item

Creates product from extracted item.

## Draft Sales / POS

### POST /api/draft-sales

Creates draft bill.

### GET /api/draft-sales/active

Returns active draft bills.

### GET /api/draft-sales/{id}

Returns draft bill detail.

### POST /api/draft-sales/{id}/items

Adds item to draft and reserves stock.

### PUT /api/draft-sales/{id}/items/{itemId}

Updates item quantity or selling price.

### DELETE /api/draft-sales/{id}/items/{itemId}

Removes item and releases reserved stock.

### POST /api/draft-sales/{id}/hold

Marks draft as hold.

### POST /api/draft-sales/{id}/cancel

Cancels draft and releases reserved stock.

### POST /api/draft-sales/{id}/complete

Completes sale and converts reservation to sale.

## Sales

### GET /api/sales/{id}

Returns sale details.

### GET /api/sales

Returns sales list with filters.

### GET /api/sales/day-wise

Returns day-wise sales.

## Payments

### POST /api/payments/sale

Adds customer payment.

### POST /api/payments/dealer

Adds dealer payment.

### GET /api/payments/customer-pending

Returns customer pending payments.

### GET /api/payments/dealer-pending

Returns dealer pending payments.

## Returns

### POST /api/returns

Creates return.

### GET /api/returns

Returns return list.

## Reports

### GET /api/reports/revenue

Day-wise revenue report.

### GET /api/reports/profit

Owner-only profit report.

### GET /api/reports/product-profit

Owner-only product profit report.

### GET /api/reports/dealer-wise-purchase

Dealer-wise purchase report.

### GET /api/reports/customer-credit

Customer credit report.

### GET /api/reports/damaged-stock

Damaged stock report.

## Sync / Future PWA

### POST /api/sync/offline

Future endpoint for offline sync.

### GET /api/sync/bootstrap

Future endpoint to download offline cache.
