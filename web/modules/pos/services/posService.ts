import { apiClient } from '@/lib/api-client'
import type {
  AddDraftSaleItemPayload,
  CompleteDraftSalePayload,
  CreateDraftSalePayload,
  DraftSale,
  Sale,
  UpdateDraftSaleItemPayload,
} from '../types'

export const posService = {
  createDraft: async (payload: CreateDraftSalePayload): Promise<DraftSale> => {
    const { data } = await apiClient.post<DraftSale>('/draft-sales', payload)
    return data
  },

  getActiveDrafts: async (): Promise<DraftSale[]> => {
    const { data } = await apiClient.get<DraftSale[]>('/draft-sales/active')
    return data
  },

  getDraft: async (id: string): Promise<DraftSale> => {
    const { data } = await apiClient.get<DraftSale>(`/draft-sales/${id}`)
    return data
  },

  addItem: async (draftId: string, payload: AddDraftSaleItemPayload): Promise<DraftSale> => {
    const { data } = await apiClient.post<DraftSale>(`/draft-sales/${draftId}/items`, payload)
    return data
  },

  updateItem: async (draftId: string, itemId: string, payload: UpdateDraftSaleItemPayload): Promise<DraftSale> => {
    const { data } = await apiClient.put<DraftSale>(`/draft-sales/${draftId}/items/${itemId}`, payload)
    return data
  },

  removeItem: async (draftId: string, itemId: string): Promise<DraftSale> => {
    const { data } = await apiClient.delete<DraftSale>(`/draft-sales/${draftId}/items/${itemId}`)
    return data
  },

  hold: async (draftId: string): Promise<DraftSale> => {
    const { data } = await apiClient.post<DraftSale>(`/draft-sales/${draftId}/hold`)
    return data
  },

  cancel: async (draftId: string): Promise<DraftSale> => {
    const { data } = await apiClient.post<DraftSale>(`/draft-sales/${draftId}/cancel`)
    return data
  },

  complete: async (draftId: string, payload: CompleteDraftSalePayload): Promise<Sale> => {
    const { data } = await apiClient.post<Sale>(`/draft-sales/${draftId}/complete`, payload)
    return data
  },
}
