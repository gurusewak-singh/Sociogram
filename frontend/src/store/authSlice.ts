// frontend/src/store/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Author } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  // Try to get user from localStorage as well, if you stored it
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      // It's good practice to store the user object too
      localStorage.setItem('user', JSON.stringify(user)); 
    },
    logOut(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Also remove user from storage
    },
    addFriend(state, action: PayloadAction<Author>) {
      if (state.user && state.user.friends) {
        // Prevent duplicates
        if (!state.user.friends.includes(action.payload._id)) {
            state.user.friends.push(action.payload._id);
        }
      }
    },
  },
});

export const { setCredentials, logOut, addFriend } = authSlice.actions;
export default authSlice.reducer;

// types/index.ts
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
  friends?: string[]; // Array of friend IDs
  friendRequests?: string[]; // Array of user IDs who sent requests
}