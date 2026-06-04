import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import DealerService from '../../services/DealerService'

export const fetchDealers = createAsyncThunk('dealers/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await DealerService.getAll()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const createDealer = createAsyncThunk('dealers/create', async (payload, { rejectWithValue }) => {
  try {
    return await DealerService.create(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const updateDealer = createAsyncThunk('dealers/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await DealerService.update(id, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const deleteDealer = createAsyncThunk('dealers/delete', async (id, { rejectWithValue }) => {
  try {
    await DealerService.delete(id)
    return id
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const dealerSlice = createSlice({
  name: 'dealers',
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
      .addCase(fetchDealers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDealers.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload
        state.totalRows = payload.length
      })
      .addCase(fetchDealers.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createDealer.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createDealer.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data.push(payload)
        state.totalRows += 1
      })
      .addCase(createDealer.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(updateDealer.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateDealer.fulfilled, (state, { payload }) => {
        state.loading = false
        const idx = state.data.findIndex((d) => d.id === payload.id)
        if (idx !== -1) state.data[idx] = payload
      })
      .addCase(updateDealer.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(deleteDealer.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deleteDealer.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = state.data.filter((d) => d.id !== payload)
        state.totalRows = Math.max(0, state.totalRows - 1)
      })
      .addCase(deleteDealer.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { clearError } = dealerSlice.actions
export default dealerSlice.reducer
