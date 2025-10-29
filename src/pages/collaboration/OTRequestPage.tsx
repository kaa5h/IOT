import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import type { MachineType, ProtocolType, OTRequest } from '../../types';
import { generateId } from '../../lib/utils';
import { NotificationTemplates } from '../../lib/notificationHelpers';
import { ArrowLeft, Send } from 'lucide-react';

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

const requestTypes: Array<{ value: OTRequest['requestType']; label: string }> = [
  { value: 'new_machine', label: 'New Machine Connection' },
  { value: 'update_config', label: 'Update Configuration' },
  { value: 'troubleshoot', label: 'Troubleshooting' },
  { value: 'integration', label: 'System Integration' },
];

export const OTRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { createOTRequest, addNotification } = useStore();

  const [formData, setFormData] = useState({
    requestType: 'new_machine' as OTRequest['requestType'],
    machineName: '',
    machineType: '' as MachineType | '',
    location: '',
    protocol: '' as ProtocolType | '',
    description: '',
    currentIssue: '',
    requirements: '',
    configNotes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.machineName.trim()) newErrors.machineName = 'Required';
    if (!formData.machineType) newErrors.machineType = 'Required';
    if (!formData.location.trim()) newErrors.location = 'Required';
    if (!formData.protocol) newErrors.protocol = 'Required';
    if (!formData.description.trim()) newErrors.description = 'Required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const request: OTRequest = {
      id: generateId('otreq'),
      requestType: formData.requestType,
      machineName: formData.machineName,
      machineType: formData.machineType as MachineType,
      location: formData.location,
      protocol: formData.protocol as ProtocolType,
      operationalData: {
        description: formData.description,
        currentIssue: formData.currentIssue || undefined,
        requirements: formData.requirements,
        configNotes: formData.configNotes || undefined,
      },
      requestedBy: 'OT User',
      requestedAt: new Date().toISOString(),
      status: 'ot_data_provided',
    };

    createOTRequest(request);

    // Notify IT users
    const notification = {
      id: generateId('notif'),
      type: 'request_created' as const,
      priority: 'high' as const,
      title: 'New OT Request',
      message: `OT requests help for ${formData.machineName}`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
      requestId: request.id,
      machineName: request.machineName,
      actionUrl: `/collaboration/${request.id}/it-draft`,
      actionLabel: 'Create Draft',
    };
    addNotification(notification);

    navigate('/collaboration');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/collaboration')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collaborations
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Request IT Support</h1>
        <p className="text-gray-600 mt-1">
          Provide operational data and requirements for IT to create a Service Commissioning File
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type *
            </label>
            <Select
              value={formData.requestType}
              onChange={(e) =>
                setFormData({ ...formData, requestType: e.target.value as OTRequest['requestType'] })
              }
            >
              {requestTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Machine Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Name *
              </label>
              <Input
                value={formData.machineName}
                onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
                placeholder="e.g., CNC Mill 03"
                error={errors.machineName}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Type *
              </label>
              <Select
                value={formData.machineType}
                onChange={(e) =>
                  setFormData({ ...formData, machineType: e.target.value as MachineType })
                }
                error={errors.machineType}
              >
                <option value="">Select type...</option>
                {machineTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A, Floor 2"
                error={errors.location}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protocol *
              </label>
              <Select
                value={formData.protocol}
                onChange={(e) =>
                  setFormData({ ...formData, protocol: e.target.value as ProtocolType })
                }
                error={errors.protocol}
              >
                <option value="">Select protocol...</option>
                {protocols.map((proto) => (
                  <option key={proto.value} value={proto.value}>
                    {proto.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Operational Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you need help with..."
              error={errors.description}
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide context about the machine and what you're trying to achieve
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Issue (Optional)
            </label>
            <Textarea
              rows={2}
              value={formData.currentIssue}
              onChange={(e) => setFormData({ ...formData, currentIssue: e.target.value })}
              placeholder="Any current problems or challenges..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements *
            </label>
            <Textarea
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="What do you need the configuration to do?"
              error={errors.requirements}
            />
            <p className="text-xs text-gray-500 mt-1">
              List specific data points, polling rates, or any technical requirements
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Configuration Notes (Optional)
            </label>
            <Textarea
              rows={2}
              value={formData.configNotes}
              onChange={(e) => setFormData({ ...formData, configNotes: e.target.value })}
              placeholder="Any additional notes or special considerations..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/collaboration')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Submit Request to IT
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
