import axiosInstance from '../api/axiosInstance'

const AuthService = {
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }).then((r) => r.data),

  registerShopOwner: (payload) =>
    axiosInstance.post('/auth/register-shop-owner', payload).then((r) => r.data),

  getCurrentUser: () =>
    axiosInstance.get('/auth/me').then((r) => r.data),
}

export default AuthService
