import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logout } from '../store/slices/authSlice'
import { toggleSidebarCollapsed, toggleSidebarMobile } from '../store/slices/uiSlice'
import { useSidebar } from './SidebarContext'
import { ROUTES } from '../config/routes'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { setCollapsed, setMobileOpen } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.info('Logged out successfully')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const handleDesktopToggle = () => {
    dispatch(toggleSidebarCollapsed())
    setCollapsed((prev) => !prev)
  }

  const handleMobileToggle = () => {
    dispatch(toggleSidebarMobile())
    setMobileOpen((prev) => !prev)
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 flex-shrink-0 z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={handleMobileToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Toggle mobile sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={handleDesktopToggle}
          className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>
        <span className="font-medium text-gray-700 text-sm hidden sm:block">
          {user?.shopName ?? 'AutoParts POS'}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {(user?.fullName?.[0] ?? 'U').toUpperCase()}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {user?.fullName ?? 'User'}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-52 z-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.role} · {user?.shopName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
