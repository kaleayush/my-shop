import { apiClient } from '@/lib/api-client'
import type { LoginResponse, CurrentUserResponse } from '../types'

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password })
    return data
  },

  registerShopOwner: async (payload: {
    shopName: string
    ownerName: string
    phone: string
    address?: string
    email: string
    password: string
  }): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/register-shop-owner', payload)
    return data
  },

  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const { data } = await apiClient.get<CurrentUserResponse>('/auth/me')
    return data
  },
}
