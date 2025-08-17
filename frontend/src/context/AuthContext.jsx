import { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' })
          
          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Get current user
          const response = await api.get('/auth/me')
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token
            }
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
          
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Authentication failed'
          })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data.data
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Welcome back! 🎉')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await api.post('/auth/register', { name, email, password })
      const { user, token } = response.data.data
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      toast.success('Account created successfully! 🎉')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional)
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      
      // Remove token from API headers
      delete api.defaults.headers.common['Authorization']
      
      dispatch({ type: 'LOGOUT' })
      
      toast.success('Logged out successfully')
    }
  }

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!state.token && !!state.user
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}












