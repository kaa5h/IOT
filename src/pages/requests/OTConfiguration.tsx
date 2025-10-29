import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ExcelGridEditor } from '../../components/ExcelGridEditor';
import { getColumnsForProtocol, createEmptyRow, type OTConfig } from '../../lib/protocolColumns';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { generateId } from '../../lib/utils';
import { generateSCFWithLLM } from '../../lib/llmService';
import type { DataPoint } from '../../types';

export const OTConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { dataPointRequests, updateRequest } = useStore();

  const request = dataPointRequests.find((r) => r.id === id);
  const [configRows, setConfigRows] = useState<OTConfig[]>(() => {
    // Initialize with one empty row
    if (request) {
      return [createEmptyRow(request.protocol, generateId('config'))];
    }
    return [];
  });
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const columns = getColumnsForProtocol(request.protocol);

  const handleAddRow = useCallback(() => {
    const newRow = createEmptyRow(request.protocol, generateId('config'));
    setConfigRows([...configRows, newRow]);
  }, [configRows, request.protocol]);

  // Convert OT config rows to DataPoint format for the request
  const convertConfigToDataPoints = (): DataPoint[] => {
    return configRows.map((config) => ({
      id: config.id,
      name: config.metricName || 'Unnamed',
      address: (config as any).nodeIds || (config as any).receivingAddress || String((config as any).address || ''),
      dataType: 'Float', // Could be extracted from config
      access: 'read' as const,
      pollingRate: (config as any).interval || (config as any).s7PollInterval || 1000,
    }));
  };

  const handleSendBackToIT = () => {
    setIsSending(true);
    setTimeout(() => {
      const dataPoints = convertConfigToDataPoints();
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
    if (configRows.length === 0) {
      alert('Please add at least one configuration row');
      return;
    }

    setIsGenerating(true);

    const dataPoints = convertConfigToDataPoints();

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
            <h1 className="text-3xl font-bold text-gray-900">OT Configuration - Excel Interface</h1>
            <p className="text-gray-600 mt-1">
              Configure machine parameters in an Excel-like spreadsheet
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

      {/* Excel Grid Editor */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {request.protocol.toUpperCase()} Configuration
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Edit configurations in the spreadsheet below. Supports copy-paste from Excel.
            </p>
          </div>

          <ExcelGridEditor
            columns={columns}
            rows={configRows}
            onRowsChange={setConfigRows}
            protocol={request.protocol}
            onAddRow={handleAddRow}
          />
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
                  <h3 className="font-semibold text-gray-900 mb-1">Send Back to IT</h3>
                  <p className="text-sm text-gray-600">
                    IT will generate the Service Commissioning File using LLM and deploy
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSendBackToIT}
                disabled={configRows.length === 0 || isSending || isGenerating}
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
                disabled={configRows.length === 0 || isSending || isGenerating}
                loading={isGenerating}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate & Request Review
              </Button>
            </div>
          </div>

          {configRows.length === 0 && (
            <p className="text-sm text-orange-600 mt-4 text-center">
              Please add at least one configuration row to proceed
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
