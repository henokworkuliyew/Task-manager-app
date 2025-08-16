import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, isToday, isTomorrow, isAfter, startOfDay } from 'date-fns'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Tag,
  User
} from 'lucide-react'
import { taskAPI } from '../utils/api'
import TaskModal from '../components/TaskModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

 
  const isOverdue = (date) => {
    return isAfter(startOfDay(new Date()), startOfDay(new Date(date)))
  }

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await taskAPI.getTask(id)
      setTask(response.data.data.task)
    } catch (error) {
      console.error('Error fetching task:', error)
      toast.error('Failed to load task')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskAPI.updateTask(id, taskData)
      setTask(response.data.data.task)
      toast.success('Task updated successfully!')
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.deleteTask(id)
        toast.success('Task deleted successfully!')
        navigate('/dashboard')
      } catch (error) {
        console.error('Error deleting task:', error)
        toast.error('Failed to delete task')
      }
    }
  }

  const handleToggleImportance = async () => {
    try {
      const response = await taskAPI.toggleImportance(id)
      setTask(response.data.data.task)
      toast.success(response.data.message)
    } catch (error) {
      console.error('Error toggling importance:', error)
      toast.error('Failed to update task')
    }
  }

  const handleCompleteTask = async () => {
    try {
      const response = await taskAPI.completeTask(id)
      setTask(response.data.data.task)
      toast.success('Task completed! 🎉')
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    }
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
      case 'completed': return <CheckCircle className="w-5 h-5" />
      case 'in-progress': return <Clock className="w-5 h-5" />
      case 'pending': return <AlertCircle className="w-5 h-5" />
      default: return <AlertCircle className="w-5 h-5" />
    }
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null
    
    const date = new Date(dueDate)
    if (isOverdue(date) && task.status !== 'completed') {
      return { text: `Overdue ${format(date, 'MMM d, yyyy')}`, color: 'text-danger-600' }
    }
    if (isToday(date)) {
      return { text: 'Due today', color: 'text-warning-600' }
    }
    if (isTomorrow(date)) {
      return { text: 'Due tomorrow', color: 'text-warning-600' }
    }
    return { text: format(date, 'MMM d, yyyy'), color: 'text-gray-600' }
  }

  if (loading) {
    return <LoadingSpinner text="Loading task..." />
  }

  if (!task) {
    return <div>Task not found</div>
  }

  const dueDateInfo = formatDueDate(task.dueDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="btn-ghost"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              {task.status !== 'completed' && (
                <motion.button
                  onClick={handleCompleteTask}
                  className="btn-success"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </motion.button>
              )}
              
              <motion.button
                onClick={handleToggleImportance}
                className={`btn-ghost ${task.isImportant ? 'text-warning-600' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className={`w-4 h-4 mr-2 ${task.isImportant ? 'fill-current' : ''}`} />
                {task.isImportant ? 'Important' : 'Mark Important'}
              </motion.button>
              
              <motion.button
                onClick={() => setShowEditModal(true)}
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </motion.button>
              
              <motion.button
                onClick={handleDeleteTask}
                className="btn-danger"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Task Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Task Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    {task.isImportant && (
                      <Star className="w-6 h-6 text-warning-500 fill-current" />
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {task.title}
                    </h1>
                  </div>
                  
                  {task.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Priority */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-2 capitalize">{task.status}</span>
                </span>
                
                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  <span className="capitalize">{task.priority} Priority</span>
                </span>
              </div>

              {/* Due Date */}
              {dueDateInfo && (
                <div className="flex items-center text-lg text-gray-600 dark:text-gray-400 mb-6">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className={dueDateInfo.color}>{dueDateInfo.text}</span>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Info */}
              {task.status === 'completed' && task.completedAt && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-success-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Completed on {format(new Date(task.completedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-20">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-20">Updated:</span>
                  <span className="text-gray-900 dark:text-white">
                    {format(new Date(task.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400 w-20">Owner:</span>
                  <div className="flex items-center text-gray-900 dark:text-white">
                    <User className="w-4 h-4 mr-2" />
                    {task.user?.name || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {task.status !== 'completed' && (
                  <motion.button
                    onClick={handleCompleteTask}
                    className="w-full btn-success justify-start"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </motion.button>
                )}
                
                <motion.button
                  onClick={handleToggleImportance}
                  className={`w-full btn-ghost justify-start ${task.isImportant ? 'text-warning-600' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Star className={`w-4 h-4 mr-2 ${task.isImportant ? 'fill-current' : ''}`} />
                  {task.isImportant ? 'Remove Important' : 'Mark as Important'}
                </motion.button>
                
                <motion.button
                  onClick={() => setShowEditModal(true)}
                  className="w-full btn-outline justify-start"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        task={task}
        onSubmit={handleUpdateTask}
      />
    </div>
  )
}

export default TaskDetail


