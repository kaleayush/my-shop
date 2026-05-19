import { apiClient } from '@/lib/api-client'
import type { Dealer, CreateDealerPayload, UpdateDealerPayload } from '../types'

export const dealerService = {
  getAll: async (): Promise<Dealer[]> => {
    const { data } = await apiClient.get<Dealer[]>('/dealers')
    return data
  },

  create: async (payload: CreateDealerPayload): Promise<Dealer> => {
    const { data } = await apiClient.post<Dealer>('/dealers', payload)
    return data
  },

  update: async (id: string, payload: UpdateDealerPayload): Promise<Dealer> => {
    const { data } = await apiClient.put<Dealer>(`/dealers/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/dealers/${id}`)
  },
}
