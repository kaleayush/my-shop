export interface ApiResponse<T> {
  data: T
  isSuccess: boolean
  error?: string
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

export interface ApiError {
  status: number
  error: string
}
