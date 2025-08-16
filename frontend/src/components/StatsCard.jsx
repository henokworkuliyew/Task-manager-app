import { motion } from 'framer-motion'

const StatsCard = ({ title, value, icon: Icon, color = 'primary' }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-50 dark:bg-primary-900/20',
          icon: 'text-primary-600 dark:text-primary-400',
          text: 'text-primary-600 dark:text-primary-400'
        }
      case 'success':
        return {
          bg: 'bg-success-50 dark:bg-success-900/20',
          icon: 'text-success-600 dark:text-success-400',
          text: 'text-success-600 dark:text-success-400'
        }
      case 'warning':
        return {
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          icon: 'text-warning-600 dark:text-warning-400',
          text: 'text-warning-600 dark:text-warning-400'
        }
      case 'danger':
        return {
          bg: 'bg-danger-50 dark:bg-danger-900/20',
          icon: 'text-danger-600 dark:text-danger-400',
          text: 'text-danger-600 dark:text-danger-400'
        }
      case 'secondary':
        return {
          bg: 'bg-secondary-50 dark:bg-secondary-900/20',
          icon: 'text-secondary-600 dark:text-secondary-400',
          text: 'text-secondary-600 dark:text-secondary-400'
        }
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-600 dark:text-gray-400'
        }
    }
  }

  const colors = getColorClasses(color)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`card ${colors.bg} border-0`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors.bg} mr-4`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <motion.p
            className={`text-2xl font-bold ${colors.text}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}

export default StatsCard











