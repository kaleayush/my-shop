import axios from 'axios'
import { toast } from 'react-toastify'
import config from '../config/config'

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token')
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`
  }
  return cfg
})

axiosInstance.interceptors.response.use(
  (response) => {
    const d = response.data
    if (d && typeof d === 'object' && 'isSuccess' in d) {
      if (!d.isSuccess) {
        const msg = d.message ?? d.errors?.[0] ?? 'Request failed'
        return Promise.reject(new Error(msg))
      }
      response.data = d.data !== undefined ? d.data : d
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      toast.error('Session expired. Please log in again.')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    const d = error.response?.data
    const message =
      (d && d.message) ||
      (d && d.errors?.[0]) ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance
