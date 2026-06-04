import axiosInstance from '../api/axiosInstance'

const PosService = {
  createDraft: (payload) =>
    axiosInstance.post('/draft-sales', payload).then((r) => r.data),

  getActiveDrafts: () =>
    axiosInstance.get('/draft-sales/active').then((r) => r.data),

  getDraft: (id) =>
    axiosInstance.get(`/draft-sales/${id}`).then((r) => r.data),

  addItem: (draftId, payload) =>
    axiosInstance.post(`/draft-sales/${draftId}/items`, payload).then((r) => r.data),

  updateItem: (draftId, itemId, payload) =>
    axiosInstance.put(`/draft-sales/${draftId}/items/${itemId}`, payload).then((r) => r.data),

  removeItem: (draftId, itemId) =>
    axiosInstance.delete(`/draft-sales/${draftId}/items/${itemId}`).then((r) => r.data),

  hold: (draftId) =>
    axiosInstance.post(`/draft-sales/${draftId}/hold`).then((r) => r.data),

  cancel: (draftId) =>
    axiosInstance.post(`/draft-sales/${draftId}/cancel`).then((r) => r.data),

  complete: (draftId, payload) =>
    axiosInstance.post(`/draft-sales/${draftId}/complete`, payload).then((r) => r.data),
}

export default PosService
