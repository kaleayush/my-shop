import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    sidebarMobileOpen: false,
  },
  reducers: {
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, { payload }) => {
      state.sidebarCollapsed = payload
    },
    toggleSidebarMobile: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen
    },
    setSidebarMobileOpen: (state, { payload }) => {
      state.sidebarMobileOpen = payload
    },
  },
})

export const {
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  toggleSidebarMobile,
  setSidebarMobileOpen,
} = uiSlice.actions
export default uiSlice.reducer
