import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { taskAPI } from '../../utils/api'

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTasks(params)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks')
    }
  }
)

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTask(id)
      return response.data.data.task
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch task')
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(taskData)
      return response.data.data.task
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create task')
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(id, taskData)
      return response.data.data.task
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update task')
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete task')
    }
  }
)

export const toggleTaskImportance = createAsyncThunk(
  'tasks/toggleImportance',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.toggleImportance(id)
      return response.data.data.task
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle importance')
    }
  }
)

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskAPI.completeTask(id)
      return response.data.data.task
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to complete task')
    }
  }
)

const initialState = {
  tasks: [],
  currentTask: null,
  stats: {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    highPriority: 0,
    overdue: 0,
  },
  loading: false,
  error: null,
  filters: {
    status: '',
    priority: '',
    search: '',
  },
  sort: {
    field: 'createdAt',
    order: 'desc',
  },
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
    clearCurrentTask: (state) => {
      state.currentTask = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.tasks
        state.stats = action.payload.stats
        state.error = null
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Single Task
      .addCase(fetchTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false
        state.currentTask = action.payload
        state.error = null
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
        state.stats.total += 1
        state.stats[action.payload.status || 'pending'] += 1
        if (action.payload.priority === 'high') {
          state.stats.highPriority += 1
        }
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload)
        state.stats.total -= 1
      })
      // Toggle Importance
      .addCase(toggleTaskImportance.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload
        }
      })
      // Complete Task
      .addCase(completeTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task._id === action.payload._id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.currentTask && state.currentTask._id === action.payload._id) {
          state.currentTask = action.payload
        }
        state.stats.completed += 1
        state.stats.pending -= 1
      })
  },
})

export const { clearError, setFilters, setSort, clearCurrentTask } = taskSlice.actions
export default taskSlice.reducer








