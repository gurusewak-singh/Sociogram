// frontend/src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; // <-- Import
import postReducer from './postSlice'; // <-- Import
import notificationReducer from './notificationSlice'; // <-- Import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    notifications: notificationReducer, // <-- Add to reducers
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;