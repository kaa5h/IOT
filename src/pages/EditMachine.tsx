import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { ChevronLeft, Save } from 'lucide-react';
import type { MachineType, DataPoint, DataType, AccessType } from '../types';
import { Trash2, Plus } from 'lucide-react';
import { generateId } from '../lib/utils';

const machineTypes: Array<{ value: MachineType; label: string }> = [
  { value: 'PLC', label: 'PLC' },
  { value: 'Robot', label: 'Robot' },
  { value: 'Sensor', label: 'Sensor' },
  { value: 'HMI', label: 'HMI' },
  { value: 'CNC Machine', label: 'CNC Machine' },
  { value: 'Custom', label: 'Custom' },
];

export const EditMachine: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines, updateMachine } = useStore();

  const machine = machines.find((m) => m.id === id);

  const [formData, setFormData] = useState({
    name: machine?.name || '',
    type: machine?.type || '',
    location: machine?.location || '',
    description: machine?.description || '',
  });

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(machine?.dataPoints || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!machine) {
      navigate('/machines');
    }
  }, [machine, navigate]);

  if (!machine) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Machine name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Machine type is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateMachine(machine.id, {
      name: formData.name,
      type: formData.type as MachineType,
      location: formData.location,
      description: formData.description,
      dataPoints,
      lastUpdated: new Date().toISOString(),
    });

    navigate(`/machines/${machine.id}`);
  };

  const addDataPoint = () => {
    const newPoint: DataPoint = {
      id: generateId('dp'),
      name: '',
      address: '',
      dataType: 'Float',
      access: 'read',
      pollingRate: 1000,
    };
    setDataPoints([...dataPoints, newPoint]);
  };

  const updateDataPoint = (id: string, updates: Partial<DataPoint>) => {
    setDataPoints(dataPoints.map((dp) => (dp.id === id ? { ...dp, ...updates } : dp)));
  };

  const removeDataPoint = (id: string) => {
    setDataPoints(dataPoints.filter((dp) => dp.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/machines/${machine.id}`)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Machine</h1>
            <p className="text-gray-600 mt-1">{machine.name}</p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <Input
            label="Machine Name"
            placeholder="e.g., Assembly Line Robot 1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <Select
            label="Machine Type"
            options={[
              { value: '', label: 'Select a type...' },
              ...machineTypes.map((t) => ({ value: t.value, label: t.label })),
            ]}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as MachineType })}
            error={errors.type}
            required
          />

          <Input
            label="Location/Area"
            placeholder="e.g., Production Floor A"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={errors.location}
            required
          />

          <Textarea
            label="Description"
            placeholder="Optional description of the machine..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
      </Card>

      {/* Data Points */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Data Points</h2>
            <Button variant="outline" size="sm" onClick={addDataPoint}>
              <Plus className="h-4 w-4 mr-1" />
              Add Data Point
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Address/Node ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Data Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Access
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                      Polling (ms)
                    </th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {dataPoints.map((dp) => (
                    <tr key={dp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={dp.name}
                          onChange={(e) => updateDataPoint(dp.id!, { name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={dp.address}
                          onChange={(e) => updateDataPoint(dp.id!, { address: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm"
                          placeholder="Address"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={dp.dataType}
                          onChange={(e) =>
                            updateDataPoint(dp.id!, { dataType: e.target.value as DataType })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          <option value="Float">Float</option>
                          <option value="Int32">Int32</option>
                          <option value="Boolean">Boolean</option>
                          <option value="String">String</option>
                          <option value="UInt16">UInt16</option>
                          <option value="UInt32">UInt32</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={dp.access}
                          onChange={(e) =>
                            updateDataPoint(dp.id!, { access: e.target.value as AccessType })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          <option value="read">Read</option>
                          <option value="write">Write</option>
                          <option value="readwrite">Read/Write</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={dp.pollingRate || ''}
                          onChange={(e) =>
                            updateDataPoint(dp.id!, {
                              pollingRate: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                          placeholder="1000"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeDataPoint(dp.id!)}
                          className="text-error hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {dataPoints.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data points configured. Click "Add Data Point" to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(`/machines/${machine.id}`)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
