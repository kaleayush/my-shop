import { apiClient } from '@/lib/api-client'
import type { SimpleEntity, Category, BikeModel } from '../types'

const simpleEndpoint = (path: string) => ({
  getAll: async (): Promise<SimpleEntity[]> => {
    const { data } = await apiClient.get<SimpleEntity[]>(`/${path}`)
    return data
  },
  create: async (name: string): Promise<SimpleEntity> => {
    const { data } = await apiClient.post<SimpleEntity>(`/${path}`, { name })
    return data
  },
  update: async (id: string, name: string): Promise<SimpleEntity> => {
    const { data } = await apiClient.put<SimpleEntity>(`/${path}/${id}`, { name })
    return data
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/${path}/${id}`)
  },
})

export const categoryService = {
  ...simpleEndpoint('categories'),
  getAll: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },
}

export const brandService = simpleEndpoint('brands')
export const colorService = simpleEndpoint('colors')
export const graphicService = simpleEndpoint('graphics')

export const bikeCompanyService = simpleEndpoint('bike-companies')

export const bikeModelService = {
  getAll: async (): Promise<BikeModel[]> => {
    const { data } = await apiClient.get<BikeModel[]>('/bike-models')
    return data
  },
  getByCompany: async (bikeCompanyId: string): Promise<BikeModel[]> => {
    const { data } = await apiClient.get<BikeModel[]>(`/bike-models/by-company/${bikeCompanyId}`)
    return data
  },
  create: async (bikeCompanyId: string, name: string): Promise<BikeModel> => {
    const { data } = await apiClient.post<BikeModel>('/bike-models', { bikeCompanyId, name })
    return data
  },
  update: async (id: string, name: string): Promise<BikeModel> => {
    const { data } = await apiClient.put<BikeModel>(`/bike-models/${id}`, { name })
    return data
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bike-models/${id}`)
  },
}
