import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, SortAsc, SortDesc, Calendar, Clock, CheckCircle, AlertCircle, Star, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { format, isToday, isTomorrow, isAfter, startOfDay } from 'date-fns'
import { useSelector, useDispatch } from 'react-redux'
import { taskAPI } from '../utils/api'
import { useDebounce } from '../hooks/useDebounce'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import StatsCard from '../components/StatsCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { toast } from 'react-toastify'
import { logout } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [paginationLoading, setPaginationLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(9) // 9 tasks per page (3x3 grid)


  // Custom function to check if a date is overdue
  const isOverdue = (date) => {
    return isAfter(startOfDay(new Date()), startOfDay(new Date(date)))
  }
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })
  const [sort, setSort] = useState({ field: 'createdAt', order: 'desc' })
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    overdue: 0
  })

  const debouncedSearch = useDebounce(filters.search, 500)

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setShowUserMenu(false)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      // Only show main loading on initial load or filter changes
      if (currentPage === 1) {
        setLoading(true)
      } else {
        setPaginationLoading(true)
      }
      setApiError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setApiError('No authentication token found')
        setLoading(false)
        return
      }
      
      const params = {
        ...filters,
        search: debouncedSearch,
        sort: sort.field,
        order: sort.order,
        page: currentPage,
        limit: pageSize
      }
      
      // Remove empty parameters to avoid validation errors
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      const response = await taskAPI.getTasks(params)
      
      if (response.data.success && response.data.data) {
        const tasksData = response.data.data.tasks || []
        const statsData = response.data.data.stats || {
          total: tasksData.length,
          completed: tasksData.filter(t => t.status === 'completed').length,
          pending: tasksData.filter(t => t.status === 'pending').length,
          inProgress: tasksData.filter(t => t.status === 'in-progress').length,
          highPriority: tasksData.filter(t => t.priority === 'high').length,
          overdue: tasksData.filter(t => isOverdue(t.dueDate) && t.status !== 'completed').length
        }
        
        // Handle pagination
        const paginationData = response.data.data.pagination || {}
        setTotalPages(paginationData.pages || Math.ceil(tasksData.length / pageSize))
        
        setTasks(tasksData)
        setStats(statsData)
      } else {
        setTasks([])
        setStats({
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          highPriority: 0,
          overdue: 0
        })
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      if (error.response?.status === 401) {
        setApiError('Authentication failed. Please login again.')
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to load tasks'
        setApiError(errorMessage)
        console.error('Task fetch error details:', error.response?.data)
      }
      setTasks([])
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        highPriority: 0,
        overdue: 0
      })
    } finally {
      setLoading(false)
      setPaginationLoading(false)
    }
  }

  // Fetch tasks when dependencies change
  useEffect(() => {
    fetchTasks()
  }, [debouncedSearch, filters.status, filters.priority, sort, currentPage, pageSize])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, filters.status, filters.priority, sort])

  // Show toast for errors
  useEffect(() => {
    if (apiError) {
      toast.error(apiError)
    }
  }, [apiError])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])


  const handleCreateTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData)
      
      if (response.data.success && response.data.data.task) {
        const newTask = response.data.data.task
        setTasks(prev => [newTask, ...prev])
        
        const taskStatus = newTask.status || 'pending'
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          [taskStatus]: prev[taskStatus] + 1
        }))
        
        toast.success('Task created successfully!')
        setShowModal(false)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error(error.response?.data?.error || 'Failed to create task')
    }
  }

  const handleUpdateTask = async (taskData) => {
    try {
      const response = await taskAPI.updateTask(editingTask._id, taskData)
      
      if (response.data.success && response.data.data.task) {
        const updatedTask = response.data.data.task
        setTasks(prev => prev.map(task => 
          task._id === editingTask._id ? updatedTask : task
        ))
        
        toast.success('Task updated successfully!')
        setShowModal(false)
        setEditingTask(null)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(error.response?.data?.error || 'Failed to update task')
    }
  }

  // Delete task
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task._id !== taskId))
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  // Toggle task importance
  const handleToggleImportance = async (taskId) => {
    try {
      const response = await taskAPI.toggleImportance(taskId)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.data.task : task
      ))
      toast.success(response.data.message)
    } catch (error) {
      console.error('Error toggling importance:', error)
      toast.error('Failed to update task')
    }
  }

  // Mark task as completed
  const handleCompleteTask = async (taskId) => {
    try {
      const response = await taskAPI.completeTask(taskId)
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.data.task : task
      ))
      toast.success('Task completed! 🎉')
    } catch (error) {
      console.error('Error completing task:', error)
      toast.error('Failed to complete task')
    }
  }

  // Open edit modal
  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  // Open create modal
  const handleCreateClick = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Let's organize your tasks and boost your productivity
              </p>
            </div>
            <motion.button
              onClick={handleCreateClick}
              className="btn-primary mt-4 sm:mt-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </motion.button>
            
            {/* User Menu */}
            <div className="relative mt-4 sm:mt-0 user-menu">
              <motion.button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium hidden sm:block">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </motion.button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>



        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Tasks"
            value={stats.total}
            icon={CheckCircle}
            color="primary"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="success"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertCircle}
            color="danger"
          />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="input"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Sort */}
              <div className="flex">
                <select
                  value={sort.field}
                  onChange={(e) => setSort(prev => ({ ...prev, field: e.target.value }))}
                  className="input rounded-r-none border-r-0"
                >
                  <option value="createdAt">Created</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() => setSort(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
                  className="btn-ghost border border-l-0 rounded-l-none"
                >
                  {sort.order === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">
              <strong>Error:</strong> {apiError}
            </p>
            <button
              onClick={fetchTasks}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Tasks Grid */}
        {loading || paginationLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text={loading ? "Loading tasks..." : "Loading more tasks..."} />
          </div>
        ) : (
          <div>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filters.search || filters.status || filters.priority 
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by creating your first task'
                  }
                </p>
                {!filters.search && !filters.status && !filters.priority && (
                  <motion.button
                    onClick={handleCreateClick}
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Task
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task._id}
                      variants={itemVariants}
                      layout
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onToggleImportance={handleToggleImportance}
                        onComplete={handleCompleteTask}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && tasks.length > 0 && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
          >
            {/* Page Size Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={6}>6 per page</option>
                <option value={9}>9 per page</option>
                <option value={12}>12 per page</option>
                <option value={15}>15 per page</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>

            {/* Page Info */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </motion.div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  )
}

export default Dashboard


