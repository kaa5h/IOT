import React, { useEffect, useState } from 'react';
import { Modal, ModalBody } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { DeploymentLog, DeploymentStage } from '../../types';
import { sleep } from '../../lib/utils';

interface DeploymentModalProps {
  onComplete: () => void;
}

const stages: Array<{ stage: DeploymentStage; label: string }> = [
  { stage: 'validating', label: 'Validating Configuration' },
  { stage: 'generating', label: 'Generating Service Files' },
  { stage: 'committing', label: 'Committing to Git' },
  { stage: 'pipeline', label: 'Running Pipeline' },
  { stage: 'testing', label: 'Testing Connections' },
  { stage: 'complete', label: 'Deployment Complete' },
];

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ onComplete }) => {
  const { currentDeployment, updateDeployment, updateMachine } = useStore();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (!currentDeployment) return;

    const runDeployment = async () => {
      // Stage 1: Validating (5 seconds)
      await runStage(0, 'validating', 5000, [
        { message: `Starting deployment for '${currentDeployment.machineName}'`, type: 'info' },
        { message: 'Validating protocol configuration...', type: 'info' },
        { message: 'Checking connection parameters...', type: 'info' },
        { message: '✓ Configuration valid', type: 'success' },
      ]);

      // Stage 2: Generating (3 seconds)
      await runStage(1, 'generating', 3000, [
        { message: 'Generating service commissioning file...', type: 'info' },
        { message: 'Writing entries.yaml...', type: 'info' },
        { message: '✓ Service files generated', type: 'success' },
      ]);

      // Stage 3: Committing (2 seconds)
      await runStage(2, 'committing', 2000, [
        { message: 'Committing changes to git repository...', type: 'info' },
        { message: `Added: ${currentDeployment.machineName} configuration`, type: 'info' },
        { message: '✓ Changes committed', type: 'success' },
      ]);

      // Stage 4: Pipeline (10 seconds)
      await runStage(3, 'pipeline', 10000, [
        { message: 'Triggering deployment pipeline...', type: 'info' },
        { message: 'Building service container...', type: 'info' },
        { message: 'Running integration tests...', type: 'info' },
        { message: 'Deploying to runtime environment...', type: 'info' },
        { message: '✓ Pipeline completed successfully', type: 'success' },
      ]);

      // Stage 5: Testing (4 seconds)
      await runStage(4, 'testing', 4000, [
        { message: 'Establishing connection to device...', type: 'info' },
        { message: 'Testing data point reads...', type: 'info' },
        { message: 'Verifying polling rates...', type: 'info' },
        { message: '✓ All connection tests passed', type: 'success' },
      ]);

      // Stage 6: Complete
      setCurrentStageIndex(5);
      updateDeployment(currentDeployment.id, {
        stage: 'complete',
        progress: 100,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      updateMachine(currentDeployment.machineId, {
        status: 'connected',
        lastUpdated: new Date().toISOString(),
      });

      addLog('🎉 Deployment successful!', 'success');

      // Wait a bit before allowing close
      await sleep(1500);
    };

    runDeployment();
  }, []);

  const runStage = async (
    index: number,
    stage: DeploymentStage,
    duration: number,
    stageLogs: Array<{ message: string; type: 'info' | 'success' | 'warning' | 'error' }>
  ) => {
    setCurrentStageIndex(index);
    updateDeployment(currentDeployment!.id, {
      stage,
      progress: (index / stages.length) * 100,
    });

    const logDelay = duration / stageLogs.length;
    for (const log of stageLogs) {
      await sleep(logDelay);
      addLog(log.message, log.type);
    }
  };

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newLog: DeploymentLog = {
      timestamp: new Date().toISOString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const isComplete = currentStageIndex === 5;
  const estimatedTimeRemaining = isComplete ? 0 : (5 - currentStageIndex) * 4;

  return (
    <Modal
      isOpen={true}
      onClose={() => {}}
      title="Deploying Machine"
      showCloseButton={false}
      closeOnOverlayClick={false}
      size="xl"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <Progress
              value={(currentStageIndex / (stages.length - 1)) * 100}
              showLabel
              size="lg"
            />
            {!isComplete && (
              <p className="text-sm text-gray-600 mt-2">
                Estimated time remaining: ~{estimatedTimeRemaining} minutes
              </p>
            )}
          </div>

          {/* Stages */}
          <div className="space-y-3">
            {stages.map((stageInfo, index) => {
              const isCurrentOrPast = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isDone = index < currentStageIndex;

              return (
                <div
                  key={stageInfo.stage}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrent ? 'bg-blue-50' : isDone ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {isCurrent && <Loader2 className="h-5 w-5 text-info animate-spin" />}
                  {!isCurrentOrPast && <Circle className="h-5 w-5 text-gray-400" />}

                  <span
                    className={`text-sm font-medium ${
                      isCurrentOrPast ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {stageInfo.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Logs Section */}
          <div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-sm text-primary hover:underline mb-2"
            >
              {showLogs ? 'Hide' : 'Show'} deployment logs
            </button>

            {showLogs && (
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>{' '}
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-green-400'
                          : log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success State */}
          {isComplete && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Deployment Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                {currentDeployment?.machineName} is now connected and monitoring data
              </p>
              <Button onClick={onComplete} size="lg">
                View Machine
              </Button>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};
