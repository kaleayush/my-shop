import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import PosService from '../../services/PosService'

export const fetchActiveDrafts = createAsyncThunk('pos/fetchActive', async (_, { rejectWithValue }) => {
  try {
    return await PosService.getActiveDrafts()
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const createDraft = createAsyncThunk('pos/create', async (payload = {}, { rejectWithValue }) => {
  try {
    return await PosService.createDraft(payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const loadDraft = createAsyncThunk('pos/load', async (id, { rejectWithValue }) => {
  try {
    return await PosService.getDraft(id)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const addDraftItem = createAsyncThunk('pos/addItem', async ({ draftId, payload }, { rejectWithValue }) => {
  try {
    return await PosService.addItem(draftId, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const updateDraftItem = createAsyncThunk('pos/updateItem', async ({ draftId, itemId, payload }, { rejectWithValue }) => {
  try {
    return await PosService.updateItem(draftId, itemId, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const removeDraftItem = createAsyncThunk('pos/removeItem', async ({ draftId, itemId }, { rejectWithValue }) => {
  try {
    return await PosService.removeItem(draftId, itemId)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const holdDraft = createAsyncThunk('pos/hold', async (draftId, { rejectWithValue }) => {
  try {
    return await PosService.hold(draftId)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const cancelDraft = createAsyncThunk('pos/cancel', async (draftId, { rejectWithValue }) => {
  try {
    return await PosService.cancel(draftId)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

export const completeDraft = createAsyncThunk('pos/complete', async ({ draftId, payload }, { rejectWithValue }) => {
  try {
    return await PosService.complete(draftId, payload)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const posSlice = createSlice({
  name: 'pos',
  initialState: {
    activeDrafts: [],
    selectedDraftId: null,
    currentDraft: null,
    loading: false,
    error: null,
    totalRows: 0,
  },
  reducers: {
    selectDraft: (state, { payload }) => { state.selectedDraftId = payload },
    closeDraftTab: (state, { payload }) => {
      state.activeDrafts = state.activeDrafts.filter((d) => d.id !== payload)
      if (state.selectedDraftId === payload) {
        state.selectedDraftId = state.activeDrafts[0]?.id ?? null
        state.currentDraft = null
      }
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const setDraft = (state, { payload }) => {
      state.loading = false
      state.currentDraft = payload
      const exists = state.activeDrafts.find((d) => d.id === payload.id)
      if (!exists) {
        state.activeDrafts.push({ id: payload.id, draftNumber: payload.draftNumber, customerName: payload.customerName })
      }
      state.selectedDraftId = payload.id
    }

    builder
      .addCase(fetchActiveDrafts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchActiveDrafts.fulfilled, (state, { payload }) => {
        state.loading = false
        state.activeDrafts = payload.map((d) => ({ id: d.id, draftNumber: d.draftNumber, customerName: d.customerName }))
        state.totalRows = payload.length
      })
      .addCase(fetchActiveDrafts.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(createDraft.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createDraft.fulfilled, setDraft)
      .addCase(createDraft.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(loadDraft.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loadDraft.fulfilled, setDraft)
      .addCase(loadDraft.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(addDraftItem.pending, (state) => { state.loading = true; state.error = null })
      .addCase(addDraftItem.fulfilled, (state, { payload }) => { state.loading = false; state.currentDraft = payload })
      .addCase(addDraftItem.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(updateDraftItem.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateDraftItem.fulfilled, (state, { payload }) => { state.loading = false; state.currentDraft = payload })
      .addCase(updateDraftItem.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(removeDraftItem.pending, (state) => { state.loading = true; state.error = null })
      .addCase(removeDraftItem.fulfilled, (state, { payload }) => { state.loading = false; state.currentDraft = payload })
      .addCase(removeDraftItem.rejected, (state, { payload }) => { state.loading = false; state.error = payload })

      .addCase(holdDraft.fulfilled, (state, { payload }) => {
        state.loading = false
        const idx = state.activeDrafts.findIndex((d) => d.id === payload.id)
        if (idx !== -1) state.activeDrafts[idx] = { ...state.activeDrafts[idx], status: payload.status }
        state.currentDraft = payload
      })

      .addCase(cancelDraft.fulfilled, (state, { payload }) => {
        state.loading = false
        state.activeDrafts = state.activeDrafts.filter((d) => d.id !== payload.id)
        if (state.selectedDraftId === payload.id) {
          state.selectedDraftId = state.activeDrafts[0]?.id ?? null
          state.currentDraft = null
        }
      })

      .addCase(completeDraft.pending, (state) => { state.loading = true; state.error = null })
      .addCase(completeDraft.fulfilled, (state, { payload }) => {
        state.loading = false
        state.activeDrafts = state.activeDrafts.filter((d) => d.id !== state.selectedDraftId)
        state.selectedDraftId = state.activeDrafts[0]?.id ?? null
        state.currentDraft = null
      })
      .addCase(completeDraft.rejected, (state, { payload }) => { state.loading = false; state.error = payload })
  },
})

export const { selectDraft, closeDraftTab, clearError } = posSlice.actions
export default posSlice.reducer
