import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth)
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    // Only redirect if we're not already on login page to prevent loops
    if (location.pathname !== '/login') {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
  }

  return children
}

export default ProtectedRoute




