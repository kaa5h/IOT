import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { GitBranch, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

export const GitSyncPanel: React.FC = () => {
  const { gitSyncStatus } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    synced: {
      icon: CheckCircle2,
      color: 'text-success bg-green-50 border-green-200',
      dotColor: 'bg-success',
      label: 'Synced',
    },
    syncing: {
      icon: Clock,
      color: 'text-warning bg-yellow-50 border-yellow-200',
      dotColor: 'bg-warning animate-pulse',
      label: 'Syncing...',
    },
    conflict: {
      icon: AlertCircle,
      color: 'text-error bg-red-50 border-red-200',
      dotColor: 'bg-error',
      label: 'Conflict',
    },
  };

  const config = statusConfig[gitSyncStatus];
  const Icon = config.icon;

  return (
    <div
      className="fixed bottom-4 right-4 z-30"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={cn(
          'border rounded-lg shadow-lg transition-all duration-300',
          config.color,
          isExpanded ? 'w-80' : 'w-auto'
        )}
      >
        {/* Compact View */}
        <div className="flex items-center gap-2 p-3">
          <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{config.label}</span>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2 border-t border-current border-opacity-20">
            <div className="pt-2">
              <p className="text-xs font-medium mb-1">Last commit:</p>
              <p className="text-xs">"Added Assembly Robot 1"</p>
              <p className="text-xs text-gray-600">2 minutes ago</p>
            </div>

            <div>
              <p className="text-xs font-medium mb-1">Changed files:</p>
              <p className="text-xs">entries.yaml, config.yml</p>
            </div>

            <button className="flex items-center gap-1 text-xs hover:underline">
              <GitBranch className="h-3 w-3" />
              <span>View in Git</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
