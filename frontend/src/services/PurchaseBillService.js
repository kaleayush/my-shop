import axiosInstance from '../api/axiosInstance'

const PurchaseBillService = {
  upload: (payload) => {
    const formData = new FormData()
    formData.append('dealerId', payload.dealerId)
    if (payload.billNumber) formData.append('billNumber', payload.billNumber)
    formData.append('billDate', payload.billDate)
    formData.append('totalAmount', String(payload.totalAmount))
    formData.append('paidAmount', String(payload.paidAmount))
    formData.append('file', payload.file)
    return axiosInstance
      .post('/purchase-bills/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  review: (id) =>
    axiosInstance.get(`/purchase-bills/${id}/review`).then((r) => r.data),

  mapItem: (purchaseBillId, payload) =>
    axiosInstance
      .post(`/purchase-bills/${purchaseBillId}/map-item`, payload)
      .then((r) => r.data),

  createProductFromItem: (purchaseBillId, payload) =>
    axiosInstance
      .post(`/purchase-bills/${purchaseBillId}/create-product-from-item`, payload)
      .then((r) => r.data),

  confirm: (purchaseBillId, payload) =>
    axiosInstance
      .post(`/purchase-bills/${purchaseBillId}/confirm`, payload)
      .then((r) => r.data),
}

export default PurchaseBillService
