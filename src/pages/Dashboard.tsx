import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';
import {
  Plus,
  Server,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  FileEdit,
  Activity,
} from 'lucide-react';
import type { Machine, MachineStatus } from '../types';

const MachineCard: React.FC<{ machine: Machine; onClick: () => void }> = ({
  machine,
  onClick,
}) => {
  const statusIcons: Record<MachineStatus, React.ReactNode> = {
    connected: <Wifi className="h-4 w-4 text-success" />,
    disconnected: <WifiOff className="h-4 w-4 text-error" />,
    deploying: <Loader2 className="h-4 w-4 text-info animate-spin" />,
    error: <AlertCircle className="h-4 w-4 text-error" />,
    draft: <FileEdit className="h-4 w-4 text-gray-400" />,
  };

  const getEndpoint = () => {
    if (machine.protocol.type === 'opcua') {
      return (machine.protocol.config as any).endpointUrl || '';
    } else if (machine.protocol.type === 's7') {
      return (machine.protocol.config as any).ipAddress || '';
    } else if (machine.protocol.type === 'modbus') {
      const config = machine.protocol.config as any;
      return `${config.ipAddress}:${config.port}`;
    } else if (machine.protocol.type === 'mqtt') {
      return (machine.protocol.config as any).brokerAddress || '';
    }
    return '';
  };

  return (
    <Card hover onClick={onClick} className="transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Server className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{machine.name}</h3>
              <p className="text-sm text-gray-500">{machine.location}</p>
            </div>
          </div>
          {statusIcons[machine.status]}
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900">{machine.type}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Protocol:</span>
            <Badge variant="protocol" protocol={machine.protocol.type}>
              {machine.protocol.type.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Endpoint:</span>
            <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">
              {getEndpoint()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Data Points:</span>
            <span className="font-medium text-gray-900">{machine.dataPoints.length}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Badge variant="status" status={machine.status}>
            {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
          </Badge>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(machine.lastUpdated)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useStore();

  const stats = useMemo(() => {
    const total = machines.length;
    const connected = machines.filter((m) => m.status === 'connected').length;
    const deploying = machines.filter((m) => m.status === 'deploying').length;
    const errors = machines.filter((m) => m.status === 'error' || m.status === 'disconnected').length;

    return { total, connected, deploying, errors };
  }, [machines]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your industrial machines</p>
        </div>
        <Button size="lg" onClick={() => navigate('/wizard')}>
          <Plus className="h-5 w-5 mr-2" />
          Add New Machine
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Machines</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-3xl font-bold text-success mt-1">{stats.connected}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Wifi className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deploying</p>
                <p className="text-3xl font-bold text-info mt-1">{stats.deploying}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-3xl font-bold text-error mt-1">{stats.errors}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machines Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connected Machines</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/machines')}>
            View All
          </Button>
        </div>

        {machines.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No machines yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first machine to get started with IoT monitoring
              </p>
              <Button onClick={() => navigate('/wizard')}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Machine
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machines.slice(0, 9).map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onClick={() => navigate(`/machines/${machine.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
