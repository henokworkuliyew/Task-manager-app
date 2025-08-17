import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'light',
  modalOpen: false,
  modalType: null,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    openModal: (state, action) => {
      state.modalOpen = true
      state.modalType = action.payload
    },
    closeModal: (state) => {
      state.modalOpen = false
      state.modalType = null
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
  },
})

export const {
  toggleSidebar,
  setTheme,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
} = uiSlice.actions

export default uiSlice.reducer








