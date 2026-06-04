import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import AuthService from '../../services/AuthService'

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await AuthService.login(email, password)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const registerShopOwner = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await AuthService.registerShopOwner(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await AuthService.getCurrentUser()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const setAuthFromPayload = (state, payload) => {
  state.loading = false
  state.error = null
  state.token = payload.token
  state.user = {
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    shopId: payload.shopId,
    shopName: payload.shopName,
    isOwner: payload.role === 'ShopOwner',
  }
  localStorage.setItem('token', payload.token)
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') ?? null,
    loading: false,
    error: null,
    totalRows: 0,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, { payload }) => setAuthFromPayload(state, payload))
      .addCase(loginUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(registerShopOwner.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerShopOwner.fulfilled, (state, { payload }) => setAuthFromPayload(state, payload))
      .addCase(registerShopOwner.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(fetchCurrentUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCurrentUser.fulfilled, (state, { payload }) => {
        state.loading = false
        state.user = { ...payload, isOwner: payload.role === 'ShopOwner' }
      })
      .addCase(fetchCurrentUser.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
