import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ProductService from '../../services/ProductService'

export const searchProducts = createAsyncThunk('products/search', async (params = {}, { rejectWithValue }) => {
  try {
    return await ProductService.search(params)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const createProduct = createAsyncThunk('products/create', async (payload, { rejectWithValue }) => {
  try {
    return await ProductService.create(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const updateProduct = createAsyncThunk('products/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await ProductService.update(id, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    data: [],
    loading: false,
    error: null,
    totalRows: 0,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(searchProducts.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload
        state.totalRows = payload.length
      })
      .addCase(searchProducts.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createProduct.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data.unshift(payload)
        state.totalRows += 1
      })
      .addCase(createProduct.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.loading = false
        const idx = state.data.findIndex((p) => p.id === payload.id)
        if (idx !== -1) state.data[idx] = payload
      })
      .addCase(updateProduct.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { clearError } = productSlice.actions
export default productSlice.reducer
