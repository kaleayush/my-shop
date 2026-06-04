import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import InventoryService from '../../services/InventoryService'

export const fetchInventory = createAsyncThunk('inventory/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await InventoryService.getAll()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const createBatch = createAsyncThunk('inventory/createBatch', async (payload, { rejectWithValue }) => {
  try {
    return await InventoryService.createBatch(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const updateBatch = createAsyncThunk('inventory/updateBatch', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await InventoryService.updateBatch(id, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const adjustInventory = createAsyncThunk('inventory/adjust', async (payload, { rejectWithValue }) => {
  try {
    return await InventoryService.adjust(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const inventorySlice = createSlice({
  name: 'inventory',
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
      .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchInventory.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data = payload
        state.totalRows = payload.length
      })
      .addCase(fetchInventory.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createBatch.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createBatch.fulfilled, (state, { payload }) => {
        state.loading = false
        state.data.unshift(payload)
        state.totalRows += 1
      })
      .addCase(createBatch.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(updateBatch.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateBatch.fulfilled, (state, { payload }) => {
        state.loading = false
        const idx = state.data.findIndex((b) => b.id === payload.id)
        if (idx !== -1) state.data[idx] = payload
      })
      .addCase(updateBatch.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(adjustInventory.pending, (state) => { state.loading = true; state.error = null })
      .addCase(adjustInventory.fulfilled, (state, { payload }) => {
        state.loading = false
        const idx = state.data.findIndex((b) => b.id === payload.id)
        if (idx !== -1) state.data[idx] = payload
      })
      .addCase(adjustInventory.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { clearError } = inventorySlice.actions
export default inventorySlice.reducer
