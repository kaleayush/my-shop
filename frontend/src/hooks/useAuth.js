import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { ROUTES } from '../config/routes'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token, loading, error } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isOwner: user?.isOwner ?? false,
    logout: handleLogout,
  }
}
