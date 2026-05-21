import { apiClient } from '@/lib/api-client'
import type {
  ConfirmPurchaseBillPayload,
  CreateProductFromPurchaseBillItemPayload,
  MapPurchaseBillItemPayload,
  PurchaseBillItem,
  PurchaseBillReview,
  UploadPurchaseBillPayload,
} from '../types'

export const purchaseBillService = {
  upload: async (payload: UploadPurchaseBillPayload): Promise<PurchaseBillReview> => {
    const formData = new FormData()
    formData.append('dealerId', payload.dealerId)
    formData.append('billNumber', payload.billNumber ?? '')
    formData.append('billDate', payload.billDate)
    formData.append('totalAmount', String(payload.totalAmount))
    formData.append('paidAmount', String(payload.paidAmount))
    formData.append('file', payload.file)

    const { data } = await apiClient.post<PurchaseBillReview>('/purchase-bills/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  review: async (id: string): Promise<PurchaseBillReview> => {
    const { data } = await apiClient.get<PurchaseBillReview>(`/purchase-bills/${id}/review`)
    return data
  },

  mapItem: async (purchaseBillId: string, payload: MapPurchaseBillItemPayload): Promise<PurchaseBillItem> => {
    const { data } = await apiClient.post<PurchaseBillItem>(`/purchase-bills/${purchaseBillId}/map-item`, payload)
    return data
  },

  createProductFromItem: async (
    purchaseBillId: string,
    payload: CreateProductFromPurchaseBillItemPayload
  ): Promise<PurchaseBillItem> => {
    const { data } = await apiClient.post<PurchaseBillItem>(`/purchase-bills/${purchaseBillId}/create-product-from-item`, payload)
    return data
  },

  confirm: async (purchaseBillId: string, payload: ConfirmPurchaseBillPayload): Promise<PurchaseBillReview> => {
    const { data } = await apiClient.post<PurchaseBillReview>(`/purchase-bills/${purchaseBillId}/confirm`, payload)
    return data
  },
}
