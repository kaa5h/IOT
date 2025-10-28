import React from 'react';
import { cn } from '../../lib/utils';
import type { MachineStatus, ProtocolType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'status' | 'protocol';
  status?: MachineStatus;
  protocol?: ProtocolType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  protocol,
  className,
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const statusColors: Record<MachineStatus, string> = {
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-red-100 text-red-800',
    deploying: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
  };

  const protocolColors: Record<ProtocolType, string> = {
    opcua: 'bg-purple-100 text-purple-800',
    s7: 'bg-indigo-100 text-indigo-800',
    modbus: 'bg-cyan-100 text-cyan-800',
    mqtt: 'bg-teal-100 text-teal-800',
    custom: 'bg-gray-100 text-gray-800',
  };

  let colorClass = 'bg-gray-100 text-gray-800';

  if (variant === 'status' && status) {
    colorClass = statusColors[status];
  } else if (variant === 'protocol' && protocol) {
    colorClass = protocolColors[protocol];
  }

  return (
    <span className={cn(baseStyles, colorClass, className)}>
      {status === 'deploying' && (
        <span className="mr-1 h-2 w-2 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
};
