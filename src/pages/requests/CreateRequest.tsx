import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import type { MachineType, ProtocolType, DataPointRequest } from '../../types';
import { generateId } from '../../lib/utils';
import { ChevronLeft, Send } from 'lucide-react';

const machineTypes: Array<{ value: MachineType; label: string }> = [
  { value: 'PLC', label: 'PLC' },
  { value: 'Robot', label: 'Robot' },
  { value: 'Sensor', label: 'Sensor' },
  { value: 'HMI', label: 'HMI' },
  { value: 'CNC Machine', label: 'CNC Machine' },
  { value: 'Custom', label: 'Custom' },
];

const protocols: Array<{ value: ProtocolType; label: string }> = [
  { value: 'opcua', label: 'OPC UA' },
  { value: 's7', label: 'Siemens S7' },
  { value: 'modbus', label: 'Modbus TCP' },
  { value: 'mqtt', label: 'MQTT' },
  { value: 'custom', label: 'Custom' },
];

export const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const { createRequest } = useStore();

  const [formData, setFormData] = useState({
    machineName: '',
    machineType: '' as MachineType | '',
    location: '',
    protocol: '' as ProtocolType | '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.machineName.trim()) newErrors.machineName = 'Required';
    if (!formData.machineType) newErrors.machineType = 'Required';
    if (!formData.location.trim()) newErrors.location = 'Required';
    if (!formData.protocol) newErrors.protocol = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const request: DataPointRequest = {
      id: generateId('req'),
      machineName: formData.machineName,
      machineType: formData.machineType as MachineType,
      location: formData.location,
      protocol: formData.protocol as ProtocolType,
      description: formData.description,
      requestedBy: 'IT User',
      requestedAt: new Date().toISOString(),
      dataPoints: [],
      status: 'pending_ot',
      route: 'it_review',
    };

    createRequest(request);
    navigate('/requests');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/requests')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Data Point Request</h1>
            <p className="text-gray-600 mt-1">Request OT to provide machine data points</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>IT Workflow:</strong> You're creating a request for OT engineers to fill in data
              points for a machine. OT will either send the data back to you for SCF generation, or
              generate it themselves (requiring your peer review).
            </p>
          </div>

          <Input
            label="Machine Name"
            placeholder="e.g., Welding Robot 5"
            value={formData.machineName}
            onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
            error={errors.machineName}
            required
          />

          <Select
            label="Machine Type"
            options={[
              { value: '', label: 'Select type...' },
              ...machineTypes.map((t) => ({ value: t.value, label: t.label })),
            ]}
            value={formData.machineType}
            onChange={(e) => setFormData({ ...formData, machineType: e.target.value as MachineType })}
            error={errors.machineType}
            required
          />

          <Input
            label="Location"
            placeholder="e.g., Production Floor C"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={errors.location}
            required
          />

          <Select
            label="Protocol"
            options={[
              { value: '', label: 'Select protocol...' },
              ...protocols.map((p) => ({ value: p.value, label: p.label })),
            ]}
            value={formData.protocol}
            onChange={(e) => setFormData({ ...formData, protocol: e.target.value as ProtocolType })}
            error={errors.protocol}
            required
          />

          <Textarea
            label="Description / Additional Instructions"
            placeholder="Provide context or specific requirements for the OT engineer..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => navigate('/requests')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Send Request to OT
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
