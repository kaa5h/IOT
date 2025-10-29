import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Save, Sparkles, FileText } from 'lucide-react';
import { generateId } from '../../lib/utils';
import type { SCFDraft } from '../../types';

const scfTemplates = [
  {
    id: 'opcua_basic',
    name: 'OPC UA Basic',
    yaml: `# OPC UA Configuration Template
apiVersion: v1
kind: ServiceCommissioningFile
metadata:
  name: \${machineName}
  protocol: opcua
spec:
  connection:
    host: localhost
    port: 4840
    securityMode: None
  dataPoints:
    - name: temperature
      nodeId: ns=2;s=Temperature
      samplingInterval: 1000
`,
  },
  {
    id: 'modbus_basic',
    name: 'Modbus TCP Basic',
    yaml: `# Modbus TCP Configuration Template
apiVersion: v1
kind: ServiceCommissioningFile
metadata:
  name: \${machineName}
  protocol: modbus
spec:
  connection:
    host: 192.168.1.100
    port: 502
    unitId: 1
  dataPoints:
    - name: holding_register_1
      functionCode: 3
      address: 0
      length: 1
      interval: 1000
`,
  },
  {
    id: 's7_basic',
    name: 'Siemens S7 Basic',
    yaml: `# Siemens S7 Configuration Template
apiVersion: v1
kind: ServiceCommissioningFile
metadata:
  name: \${machineName}
  protocol: s7
spec:
  connection:
    host: 192.168.1.50
    rack: 0
    slot: 1
  dataPoints:
    - name: db_value_1
      area: DB
      dbNumber: 1
      offset: 0
      dataType: INT
`,
  },
  {
    id: 'blank',
    name: 'Blank Template',
    yaml: `# Service Commissioning File
apiVersion: v1
kind: ServiceCommissioningFile
metadata:
  name: \${machineName}
  protocol: \${protocol}
spec:
  connection:
    # Add connection details
  dataPoints:
    # Add data points
`,
  },
];

export const ITDraftPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { otRequests, updateOTRequest, addNotification } = useStore();

  const request = otRequests.find((r) => r.id === id);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');
  const [yamlContent, setYamlContent] = useState<string>(() => {
    if (request?.itDraft?.yaml) {
      return request.itDraft.yaml;
    }
    const template = scfTemplates.find((t) => t.id === 'blank');
    return template?.yaml
      .replace('${machineName}', request?.machineName || 'machine-name')
      .replace('${protocol}', request?.protocol || 'opcua') || '';
  });
  const [draftNotes, setDraftNotes] = useState<string>(
    request?.itDraft?.notes || ''
  );

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-red-600">Request not found</p>
      </div>
    );
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = scfTemplates.find((t) => t.id === templateId);
    if (template) {
      setYamlContent(
        template.yaml
          .replace('${machineName}', request.machineName)
          .replace('${protocol}', request.protocol)
      );
    }
  };

  const handleSaveDraft = () => {
    const draft: SCFDraft = {
      id: request.itDraft?.id || generateId('draft'),
      yaml: yamlContent,
      notes: draftNotes,
      createdBy: 'IT User',
      createdAt: new Date().toISOString(),
    };

    updateOTRequest(request.id, {
      itDraft: draft,
    });

    addNotification({
      id: generateId('notif'),
      type: 'system_alert' as const,
      priority: 'low' as const,
      title: 'Draft Saved',
      message: `SCF draft saved for ${request.machineName}`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
    });
  };

  const handleSendToLLM = () => {
    const draft: SCFDraft = {
      id: request.itDraft?.id || generateId('draft'),
      yaml: yamlContent,
      notes: draftNotes,
      createdBy: 'IT User',
      createdAt: new Date().toISOString(),
    };

    updateOTRequest(request.id, {
      itDraft: draft,
      status: 'it_draft_created',
    });

    addNotification({
      id: generateId('notif'),
      type: 'system_alert' as const,
      priority: 'medium' as const,
      title: 'Draft Ready for Enhancement',
      message: `SCF draft created for ${request.machineName}, ready for LLM enhancement`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
      actionUrl: `/collaboration/${request.id}/llm-enhance`,
      actionLabel: 'Enhance with LLM',
    });

    navigate(`/collaboration/${request.id}/llm-enhance`);
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

        <h1 className="text-3xl font-bold text-gray-900">Create SCF Draft</h1>
        <p className="text-gray-600 mt-1">
          Review OT operational data and create initial Service Commissioning File draft
        </p>
      </div>

      {/* OT Request Details */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {request.machineName}
                <Badge>{request.requestType.replace('_', ' ')}</Badge>
              </h2>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Type: <span className="font-medium">{request.machineType}</span></span>
                <span>Location: <span className="font-medium">{request.location}</span></span>
                <span>Protocol: <span className="font-medium">{request.protocol.toUpperCase()}</span></span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600">{request.operationalData.description}</p>
            </div>

            {request.operationalData.currentIssue && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Current Issue</h3>
                <p className="text-sm text-gray-600">{request.operationalData.currentIssue}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Requirements</h3>
              <p className="text-sm text-gray-600">{request.operationalData.requirements}</p>
            </div>

            {request.operationalData.configNotes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Configuration Notes</h3>
                <p className="text-sm text-gray-600">{request.operationalData.configNotes}</p>
              </div>
            )}

            {request.operationalData.dataPoints && request.operationalData.dataPoints.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Data Points ({request.operationalData.dataPoints.length})
                </h3>
                <div className="text-xs text-gray-500">
                  OT provided {request.operationalData.dataPoints.length} data point configurations
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Draft Editor */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SCF Draft Editor
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Template:</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {scfTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              height="500px"
              defaultLanguage="yaml"
              value={yamlContent}
              onChange={(value) => setYamlContent(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Draft Notes (Optional)
            </label>
            <Textarea
              rows={3}
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              placeholder="Add any notes about this draft, considerations, or questions for the LLM..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/collaboration')}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSendToLLM}>
              <Sparkles className="h-4 w-4 mr-2" />
              Send to LLM for Enhancement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
