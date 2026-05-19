export interface LoginResponse {
  token: string
  fullName: string
  email: string
  role: string
  shopId: string
  shopName: string
}

export interface CurrentUserResponse {
  id: string
  fullName: string
  email: string
  phone?: string
  role: string
  shopId: string
  shopName: string
  isOwner: boolean
}
