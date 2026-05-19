import axios, { AxiosError } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'

// Backend envelope shape
export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  isSuccess: boolean
  utcTimestamp: string
  errors?: string[]
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: string[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unwrap envelope: response.data (ApiResponse<T>) → response.data.data (T)
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
      response.data = (response.data as ApiResponse<unknown>).data
    }
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    const body = error.response?.data
    const message = body?.message ?? error.message ?? 'Something went wrong'
    const errors = body?.errors
    const statusCode = error.response?.status ?? 0

    return Promise.reject(new ApiError(statusCode, message, errors))
  }
)
