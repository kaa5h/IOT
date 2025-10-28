import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';
import { Search, Plus, Download } from 'lucide-react';

export const Machines: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEndpoint = (machine: typeof machines[0]) => {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Machines</h1>
          <p className="text-gray-600 mt-1">Manage all your industrial machines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="lg" onClick={() => navigate('/wizard')}>
            <Plus className="h-5 w-5 mr-2" />
            Add Machine
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Machine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Protocol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredMachines.map((machine) => (
                <tr
                  key={machine.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/machines/${machine.id}`)}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{machine.name}</p>
                      <p className="text-sm text-gray-500">{machine.location}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{machine.type}</td>
                  <td className="px-6 py-4">
                    <Badge variant="protocol" protocol={machine.protocol.type}>
                      {machine.protocol.type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600">
                      {getEndpoint(machine)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="status" status={machine.status}>
                      {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatRelativeTime(machine.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
