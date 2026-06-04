import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import dealerReducer from './slices/dealerSlice'
import productReducer from './slices/productSlice'
import inventoryReducer from './slices/inventorySlice'
import posReducer from './slices/posSlice'
import purchaseBillReducer from './slices/purchaseBillSlice'
import settingsReducer from './slices/settingsSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    dealers: dealerReducer,
    products: productReducer,
    inventory: inventoryReducer,
    pos: posReducer,
    purchaseBills: purchaseBillReducer,
    settings: settingsReducer,
  },
})

export default store
