import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2 } from 'lucide-react';
import type { Machine, Deployment } from '../../types';
import { generateId, sleep } from '../../lib/utils';
import { DeploymentModal } from '../../components/modals/DeploymentModal';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step5Review: React.FC<StepProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { wizardData, addMachine, setCurrentDeployment, resetWizard } = useStore();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate connection test
    await sleep(2000);

    // 80% success rate
    const success = Math.random() > 0.2;
    setTestResult(success ? 'success' : 'error');
    setIsTesting(false);
  };

  const handleDeploy = async () => {
    // Create machine
    const newMachine: Machine = {
      id: generateId('m'),
      name: wizardData.name,
      type: wizardData.type as any,
      location: wizardData.location,
      description: wizardData.description,
      protocol: {
        type: wizardData.protocolType as any,
        config: wizardData.protocolConfig,
      },
      status: 'deploying',
      dataPoints: wizardData.dataPoints,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    addMachine(newMachine);

    // Create deployment
    const deployment: Deployment = {
      id: generateId('deploy'),
      machineId: newMachine.id,
      machineName: newMachine.name,
      stage: 'validating',
      progress: 0,
      logs: [],
      startedAt: new Date().toISOString(),
      status: 'in_progress',
    };

    setCurrentDeployment(deployment);
    setIsDeploying(true);
  };

  const handleDeploymentComplete = () => {
    resetWizard();
    navigate('/');
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review & Deploy</h2>
          <p className="text-gray-600">
            Review your configuration before deploying
          </p>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Machine Name</dt>
                <dd className="font-medium text-gray-900">{wizardData.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Type</dt>
                <dd className="font-medium text-gray-900">{wizardData.type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Location</dt>
                <dd className="font-medium text-gray-900">{wizardData.location}</dd>
              </div>
              {wizardData.description && (
                <div className="col-span-2">
                  <dt className="text-sm text-gray-600">Description</dt>
                  <dd className="font-medium text-gray-900">{wizardData.description}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Protocol Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Protocol Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Badge variant="protocol" protocol={wizardData.protocolType as any}>
                {wizardData.protocolType?.toUpperCase()}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {Object.entries(wizardData.protocolConfig).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="font-medium text-gray-900 font-mono text-sm">
                    {key.toLowerCase().includes('password') ? '••••••••' : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Data Points */}
        <Card>
          <CardHeader>
            <CardTitle>Data Points ({wizardData.dataPoints.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {wizardData.dataPoints.map((dp, index) => (
                <div
                  key={dp.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{dp.name}</p>
                    <p className="text-sm text-gray-600 font-mono">{dp.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{dp.dataType}</p>
                    <p className="text-xs text-gray-500">{dp.access}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-4 rounded-lg border ${
              testResult === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testResult === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Connection successful! (latency: 45ms)</span>
              </div>
            ) : (
              <span>Failed to connect: Connection timeout after 5 seconds</span>
            )}
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              loading={isTesting}
            >
              Test Connection
            </Button>
            <Button onClick={handleDeploy}>
              Deploy
            </Button>
          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {isDeploying && (
        <DeploymentModal onComplete={handleDeploymentComplete} />
      )}
    </>
  );
};
