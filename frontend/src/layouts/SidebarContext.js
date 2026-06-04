import { createContext, useContext } from 'react'

export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export const useSidebar = () => useContext(SidebarContext)
