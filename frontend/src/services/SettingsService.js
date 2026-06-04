import axiosInstance from '../api/axiosInstance'

const makeSimple = (path) => ({
  getAll: () => axiosInstance.get(`/${path}`).then((r) => r.data),
  create: (name) => axiosInstance.post(`/${path}`, { name }).then((r) => r.data),
  update: (id, name) => axiosInstance.put(`/${path}/${id}`, { name }).then((r) => r.data),
  delete: (id) => axiosInstance.delete(`/${path}/${id}`),
})

export const categoryService = {
  ...makeSimple('categories'),
}

export const brandService = makeSimple('brands')
export const colorService = makeSimple('colors')
export const graphicService = makeSimple('graphics')
export const bikeCompanyService = makeSimple('bike-companies')

export const bikeModelService = {
  getAll: () => axiosInstance.get('/bike-models').then((r) => r.data),
  getByCompany: (bikeCompanyId) =>
    axiosInstance.get(`/bike-models/by-company/${bikeCompanyId}`).then((r) => r.data),
  create: (bikeCompanyId, name) =>
    axiosInstance.post('/bike-models', { bikeCompanyId, name }).then((r) => r.data),
  update: (id, name) => axiosInstance.put(`/bike-models/${id}`, { name }).then((r) => r.data),
  delete: (id) => axiosInstance.delete(`/bike-models/${id}`),
}
