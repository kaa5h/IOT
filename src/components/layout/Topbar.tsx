import React, { useMemo } from 'react';
import { Search, Bell, Bot, User, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { NotificationPanel } from '../NotificationPanel';
import { cn } from '../../lib/utils';

export const Topbar: React.FC = () => {
  const {
    isAiPanelOpen,
    toggleAIPanel,
    currentUserRole,
    setUserRole,
    notifications,
    isNotificationPanelOpen,
    toggleNotificationPanel,
  } = useStore();

  // Calculate unread count for current role
  const unreadCount = useMemo(() => {
    return notifications.filter(
      (n) => !n.read && n.visibleTo.includes(currentUserRole)
    ).length;
  }, [notifications, currentUserRole]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search machines, templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* AI Assistant Toggle */}
        <button
          onClick={toggleAIPanel}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isAiPanelOpen
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          title="AI Assistant"
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Users className="h-4 w-4 text-gray-600" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUserRole('IT')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                currentUserRole === 'IT'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              IT
            </button>
            <button
              onClick={() => setUserRole('OT')}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                currentUserRole === 'OT'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              OT
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={toggleNotificationPanel}
            className={cn(
              'relative p-2 rounded-lg transition-colors',
              isNotificationPanelOpen
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {isNotificationPanelOpen && <NotificationPanel />}
        </div>

        {/* User Profile */}
        <button
          className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="User Profile"
        >
          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
        </button>
      </div>
    </header>
  );
};
