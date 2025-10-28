import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import type { DataPoint, DataType, AccessType } from '../../types';
import { Plus, Trash2, Search } from 'lucide-react';
import { generateId } from '../../lib/utils';
import { DeviceBrowsingModal } from '../../components/modals/DeviceBrowsingModal';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step4DataPoints: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { wizardData, updateWizardData } = useStore();
  const [isDeviceBrowsingOpen, setIsDeviceBrowsingOpen] = useState(false);
  const dataPoints = wizardData.dataPoints || [];

  const addDataPoint = () => {
    const newPoint: DataPoint = {
      id: generateId('dp'),
      name: '',
      address: '',
      dataType: 'Float',
      access: 'read',
      pollingRate: 1000,
    };
    updateWizardData({ dataPoints: [...dataPoints, newPoint] });
  };

  const updateDataPoint = (id: string, updates: Partial<DataPoint>) => {
    const updated = dataPoints.map((dp) =>
      dp.id === id ? { ...dp, ...updates } : dp
    );
    updateWizardData({ dataPoints: updated });
  };

  const removeDataPoint = (id: string) => {
    updateWizardData({ dataPoints: dataPoints.filter((dp) => dp.id !== id) });
  };

  const handleDeviceNodesSelected = (nodes: any[]) => {
    const newPoints: DataPoint[] = nodes.map((node) => ({
      id: generateId('dp'),
      name: node.name,
      address: node.address,
      dataType: node.dataType,
      access: 'read',
      pollingRate: 1000,
    }));
    updateWizardData({ dataPoints: [...dataPoints, ...newPoints] });
    setIsDeviceBrowsingOpen(false);
  };

  // Add sample data points if empty
  React.useEffect(() => {
    if (dataPoints.length === 0) {
      const samplePoints: DataPoint[] = [
        {
          id: generateId('dp'),
          name: 'Temperature',
          address: 'ns=2;s=Device.Sensors.Temp',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          id: generateId('dp'),
          name: 'Pressure',
          address: 'ns=2;s=Device.Sensors.Press',
          dataType: 'Float',
          access: 'read',
          pollingRate: 1000,
        },
        {
          id: generateId('dp'),
          name: 'Status',
          address: 'ns=2;s=Device.Status',
          dataType: 'Boolean',
          access: 'read',
          pollingRate: 500,
        },
      ];
      updateWizardData({ dataPoints: samplePoints });
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Points Configuration</h2>
        <p className="text-gray-600">
          Define the data points to monitor from your machine
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addDataPoint}>
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeviceBrowsingOpen(true)}
        >
          <Search className="h-4 w-4 mr-1" />
          Browse Device
        </Button>
      </div>

      {/* Data Points Table */}
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
                        updateDataPoint(dp.id!, { pollingRate: parseInt(e.target.value) || 0 })
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
          No data points configured yet. Click "Add Row" or "Browse Device" to get started.
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={dataPoints.length === 0}>
          Next
        </Button>
      </div>

      {/* Device Browsing Modal */}
      <DeviceBrowsingModal
        isOpen={isDeviceBrowsingOpen}
        onClose={() => setIsDeviceBrowsingOpen(false)}
        onSelect={handleDeviceNodesSelected}
        endpoint={(wizardData.protocolConfig as any)?.endpointUrl || 'Device'}
      />
    </div>
  );
};
