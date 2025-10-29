import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Rocket,
  Upload,
  GitBranch,
  Server,
  AlertCircle,
} from 'lucide-react';
import { generateId } from '../../lib/utils';
import type { DeploymentConfig } from '../../types';

export const DeployPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { otRequests, updateOTRequest, addNotification } = useStore();

  const request = otRequests.find((r) => r.id === id);

  const [deploymentMethod, setDeploymentMethod] = useState<'upload' | 'gitops'>(
    request?.deploymentConfig?.method || 'upload'
  );
  const [uploadTarget, setUploadTarget] = useState<'admin_ui' | 'api'>(
    request?.deploymentConfig?.uploadTarget || 'admin_ui'
  );
  const [apiEndpoint, setApiEndpoint] = useState(
    request?.deploymentConfig?.apiEndpoint || 'https://api.example.com/v1/scf'
  );
  const [gitRepo, setGitRepo] = useState(
    request?.deploymentConfig?.gitRepo || 'https://github.com/org/repo.git'
  );
  const [gitBranch, setGitBranch] = useState(
    request?.deploymentConfig?.gitBranch || 'main'
  );
  const [cicdPipeline, setCicdPipeline] = useState<'ansible' | 'k8s_operator' | 'both'>(
    request?.deploymentConfig?.cicdPipeline || 'ansible'
  );
  const [environment, setEnvironment] = useState<'dev' | 'staging' | 'prod'>(
    request?.deploymentConfig?.environment || 'dev'
  );
  const [deploymentNotes, setDeploymentNotes] = useState(
    request?.deploymentConfig?.deploymentNotes || ''
  );

  const [isDeploying, setIsDeploying] = useState(false);

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-red-600">Request not found</p>
      </div>
    );
  }

  const finalYAML = request?.refinedSCF || request?.llmEnhancement?.enhancedYAML || '';

  const handleDeploy = async () => {
    setIsDeploying(true);

    const deploymentConfig: DeploymentConfig = {
      method: deploymentMethod,
      uploadTarget: deploymentMethod === 'upload' ? uploadTarget : undefined,
      apiEndpoint: deploymentMethod === 'upload' && uploadTarget === 'api' ? apiEndpoint : undefined,
      gitRepo: deploymentMethod === 'gitops' ? gitRepo : undefined,
      gitBranch: deploymentMethod === 'gitops' ? gitBranch : undefined,
      cicdPipeline: deploymentMethod === 'gitops' ? cicdPipeline : undefined,
      environment,
      deploymentNotes,
    };

    updateOTRequest(request.id, {
      deploymentConfig,
      deploymentMethod,
      status: 'deploying',
    });

    // Simulate deployment delay
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        updateOTRequest(request.id, {
          status: 'deployed',
          deployedBy: 'IT User',
          deployedAt: new Date().toISOString(),
        });

        // Notify both IT and OT
        addNotification({
          id: generateId('notif'),
          type: 'deployment_success' as const,
          priority: 'high' as const,
          title: 'Deployment Successful',
          message: `Configuration for ${request.machineName} has been deployed to ${environment}`,
          timestamp: new Date().toISOString(),
          read: false,
          visibleTo: ['IT', 'OT'] as const,
          requestId: request.id,
          machineName: request.machineName,
          actionUrl: `/collaboration/${request.id}`,
          actionLabel: 'View Details',
        });

        navigate(`/collaboration`);
      } else {
        updateOTRequest(request.id, {
          status: 'failed',
        });

        addNotification({
          id: generateId('notif'),
          type: 'deployment_failed' as const,
          priority: 'urgent' as const,
          title: 'Deployment Failed',
          message: `Deployment failed for ${request.machineName}. Check logs for details.`,
          timestamp: new Date().toISOString(),
          read: false,
          visibleTo: ['IT'] as const,
          requestId: request.id,
          machineName: request.machineName,
          actionUrl: `/collaboration/${request.id}/deploy`,
          actionLabel: 'Retry Deployment',
        });

        setIsDeploying(false);
      }
    }, 3000);
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

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Rocket className="h-8 w-8 text-green-600" />
              Deploy Configuration
            </h1>
            <p className="text-gray-600 mt-1">
              Configure and trigger deployment to target environment
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800">
            {request.machineName}
          </Badge>
        </div>
      </div>

      {/* Deployment Method Selection */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment Method</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDeploymentMethod('upload')}
              className={`p-4 border-2 rounded-lg transition-all ${
                deploymentMethod === 'upload'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Upload</h3>
              <p className="text-sm text-gray-600 mt-1">
                Direct upload to Admin UI or API
              </p>
            </button>

            <button
              onClick={() => setDeploymentMethod('gitops')}
              className={`p-4 border-2 rounded-lg transition-all ${
                deploymentMethod === 'gitops'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <GitBranch className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold text-gray-900">GitOps</h3>
              <p className="text-sm text-gray-600 mt-1">
                Commit to Git → CI/CD → Deploy
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Configuration */}
      {deploymentMethod === 'upload' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Configuration</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Target
              </label>
              <select
                value={uploadTarget}
                onChange={(e) => setUploadTarget(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin_ui">Admin UI</option>
                <option value="api">API Endpoint</option>
              </select>
            </div>

            {uploadTarget === 'api' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Endpoint URL
                </label>
                <Input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.example.com/v1/scf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The API endpoint that will receive the SCF configuration
                </p>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                {uploadTarget === 'admin_ui'
                  ? 'The configuration will be uploaded directly to the Admin UI for manual deployment.'
                  : 'The configuration will be sent to the specified API endpoint via POST request.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitOps Configuration */}
      {deploymentMethod === 'gitops' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">GitOps Configuration</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Git Repository
                </label>
                <Input
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  placeholder="https://github.com/org/repo.git"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <Input
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CI/CD Pipeline
              </label>
              <select
                value={cicdPipeline}
                onChange={(e) => setCicdPipeline(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ansible">Ansible</option>
                <option value="k8s_operator">Kubernetes Operator</option>
                <option value="both">Both (Ansible + K8s)</option>
              </select>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-purple-900">
                The SCF will be committed to the Git repository, triggering the CI/CD pipeline which
                will deploy using {cicdPipeline === 'both' ? 'Ansible and Kubernetes Operator' : cicdPipeline}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment & Notes */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Environment & Notes</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="prod">Production</option>
            </select>
            {environment === 'prod' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-900">
                  <strong>Warning:</strong> You are deploying to Production. Please review carefully.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deployment Notes (Optional)
            </label>
            <Textarea
              rows={3}
              value={deploymentNotes}
              onChange={(e) => setDeploymentNotes(e.target.value)}
              placeholder="Add any notes about this deployment..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Configuration Review */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Final Configuration Review</h2>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="yaml"
              value={finalYAML}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deployment Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment Summary</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Machine:</span>
              <span className="ml-2 font-medium text-gray-900">{request.machineName}</span>
            </div>
            <div>
              <span className="text-gray-600">Protocol:</span>
              <span className="ml-2 font-medium text-gray-900">{request.protocol.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-600">Method:</span>
              <span className="ml-2 font-medium text-gray-900">
                {deploymentMethod === 'upload' ? `Upload (${uploadTarget})` : `GitOps (${cicdPipeline})`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Environment:</span>
              <span className="ml-2 font-medium text-gray-900">{environment.toUpperCase()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/collaboration')}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/collaboration/${request.id}/refine`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Refinement
              </Button>
            </div>
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDeploying ? (
                <>
                  <Server className="h-4 w-4 mr-2 animate-pulse" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to {environment.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
