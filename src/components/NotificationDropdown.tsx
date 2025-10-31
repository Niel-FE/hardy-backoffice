'use client';

import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Notification } from '@/types/notification';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const getNotificationIcon = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'normal':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-yellow-500';
      case 'normal':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const unreadNotifications = notifications.filter((n) => n.status === 'unread');
  const readNotifications = notifications.filter((n) => n.status === 'read');

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">알림</h3>
        {unreadNotifications.length > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            모두 읽음으로 표시
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <InformationCircleIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>알림이 없습니다</p>
          </div>
        ) : (
          <>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase">
                  읽지 않음 ({unreadNotifications.length})
                </div>
                {unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-l-4 ${getPriorityColor(
                      notification.priority
                    )} bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div>
                {unreadNotifications.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-600 uppercase">
                    읽음 ({readNotifications.length})
                  </div>
                )}
                {readNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-l-4 ${getPriorityColor(
                      notification.priority
                    )} hover:bg-gray-50 cursor-pointer transition-colors`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 opacity-50">
                        {getNotificationIcon(notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0 opacity-70">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            모든 알림 보기
          </button>
        </div>
      )}
    </div>
  );
}
