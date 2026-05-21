export enum PurchaseBillStatus {
  Uploaded = 1,
  ReviewPending = 2,
  Confirmed = 3,
  Cancelled = 4,
}

export interface PurchaseBillItem {
  id: string
  productId?: string | null
  productName?: string | null
  rawProductName: string
  quantity: number
  mrp: number
  purchasePrice: number
  suggestedProductId?: string | null
  suggestedProductName?: string | null
  matchConfidence: number
  isConfirmed: boolean
}

export interface PurchaseBillReview {
  id: string
  dealerId: string
  dealerName: string
  billNumber: string
  billDate: string
  uploadedFileUrl?: string | null
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  status: PurchaseBillStatus | string
  extractionStatus: string
  rawExtractedText?: string | null
  items: PurchaseBillItem[]
}

export interface UploadPurchaseBillPayload {
  dealerId: string
  billNumber?: string | null
  billDate: string
  totalAmount: number
  paidAmount: number
  file: File
}

export interface MapPurchaseBillItemPayload {
  purchaseBillItemId: string
  productId: string
}

export interface CreateProductFromPurchaseBillItemPayload {
  purchaseBillItemId: string
  productName: string
  minimumStockQuantity: number
}

export interface ConfirmPurchaseBillItemPayload {
  purchaseBillItemId: string
  productId: string
  rawProductName: string
  quantity: number
  mrp: number
  purchasePrice: number
}

export interface ConfirmPurchaseBillPayload {
  paidAmount: number
  items: ConfirmPurchaseBillItemPayload[]
}
