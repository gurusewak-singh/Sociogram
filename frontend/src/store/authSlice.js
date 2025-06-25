//frontend/src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    logOut(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    addFriend(state, action) {
      if (state.user && state.user.friends) {
        if (!state.user.friends.includes(action.payload._id)) {
            state.user.friends.push(action.payload._id);
        }
      }
    },
  },
});

export const { setCredentials, logOut, addFriend } = authSlice.actions;
export default authSlice.reducer;