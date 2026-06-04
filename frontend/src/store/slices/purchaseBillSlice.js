import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import PurchaseBillService from '../../services/PurchaseBillService'

export const uploadPurchaseBill = createAsyncThunk('purchaseBills/upload', async (payload, { rejectWithValue }) => {
  try {
    return await PurchaseBillService.upload(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const reviewPurchaseBill = createAsyncThunk('purchaseBills/review', async (id, { rejectWithValue }) => {
  try {
    return await PurchaseBillService.review(id)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const confirmPurchaseBill = createAsyncThunk('purchaseBills/confirm', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await PurchaseBillService.confirm(id, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const mapBillItem = createAsyncThunk('purchaseBills/mapItem', async ({ billId, payload }, { rejectWithValue }) => {
  try {
    return await PurchaseBillService.mapItem(billId, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const createProductFromBillItem = createAsyncThunk('purchaseBills/createProduct', async ({ billId, payload }, { rejectWithValue }) => {
  try {
    return await PurchaseBillService.createProductFromItem(billId, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const updateItemInBill = (state, updatedItem) => {
  if (!state.currentBill) return
  const idx = state.currentBill.items.findIndex((i) => i.id === updatedItem.id)
  if (idx >= 0) state.currentBill.items[idx] = updatedItem
}

const purchaseBillSlice = createSlice({
  name: 'purchaseBills',
  initialState: {
    currentBill: null,
    loading: false,
    error: null,
    totalRows: 0,
  },
  reducers: {
    clearCurrentBill: (state) => { state.currentBill = null },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadPurchaseBill.pending, (state) => { state.loading = true; state.error = null })
      .addCase(uploadPurchaseBill.fulfilled, (state, { payload }) => { state.loading = false; state.currentBill = payload })
      .addCase(uploadPurchaseBill.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(reviewPurchaseBill.pending, (state) => { state.loading = true; state.error = null })
      .addCase(reviewPurchaseBill.fulfilled, (state, { payload }) => { state.loading = false; state.currentBill = payload })
      .addCase(reviewPurchaseBill.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(confirmPurchaseBill.pending, (state) => { state.loading = true; state.error = null })
      .addCase(confirmPurchaseBill.fulfilled, (state, { payload }) => { state.loading = false; state.currentBill = payload })
      .addCase(confirmPurchaseBill.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(mapBillItem.pending, (state) => { state.error = null })
      .addCase(mapBillItem.fulfilled, (state, { payload }) => { updateItemInBill(state, payload) })
      .addCase(mapBillItem.rejected, (state, { payload }) => { state.error = payload })

      .addCase(createProductFromBillItem.pending, (state) => { state.error = null })
      .addCase(createProductFromBillItem.fulfilled, (state, { payload }) => { updateItemInBill(state, payload) })
      .addCase(createProductFromBillItem.rejected, (state, { payload }) => { state.error = payload })
  },
})

export const { clearCurrentBill, clearError } = purchaseBillSlice.actions
export default purchaseBillSlice.reducer
