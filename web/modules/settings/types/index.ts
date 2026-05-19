export interface SimpleEntity {
  id: string
  name: string
  isActive: boolean
}

export interface Category extends SimpleEntity {
  isGlobal: boolean
}

export interface BikeModel extends SimpleEntity {
  bikeCompanyId: string
  bikeCompanyName: string
}
