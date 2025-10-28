import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';
import {
  ChevronLeft,
  Edit2,
  Trash2,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';

export const MachineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines, deleteMachine, updateMachine } = useStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const machine = machines.find((m) => m.id === id);

  if (!machine) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Machine Not Found</h2>
        <p className="text-gray-600 mb-6">The requested machine does not exist.</p>
        <Button onClick={() => navigate('/machines')}>Back to Machines</Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMachine(machine.id);
    navigate('/machines');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTestingConnection(false);
    // Update machine status based on test (80% success rate)
    const success = Math.random() > 0.2;
    updateMachine(machine.id, {
      status: success ? 'connected' : 'error',
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleToggleStatus = () => {
    if (machine.status === 'connected') {
      updateMachine(machine.id, {
        status: 'disconnected',
        lastUpdated: new Date().toISOString(),
      });
    } else if (machine.status === 'disconnected') {
      updateMachine(machine.id, {
        status: 'connected',
        lastUpdated: new Date().toISOString(),
      });
    }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/machines')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{machine.name}</h1>
            <p className="text-gray-600 mt-1">{machine.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={machine.status === 'deploying'}
          >
            {machine.status === 'connected' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            loading={isTestingConnection}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/machines/${machine.id}/edit`)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge variant="status" status={machine.status}>
                {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-medium text-gray-900">{machine.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Protocol</p>
              <Badge variant="protocol" protocol={machine.protocol.type}>
                {machine.protocol.type.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Updated</p>
              <p className="font-medium text-gray-900">
                {formatRelativeTime(machine.lastUpdated)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {machine.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{machine.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Connection Details */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Endpoint</p>
              <p className="font-mono text-sm text-gray-900">{getEndpoint()}</p>
            </div>
            {Object.entries(machine.protocol.config).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="font-mono text-sm text-gray-900">
                  {key.toLowerCase().includes('password') ? '••••••••' : String(value)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Points */}
      <Card>
        <CardHeader>
          <CardTitle>Data Points ({machine.dataPoints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Data Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Access
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Polling Rate (ms)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {machine.dataPoints.map((dp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{dp.name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{dp.address}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{dp.dataType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 capitalize">{dp.access}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{dp.pollingRate || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Machine"
        size="sm"
      >
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{machine.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ This will permanently remove the machine configuration from the system.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Machine
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
