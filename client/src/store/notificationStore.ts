import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: notification => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    set(state => ({
      notifications: [newNotification, ...state.notifications],
    }));

    // Auto-remove notification after 5 seconds for non-error types
    if (notification.type !== 'error') {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 5000);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.read).length;
  },
}));
