import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from '../config/routes'

export default function ProtectedRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return children
}
