import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { forgotPassword, clearForgotPasswordState } from '../store/slices/authSlice'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const { forgotPasswordLoading, forgotPasswordSuccess, error } = useSelector(
    (state) => state.auth
  )

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Handle success messages
  useEffect(() => {
    if (forgotPasswordSuccess) {
      toast.success('Password reset email sent successfully!')
    }
  }, [forgotPasswordSuccess])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await dispatch(forgotPassword({ email: data.email })).unwrap()
    } catch (error) {
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    dispatch(clearForgotPasswordState())
  }

  if (forgotPasswordSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-8 h-8 text-success-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We've sent a password reset link to your email address.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="card text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Link
              to="/login"
              onClick={handleBackToLogin}
              className="btn-primary w-full"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Forgot Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to reset your password
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-danger-600"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-danger-50 border border-danger-200 rounded-lg"
              >
                <p className="text-sm text-danger-600">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || forgotPasswordLoading}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading || forgotPasswordLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2" />
                  Sending reset link...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Send Reset Link
                  <Mail className="ml-2 w-4 h-4" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Back to Login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-6"
          >
            <Link
              to="/login"
              onClick={handleBackToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <ArrowLeft className="inline w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword

