import axiosInstance from '../api/axiosInstance'

const InventoryService = {
  getAll: () =>
    axiosInstance.get('/inventory/batches').then((r) => r.data),

  getByProduct: (productId) =>
    axiosInstance.get(`/inventory/batches/${productId}`).then((r) => r.data),

  createBatch: (payload) =>
    axiosInstance.post('/inventory/batches', payload).then((r) => r.data),

  updateBatch: (id, payload) =>
    axiosInstance.put(`/inventory/batches/${id}`, payload).then((r) => r.data),

  adjust: (payload) =>
    axiosInstance.post('/inventory/adjust', payload).then((r) => r.data),

  getLowStock: () =>
    axiosInstance.get('/inventory/low-stock').then((r) => r.data),
}

export default InventoryService
