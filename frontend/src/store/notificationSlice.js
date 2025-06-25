//frontend/src/store/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    addNotification(state, action) {
      if (!state.notifications.some(n => n._id === action.payload._id)) {
        state.notifications.unshift(action.payload);
        state.unreadCount++;
      }
    },
    markInformationalAsRead(state) {
        let count = 0;
        state.notifications.forEach(n => {
            if (n.type === 'like' || n.type === 'comment') {
                n.read = true;
            }
            if (!n.read) { // Recalculate unread count
                count++;
            }
        });
        state.unreadCount = count;
    },
    removeNotification(state, action) {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        // Recalculate unread count after removal
        state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    markAsRead(state, action) {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--; // Decrement unread count
      }
    },
  },
});

export const { setNotifications, addNotification, markInformationalAsRead, removeNotification, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;