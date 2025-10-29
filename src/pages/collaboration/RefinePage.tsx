import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  GitCompare,
  Edit,
  Eye,
} from 'lucide-react';
import { generateId } from '../../lib/utils';

export const RefinePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { otRequests, updateOTRequest, addNotification } = useStore();

  const request = otRequests.find((r) => r.id === id);

  const [refinedYAML, setRefinedYAML] = useState(
    request?.refinedSCF || request?.llmEnhancement?.enhancedYAML || ''
  );
  const [refinementNotes, setRefinementNotes] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-red-600">Request not found</p>
      </div>
    );
  }

  const originalYAML = request?.llmEnhancement?.enhancedYAML || '';

  const handleSaveRefinement = () => {
    updateOTRequest(request.id, {
      refinedSCF: refinedYAML,
      status: 'it_refining',
    });

    addNotification({
      id: generateId('notif'),
      type: 'system_alert' as const,
      priority: 'low' as const,
      title: 'Refinement Saved',
      message: `Manual refinement saved for ${request.machineName}`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
    });
  };

  const handleMarkReady = () => {
    updateOTRequest(request.id, {
      refinedSCF: refinedYAML,
      refinedBy: 'IT User',
      refinedAt: new Date().toISOString(),
      status: 'ready_to_deploy',
    });

    addNotification({
      id: generateId('notif'),
      type: 'scf_approved' as const,
      priority: 'high' as const,
      title: 'SCF Ready for Deployment',
      message: `Configuration for ${request.machineName} is ready to deploy`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
      actionUrl: `/collaboration/${request.id}/deploy`,
      actionLabel: 'Configure Deployment',
    });

    navigate(`/collaboration/${request.id}/deploy`);
  };

  const getDiffStats = () => {
    const originalLines = originalYAML.split('\n').length;
    const refinedLines = refinedYAML.split('\n').length;
    const diff = refinedLines - originalLines;

    return {
      originalLines,
      refinedLines,
      diff: diff >= 0 ? `+${diff}` : `${diff}`,
      hasChanges: originalYAML !== refinedYAML,
    };
  };

  const stats = getDiffStats();

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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="h-8 w-8 text-orange-600" />
              Manual Refinement
            </h1>
            <p className="text-gray-600 mt-1">
              Review and refine the LLM-enhanced configuration
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800">
              {request.machineName}
            </Badge>
            {stats.hasChanges && (
              <Badge className="bg-blue-100 text-blue-800">
                <GitCompare className="h-3 w-3 mr-1" />
                {stats.diff} lines changed
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* LLM Improvements Summary */}
      {request.llmEnhancement?.improvements && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              LLM Improvements Applied
            </h3>
            <ul className="space-y-1">
              {request.llmEnhancement.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={showDiff ? 'outline' : 'primary'}
          size="sm"
          onClick={() => setShowDiff(false)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Split View
        </Button>
        <Button
          variant={showDiff ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowDiff(true)}
        >
          <GitCompare className="h-4 w-4 mr-2" />
          Diff View
        </Button>
      </div>

      {/* Editor Section */}
      {!showDiff ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Left: LLM Enhanced (Read-only) */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  LLM Enhanced Version
                </h3>
                <Badge>{stats.originalLines} lines</Badge>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Editor
                  height="600px"
                  defaultLanguage="yaml"
                  value={originalYAML}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Right: Refined Version (Editable) */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Your Refinements
                </h3>
                <Badge>{stats.refinedLines} lines</Badge>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Editor
                  height="600px"
                  defaultLanguage="yaml"
                  value={refinedYAML}
                  onChange={(value) => setRefinedYAML(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    formatOnType: true,
                    formatOnPaste: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Diff View */
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Changes from LLM Version
            </h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Editor
                height="600px"
                defaultLanguage="yaml"
                value={refinedYAML}
                onChange={(value) => setRefinedYAML(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Lines added or modified from the LLM version are shown here.
                You can continue editing in this view.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refinement Notes */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Refinement Notes</h3>
          <Textarea
            rows={4}
            value={refinementNotes}
            onChange={(e) => setRefinementNotes(e.target.value)}
            placeholder="Document your manual changes, reasoning, and any considerations for deployment..."
          />
          <p className="text-xs text-gray-500 mt-2">
            These notes will be saved with the configuration for future reference
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/collaboration')}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/collaboration/${request.id}/llm-enhance`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to LLM
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveRefinement}>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button onClick={handleMarkReady}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Ready to Deploy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
