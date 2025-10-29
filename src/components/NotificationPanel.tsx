import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from './ui/Button';
import { formatRelativeTime } from '../lib/utils';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Server,
  AlertTriangle,
  GitBranch,
  Info,
} from 'lucide-react';
import type { Notification, NotificationType } from '../types';

const getNotificationIcon = (type: NotificationType) => {
  const iconClass = 'h-5 w-5';

  switch (type) {
    case 'request_created':
    case 'request_filled':
      return <FileText className={`${iconClass} text-blue-600`} />;

    case 'scf_generated':
    case 'review_pending':
      return <AlertCircle className={`${iconClass} text-orange-600`} />;

    case 'scf_approved':
    case 'deployment_success':
    case 'machine_connected':
      return <CheckCircle2 className={`${iconClass} text-green-600`} />;

    case 'scf_rejected':
    case 'deployment_failed':
    case 'machine_error':
      return <XCircle className={`${iconClass} text-red-600`} />;

    case 'machine_disconnected':
      return <Server className={`${iconClass} text-gray-600`} />;

    case 'validation_warning':
      return <AlertTriangle className={`${iconClass} text-yellow-600`} />;

    case 'git_sync_issue':
      return <GitBranch className={`${iconClass} text-purple-600`} />;

    case 'system_alert':
    default:
      return <Info className={`${iconClass} text-blue-600`} />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500';
    case 'high':
      return 'border-l-orange-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
    default:
      return 'border-l-blue-500';
  }
};

export const NotificationPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    currentUserRole,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    toggleNotificationPanel,
  } = useStore();

  // Filter notifications for current role
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => n.visibleTo.includes(currentUserRole));
  }, [notifications, currentUserRole]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter((n) => !n.read).length;
  }, [filteredNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    markNotificationAsRead(notification.id);

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      toggleNotificationPanel();
      navigate(notification.actionUrl);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  return (
    <div className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={toggleNotificationPanel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Actions Bar */}
      {filteredNotifications.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${getPriorityColor(
                  notification.priority
                )} ${!notification.read ? 'bg-blue-50/30' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p
                      className={`text-xs ${
                        notification.read ? 'text-gray-500' : 'text-gray-600'
                      } mb-2`}
                    >
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(notification.timestamp)}
                      </span>

                      <div className="flex items-center gap-2">
                        {notification.actionLabel && (
                          <span className="text-xs text-primary font-medium">
                            {notification.actionLabel} →
                          </span>
                        )}

                        <button
                          onClick={(e) => handleDelete(e, notification.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Related Entity Tags */}
                    {(notification.machineName || notification.requestId) && (
                      <div className="flex gap-2 mt-2">
                        {notification.machineName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            <Server className="h-3 w-3" />
                            {notification.machineName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 5 && (
        <div className="p-3 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};
