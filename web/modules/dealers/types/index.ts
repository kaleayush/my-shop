export interface Dealer {
  id: string
  name: string
  phone?: string
  address?: string
  notes?: string
  isActive: boolean
}

export interface CreateDealerPayload {
  name: string
  phone?: string
  address?: string
  notes?: string
}

export interface UpdateDealerPayload {
  name: string
  phone?: string
  address?: string
  notes?: string
}
