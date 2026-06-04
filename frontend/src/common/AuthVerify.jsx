import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { isTokenExpired } from '../utils/helpers'
import { ROUTES } from '../config/routes'

export default function AuthVerify() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && isTokenExpired(token)) {
      dispatch(logout())
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }, [location.pathname, dispatch, navigate])

  return null
}
