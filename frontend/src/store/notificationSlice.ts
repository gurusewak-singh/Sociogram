// frontend/src/store/notificationSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NotificationType } from '../types';

interface NotificationState {
  notifications: NotificationType[];
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<NotificationType[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    addNotification(state, action: PayloadAction<NotificationType>) {
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
    removeNotification(state, action: PayloadAction<string>) {
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
        // Recalculate unread count after removal
        state.unreadCount = state.notifications.filter(n => !n.read).length;
    },
    markAsRead(state, action: PayloadAction<string>) {
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