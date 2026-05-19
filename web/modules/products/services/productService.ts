import { apiClient } from '@/lib/api-client'
import type {
  AddProductImagePayload,
  InventoryBatch,
  InventoryBatchPayload,
  Product,
  ProductDetail,
  ProductImage,
  ProductPayload,
  UpdateInventoryBatchPayload,
  UpdateProductPayload,
  AdjustInventoryPayload,
} from '../types'

export const productService = {
  search: async (params?: { query?: string; categoryId?: string; dealerId?: string; includeInactive?: boolean }): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/products/search', { params })
    return data
  },

  getById: async (id: string): Promise<ProductDetail> => {
    const { data } = await apiClient.get<ProductDetail>(`/products/${id}`)
    return data
  },

  create: async (payload: ProductPayload): Promise<ProductDetail> => {
    const { data } = await apiClient.post<ProductDetail>('/products', payload)
    return data
  },

  update: async (id: string, payload: UpdateProductPayload): Promise<ProductDetail> => {
    const { data } = await apiClient.put<ProductDetail>(`/products/${id}`, payload)
    return data
  },

  addImage: async (id: string, payload: AddProductImagePayload): Promise<ProductImage> => {
    const { data } = await apiClient.post<ProductImage>(`/products/${id}/images`, payload)
    return data
  },
}

export const inventoryService = {
  getAll: async (): Promise<InventoryBatch[]> => {
    const { data } = await apiClient.get<InventoryBatch[]>('/inventory/batches')
    return data
  },

  getByProduct: async (productId: string): Promise<InventoryBatch[]> => {
    const { data } = await apiClient.get<InventoryBatch[]>(`/inventory/batches/${productId}`)
    return data
  },

  createBatch: async (payload: InventoryBatchPayload): Promise<InventoryBatch> => {
    const { data } = await apiClient.post<InventoryBatch>('/inventory/batches', payload)
    return data
  },

  updateBatch: async (id: string, payload: UpdateInventoryBatchPayload): Promise<InventoryBatch> => {
    const { data } = await apiClient.put<InventoryBatch>(`/inventory/batches/${id}`, payload)
    return data
  },

  adjust: async (payload: AdjustInventoryPayload): Promise<InventoryBatch> => {
    const { data } = await apiClient.post<InventoryBatch>('/inventory/adjust', payload)
    return data
  },

  lowStock: async (): Promise<InventoryBatch[]> => {
    const { data } = await apiClient.get<InventoryBatch[]>('/inventory/low-stock')
    return data
  },
}
