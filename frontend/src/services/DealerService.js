import axiosInstance from '../api/axiosInstance'

const DealerService = {
  getAll: () =>
    axiosInstance.get('/dealers').then((r) => r.data),

  create: (payload) =>
    axiosInstance.post('/dealers', payload).then((r) => r.data),

  update: (id, payload) =>
    axiosInstance.put(`/dealers/${id}`, payload).then((r) => r.data),

  delete: (id) =>
    axiosInstance.delete(`/dealers/${id}`),
}

export default DealerService
