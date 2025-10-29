import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Server,
  FileText,
  Rocket,
  Settings,
  ChevronLeft,
  Factory,
  MessageSquare,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/machines', icon: Server, label: 'Machines' },
  { path: '/requests', icon: MessageSquare, label: 'Requests' },
  { path: '/collaboration', icon: Users, label: 'Collaboration' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/deployments', icon: Rocket, label: 'Deployments' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Factory className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg text-gray-900">IoT Connect</span>
          </div>
        )}
        {isCollapsed && <Factory className="h-8 w-8 text-primary mx-auto" />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-gray-100',
                  isActive && 'bg-primary text-white hover:bg-blue-600',
                  !isActive && 'text-gray-700',
                  isCollapsed && 'justify-center'
                )
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
            'text-gray-600 hover:bg-gray-100 transition-colors'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              isCollapsed && 'rotate-180'
            )}
          />
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
