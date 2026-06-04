import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarContext } from './SidebarContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
