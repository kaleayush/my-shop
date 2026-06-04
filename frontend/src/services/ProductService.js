import axiosInstance from '../api/axiosInstance'

const ProductService = {
  search: (params = {}) =>
    axiosInstance.get('/products/search', { params }).then((r) => r.data),

  getById: (id) =>
    axiosInstance.get(`/products/${id}`).then((r) => r.data),

  create: (payload) =>
    axiosInstance.post('/products', payload).then((r) => r.data),

  update: (id, payload) =>
    axiosInstance.put(`/products/${id}`, payload).then((r) => r.data),

  addImage: (id, payload) =>
    axiosInstance.post(`/products/${id}/images`, payload).then((r) => r.data),
}

export default ProductService
