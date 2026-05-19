export type DraftSaleStatus = 'Draft' | 'Hold' | 'Completed' | 'Cancelled' | number
export type SalePaymentStatus = 'Paid' | 'Partial' | 'Pending' | number

export enum PaymentMode {
  Cash = 1,
  UPI = 2,
  Card = 3,
  BankTransfer = 4,
  Other = 5,
}

export interface DraftSaleItem {
  id: string
  productId: string
  productName: string
  inventoryBatchId: string
  dealerId: string
  dealerName: string
  batchNumber: string
  quantity: number
  mrp: number
  sellingPrice: number
  lineTotal: number
  purchasePriceSnapshot?: number | null
  purchasePriceCodeSnapshot: string
}

export interface DraftSale {
  id: string
  draftNumber: string
  customerName?: string | null
  customerPhone?: string | null
  status: DraftSaleStatus
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: DraftSaleItem[]
}

export interface CreateDraftSalePayload {
  customerName?: string | null
  customerPhone?: string | null
}

export interface AddDraftSaleItemPayload {
  productId: string
  inventoryBatchId: string
  quantity: number
  sellingPrice: number
}

export interface UpdateDraftSaleItemPayload {
  quantity: number
  sellingPrice: number
}

export interface CompleteDraftSalePayload {
  paidAmount: number
  paymentMode: PaymentMode
  notes?: string | null
  customerName?: string | null
  customerPhone?: string | null
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  inventoryBatchId: string
  dealerName: string
  batchNumber: string
  quantity: number
  mrp: number
  sellingPrice: number
  lineTotal: number
  purchasePriceSnapshot?: number | null
  purchasePriceCodeSnapshot: string
  profitAmount?: number | null
}

export interface Payment {
  id: string
  amount: number
  paymentMode: PaymentMode
  notes?: string | null
  createdAt: string
}

export interface Sale {
  id: string
  saleNumber: string
  draftSaleId: string
  customerName?: string | null
  customerPhone?: string | null
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  profitAmount?: number | null
  paymentStatus: SalePaymentStatus
  createdAt: string
  items: SaleItem[]
  payments: Payment[]
}
