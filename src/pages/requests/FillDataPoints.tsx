import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { DataPoint, DataType, AccessType } from '../../types';
import { Plus, Trash2, Search, Send, Sparkles, ArrowLeft } from 'lucide-react';
import { generateId } from '../../lib/utils';
import { DeviceBrowsingModal } from '../../components/modals/DeviceBrowsingModal';
import { generateSCFWithLLM } from '../../lib/llmService';

export const FillDataPoints: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { dataPointRequests, updateRequest } = useStore();

  const request = dataPointRequests.find((r) => r.id === id);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>(request?.dataPoints || []);
  const [isDeviceBrowsingOpen, setIsDeviceBrowsingOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Request not found</p>
        <Button onClick={() => navigate('/requests')} className="mt-4">
          Back to Requests
        </Button>
      </div>
    );
  }

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

  const handleDeviceNodesSelected = (nodes: any[]) => {
    const newPoints: DataPoint[] = nodes.map((node) => ({
      id: generateId('dp'),
      name: node.name,
      address: node.address,
      dataType: node.dataType,
      access: 'read',
      pollingRate: 1000,
    }));
    setDataPoints([...dataPoints, ...newPoints]);
    setIsDeviceBrowsingOpen(false);
  };

  const handleSendBackToIT = () => {
    setIsSending(true);
    setTimeout(() => {
      updateRequest(request.id, {
        dataPoints,
        status: 'filled_by_ot',
        route: 'it_review',
        filledBy: 'OT User',
        filledAt: new Date().toISOString(),
      });
      setIsSending(false);
      navigate('/requests');
    }, 500);
  };

  const handleGenerateSCFAndReview = async () => {
    if (dataPoints.length === 0) {
      alert('Please add at least one data point');
      return;
    }

    setIsGenerating(true);

    // Update status to generating
    updateRequest(request.id, {
      dataPoints,
      status: 'generating_scf',
      route: 'direct_deploy',
      filledBy: 'OT User',
      filledAt: new Date().toISOString(),
    });

    try {
      // Generate SCF using LLM
      const scf = await generateSCFWithLLM(
        request.machineName,
        request.machineType,
        request.location,
        request.protocol,
        dataPoints,
        'OT'
      );

      // Update request with SCF and set to pending review
      updateRequest(request.id, {
        scf,
        status: 'pending_review',
      });

      setIsGenerating(false);
      navigate('/requests');
    } catch (error) {
      console.error('Error generating SCF:', error);
      setIsGenerating(false);
      alert('Failed to generate SCF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/requests')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fill Data Points</h1>
            <p className="text-gray-600 mt-1">
              Configure data points for the requested machine
            </p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">Pending OT</Badge>
        </div>
      </div>

      {/* Request Details Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Machine Name:</span>
              <span className="ml-2 font-medium">{request.machineName}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2 font-medium">{request.machineType}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium">{request.location}</span>
            </div>
            <div>
              <span className="text-gray-600">Protocol:</span>
              <span className="ml-2 font-medium">{request.protocol.toUpperCase()}</span>
            </div>
          </div>
          {request.description && (
            <div className="mt-4 text-sm">
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-gray-900">{request.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Points Configuration */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Data Points Configuration</h2>
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
          </div>

          {/* Data Points Table */}
          {dataPoints.length > 0 ? (
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
                            onChange={(e) =>
                              updateDataPoint(dp.id!, { address: e.target.value })
                            }
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
          ) : (
            <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="mb-2">No data points configured yet</p>
              <p className="text-sm">Click "Add Row" or "Browse Device" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Workflow Route</h2>
          <p className="text-sm text-gray-600 mb-6">
            Select how you want to proceed with this request:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Route A: Send Back to IT */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <Send className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Send Back to IT
                  </h3>
                  <p className="text-sm text-gray-600">
                    IT will generate the Service Commissioning File using LLM and deploy
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSendBackToIT}
                disabled={dataPoints.length === 0 || isSending || isGenerating}
                loading={isSending}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send to IT
              </Button>
            </div>

            {/* Route B: Generate SCF and Request Review */}
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Generate SCF & Request Review
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generate SCF with LLM now, then IT will peer review before deployment
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateSCFAndReview}
                disabled={dataPoints.length === 0 || isSending || isGenerating}
                loading={isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate & Request Review
              </Button>
            </div>
          </div>

          {dataPoints.length === 0 && (
            <p className="text-sm text-orange-600 mt-4 text-center">
              Please add at least one data point to proceed
            </p>
          )}
        </CardContent>
      </Card>

      {/* Device Browsing Modal */}
      <DeviceBrowsingModal
        isOpen={isDeviceBrowsingOpen}
        onClose={() => setIsDeviceBrowsingOpen(false)}
        onSelect={handleDeviceNodesSelected}
        endpoint={`${request.machineName} (${request.protocol})`}
      />
    </div>
  );
};
