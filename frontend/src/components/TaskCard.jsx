import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, isAfter, startOfDay } from 'date-fns'
import { 
  Edit, 
  Trash2, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Tag
} from 'lucide-react'

const TaskCard = ({ task, onEdit, onDelete, onToggleImportance, onComplete }) => {
  // Custom function to check if a date is overdue
  const isOverdue = (date) => {
    return isAfter(startOfDay(new Date()), startOfDay(new Date(date)))
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'in-progress': return 'status-in-progress'
      case 'pending': return 'status-pending'
      default: return 'status-pending'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in-progress': return <Clock className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    
    const date = new Date(dueDate)
    if (isOverdue(date) && task.status !== 'completed') {
      return { text: `Overdue ${format(date, 'MMM d')}`, color: 'text-danger-600' }
    }
    if (isToday(date)) {
      return { text: 'Due today', color: 'text-warning-600' }
    }
    if (isTomorrow(date)) {
      return { text: 'Due tomorrow', color: 'text-warning-600' }
    }
    return { text: format(date, 'MMM d, yyyy'), color: 'text-gray-600' }
  }

  const dueDateInfo = formatDueDate(task.dueDate)


  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`card-hover relative overflow-hidden ${
        task.isOverdue && task.status !== 'completed' ? 'ring-2 ring-danger-200' : ''
      }`}
    >
      {/* Importance Indicator */}
      {task.isImportant && (
        <div className="absolute top-4 right-4">
          <Star className="w-5 h-5 text-warning-500 fill-current" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Status and Priority */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">{task.status}</span>
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          <span className="capitalize">{task.priority}</span>
        </span>
      </div>

      {/* Due Date */}
      {dueDateInfo && (
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span className={dueDateInfo.color}>{dueDateInfo.text}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {task.status !== 'completed' && (
            <motion.button
              onClick={() => onComplete(task._id)}
              className="btn-success text-xs px-3 py-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </motion.button>
          )}
          
          <motion.button
            onClick={() => onToggleImportance(task._id)}
            className={`btn-ghost text-xs px-3 py-1 ${
              task.isImportant ? 'text-warning-600' : 'text-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className={`w-4 h-4 mr-1 ${task.isImportant ? 'fill-current' : ''}`} />
            {task.isImportant ? 'Important' : 'Mark Important'}
          </motion.button>
        </div>

        <div className="flex items-center space-x-1">
          <motion.button
            onClick={() => onEdit(task)}
            className="btn-ghost text-xs p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => onDelete(task._id)}
            className="btn-ghost text-xs p-2 text-danger-600 hover:text-danger-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Completion Date */}
      {task.status === 'completed' && task.completedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-xs text-success-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed {format(new Date(task.completedAt), 'MMM d, yyyy')}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default TaskCard


