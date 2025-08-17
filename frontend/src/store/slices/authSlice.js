import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../utils/api'

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login({ email, password })
      localStorage.setItem('token', response.data.data.token)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Login failed'
      )
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register({ name, email, password })
      localStorage.setItem('token', response.data.data.token)
      return response.data.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Registration failed'
      )
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser()
      return response.data.data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get user')
    }
  }
)

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send reset email')
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword({ token, password })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset password')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout()
      localStorage.removeItem('token')
      return null
    } catch (error) {
      localStorage.removeItem('token')
      return rejectWithValue('Logout failed')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      return response.data.data.user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      )
    }
  }
)

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updatePassword(passwordData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        'Failed to update password'
      )
    }
  }
)

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  resetPasswordLoading: false,
  resetPasswordSuccess: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearAllErrors: (state) => {
      state.error = null
      state.forgotPasswordLoading = false
      state.resetPasswordLoading = false
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordLoading = false
      state.forgotPasswordSuccess = false
      state.error = null
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordLoading = false
      state.resetPasswordSuccess = false
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        localStorage.removeItem('token')
        state.error = action.payload
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false
        state.forgotPasswordSuccess = true
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false
        state.error = action.payload
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false
        state.resetPasswordSuccess = true
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false
        state.error = action.payload
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
  },
})

export const { clearError, clearAllErrors, clearForgotPasswordState, clearResetPasswordState } = authSlice.actions
export default authSlice.reducer
