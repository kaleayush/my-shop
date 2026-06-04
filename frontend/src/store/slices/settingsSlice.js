import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  categoryService,
  brandService,
  colorService,
  graphicService,
  bikeCompanyService,
  bikeModelService,
} from '../../services/SettingsService'

const makeEntityThunks = (name, service) => ({
  fetchAll: createAsyncThunk(`settings/${name}/fetchAll`, async (_, { rejectWithValue }) => {
    try { return await service.getAll() } catch (err) { return rejectWithValue(err.message) }
  }),
  create: createAsyncThunk(`settings/${name}/create`, async (payload, { rejectWithValue }) => {
    try { return await service.create(payload.name ?? payload) } catch (err) { return rejectWithValue(err.message) }
  }),
  update: createAsyncThunk(`settings/${name}/update`, async ({ id, name }, { rejectWithValue }) => {
    try { return await service.update(id, name) } catch (err) { return rejectWithValue(err.message) }
  }),
  delete: createAsyncThunk(`settings/${name}/delete`, async (id, { rejectWithValue }) => {
    try { await service.delete(id); return id } catch (err) { return rejectWithValue(err.message) }
  }),
})

export const categoryThunks = makeEntityThunks('categories', categoryService)
export const brandThunks = makeEntityThunks('brands', brandService)
export const colorThunks = makeEntityThunks('colors', colorService)
export const graphicThunks = makeEntityThunks('graphics', graphicService)
export const bikeCompanyThunks = makeEntityThunks('bikeCompanies', bikeCompanyService)

export const fetchBikeModels = createAsyncThunk('settings/bikeModels/fetchAll', async (_, { rejectWithValue }) => {
  try { return await bikeModelService.getAll() } catch (err) { return rejectWithValue(err.message) }
})
export const fetchBikeModelsByCompany = createAsyncThunk('settings/bikeModels/byCompany', async (bikeCompanyId, { rejectWithValue }) => {
  try { return await bikeModelService.getByCompany(bikeCompanyId) } catch (err) { return rejectWithValue(err.message) }
})
export const createBikeModel = createAsyncThunk('settings/bikeModels/create', async ({ bikeCompanyId, name }, { rejectWithValue }) => {
  try { return await bikeModelService.create(bikeCompanyId, name) } catch (err) { return rejectWithValue(err.message) }
})
export const updateBikeModel = createAsyncThunk('settings/bikeModels/update', async ({ id, name }, { rejectWithValue }) => {
  try { return await bikeModelService.update(id, name) } catch (err) { return rejectWithValue(err.message) }
})
export const deleteBikeModel = createAsyncThunk('settings/bikeModels/delete', async (id, { rejectWithValue }) => {
  try { await bikeModelService.delete(id); return id } catch (err) { return rejectWithValue(err.message) }
})

const makeEntityState = () => ({ data: [], loading: false, error: null, totalRows: 0 })

const applyEntityCases = (builder, thunks, key) => {
  builder
    .addCase(thunks.fetchAll.pending, (state) => { state[key].loading = true; state[key].error = null })
    .addCase(thunks.fetchAll.fulfilled, (state, { payload }) => {
      state[key].loading = false; state[key].data = payload; state[key].totalRows = payload.length
    })
    .addCase(thunks.fetchAll.rejected, (state, { payload }) => { state[key].loading = false; state[key].error = payload })

    .addCase(thunks.create.pending, (state) => { state[key].loading = true; state[key].error = null })
    .addCase(thunks.create.fulfilled, (state, { payload }) => {
      state[key].loading = false; state[key].data.push(payload); state[key].totalRows += 1
    })
    .addCase(thunks.create.rejected, (state, { payload }) => { state[key].loading = false; state[key].error = payload })

    .addCase(thunks.update.pending, (state) => { state[key].loading = true; state[key].error = null })
    .addCase(thunks.update.fulfilled, (state, { payload }) => {
      state[key].loading = false
      const idx = state[key].data.findIndex((i) => i.id === payload.id)
      if (idx !== -1) state[key].data[idx] = payload
    })
    .addCase(thunks.update.rejected, (state, { payload }) => { state[key].loading = false; state[key].error = payload })

    .addCase(thunks.delete.pending, (state) => { state[key].loading = true; state[key].error = null })
    .addCase(thunks.delete.fulfilled, (state, { payload }) => {
      state[key].loading = false
      state[key].data = state[key].data.filter((i) => i.id !== payload)
      state[key].totalRows = Math.max(0, state[key].totalRows - 1)
    })
    .addCase(thunks.delete.rejected, (state, { payload }) => { state[key].loading = false; state[key].error = payload })
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    categories: makeEntityState(),
    brands: makeEntityState(),
    colors: makeEntityState(),
    graphics: makeEntityState(),
    bikeCompanies: makeEntityState(),
    bikeModels: makeEntityState(),
  },
  reducers: {},
  extraReducers: (builder) => {
    applyEntityCases(builder, categoryThunks, 'categories')
    applyEntityCases(builder, brandThunks, 'brands')
    applyEntityCases(builder, colorThunks, 'colors')
    applyEntityCases(builder, graphicThunks, 'graphics')
    applyEntityCases(builder, bikeCompanyThunks, 'bikeCompanies')

    builder
      .addCase(fetchBikeModels.pending, (state) => { state.bikeModels.loading = true })
      .addCase(fetchBikeModels.fulfilled, (state, { payload }) => {
        state.bikeModels.loading = false; state.bikeModels.data = payload; state.bikeModels.totalRows = payload.length
      })
      .addCase(fetchBikeModels.rejected, (state, { payload }) => { state.bikeModels.loading = false; state.bikeModels.error = payload })

      .addCase(createBikeModel.pending, (state) => { state.bikeModels.loading = true })
      .addCase(createBikeModel.fulfilled, (state, { payload }) => {
        state.bikeModels.loading = false; state.bikeModels.data.push(payload); state.bikeModels.totalRows += 1
      })
      .addCase(createBikeModel.rejected, (state, { payload }) => { state.bikeModels.loading = false; state.bikeModels.error = payload })

      .addCase(updateBikeModel.pending, (state) => { state.bikeModels.loading = true })
      .addCase(updateBikeModel.fulfilled, (state, { payload }) => {
        state.bikeModels.loading = false
        const idx = state.bikeModels.data.findIndex((m) => m.id === payload.id)
        if (idx !== -1) state.bikeModels.data[idx] = payload
      })
      .addCase(updateBikeModel.rejected, (state, { payload }) => { state.bikeModels.loading = false; state.bikeModels.error = payload })

      .addCase(deleteBikeModel.pending, (state) => { state.bikeModels.loading = true })
      .addCase(deleteBikeModel.fulfilled, (state, { payload }) => {
        state.bikeModels.loading = false
        state.bikeModels.data = state.bikeModels.data.filter((m) => m.id !== payload)
        state.bikeModels.totalRows = Math.max(0, state.bikeModels.totalRows - 1)
      })
      .addCase(deleteBikeModel.rejected, (state, { payload }) => { state.bikeModels.loading = false; state.bikeModels.error = payload })
  },
})

export default settingsSlice.reducer
