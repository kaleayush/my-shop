export interface Product {
  id: string
  productName: string
  categoryId?: string | null
  categoryName?: string | null
  brandId?: string | null
  brandName?: string | null
  bikeCompanyId?: string | null
  bikeCompanyName?: string | null
  bikeModelId?: string | null
  bikeModelName?: string | null
  colorId?: string | null
  colorName?: string | null
  graphicId?: string | null
  graphicName?: string | null
  mrp: number
  hindiName?: string | null
  searchKeywords?: string | null
  barcode?: string | null
  qrCode?: string | null
  minimumStockQuantity: number
  totalQuantity: number
  reservedQuantity: number
  availableQuantity: number
  primaryImageUrl?: string | null
  isActive: boolean
}

export interface ProductImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  createdAt: string
}

export interface ProductBatchSummary {
  id: string
  dealerId: string
  dealerName: string
  batchNumber: string
  mrp: number
  purchasePrice?: number | null
  purchasePriceCode: string
  currentQuantity: number
  reservedQuantity: number
  availableQuantity: number
  minimumStockQuantity: number
  purchaseDate: string
  isLowStock: boolean
}

export interface ProductDetail extends Omit<Product, 'primaryImageUrl'> {
  images: ProductImage[]
  batches: ProductBatchSummary[]
}

export interface ProductPayload {
  productName: string
  categoryId?: string | null
  brandId?: string | null
  bikeCompanyId?: string | null
  bikeModelId?: string | null
  colorId?: string | null
  graphicId?: string | null
  mrp: number
  hindiName?: string | null
  searchKeywords?: string | null
  barcode?: string | null
  qrCode?: string | null
  minimumStockQuantity: number
}

export interface UpdateProductPayload extends ProductPayload {
  isActive: boolean
}

export interface AddProductImagePayload {
  imageUrl: string
  isPrimary: boolean
}

export interface InventoryBatch {
  id: string
  productId: string
  productName: string
  dealerId: string
  dealerName: string
  batchNumber: string
  mrp: number
  purchasePrice?: number | null
  purchasePriceCode: string
  initialQuantity: number
  currentQuantity: number
  reservedQuantity: number
  availableQuantity: number
  soldQuantity: number
  damagedQuantity: number
  minimumStockQuantity: number
  purchaseDate: string
  isLowStock: boolean
  isActive: boolean
}

export interface InventoryBatchPayload {
  productId: string
  dealerId: string
  batchNumber?: string | null
  mrp: number
  purchasePrice: number
  quantity: number
  minimumStockQuantity: number
  purchaseDate: string
}

export interface UpdateInventoryBatchPayload {
  batchNumber: string
  mrp: number
  purchasePrice: number
  currentQuantity: number
  reservedQuantity: number
  soldQuantity: number
  damagedQuantity: number
  minimumStockQuantity: number
  purchaseDate: string
  isActive: boolean
}

export interface AdjustInventoryPayload {
  inventoryBatchId: string
  quantityDelta: number
  reason?: string | null
}
