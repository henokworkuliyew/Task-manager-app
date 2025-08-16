import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import taskReducer from './slices/taskSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export const getState = store.getState
export const dispatch = store.dispatch
