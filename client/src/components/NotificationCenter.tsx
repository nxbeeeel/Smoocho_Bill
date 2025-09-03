import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification, markAsRead } =
    useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2 max-w-sm">
      {notifications.slice(0, 3).map(notification => (
        <div
          key={notification.id}
          className={`
            bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300
            ${notification.type === 'success' ? 'border-green-500' : ''}
            ${notification.type === 'warning' ? 'border-yellow-500' : ''}
            ${notification.type === 'error' ? 'border-red-500' : ''}
            ${notification.type === 'info' ? 'border-blue-500' : ''}
          `}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>

              {notification.action && (
                <button
                  onClick={() => {
                    notification.action!.onClick();
                    markAsRead(notification.id);
                  }}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
