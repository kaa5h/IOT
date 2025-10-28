import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { Network, Cpu, Radio, Cloud, Settings } from 'lucide-react';
import type { ProtocolType } from '../../types';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const protocols = [
  {
    type: 'opcua' as ProtocolType,
    name: 'OPC UA',
    icon: Network,
    description: 'Unified architecture for industrial communication',
  },
  {
    type: 's7' as ProtocolType,
    name: 'Siemens S7',
    icon: Cpu,
    description: 'Communication protocol for Siemens PLCs',
  },
  {
    type: 'modbus' as ProtocolType,
    name: 'Modbus TCP',
    icon: Radio,
    description: 'Serial communication protocol for industrial devices',
  },
  {
    type: 'mqtt' as ProtocolType,
    name: 'MQTT',
    icon: Cloud,
    description: 'Lightweight messaging protocol for IoT',
  },
  {
    type: 'custom' as ProtocolType,
    name: 'Custom',
    icon: Settings,
    description: 'Define your own custom protocol',
  },
];

export const Step2Protocol: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { wizardData, updateWizardData } = useStore();
  const [error, setError] = useState('');

  const handleSelect = (type: ProtocolType) => {
    updateWizardData({ protocolType: type });
    setError('');
  };

  const handleNext = () => {
    if (!wizardData.protocolType) {
      setError('Please select a protocol');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Protocol</h2>
        <p className="text-gray-600">
          Choose the communication protocol for your machine
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {protocols.map((protocol) => {
          const Icon = protocol.icon;
          const isSelected = wizardData.protocolType === protocol.type;

          return (
            <button
              key={protocol.type}
              onClick={() => handleSelect(protocol.type)}
              className={cn(
                'p-6 border-2 rounded-lg text-left transition-all',
                'hover:border-primary hover:shadow-md',
                isSelected
                  ? 'border-primary bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'p-3 rounded-lg',
                    isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{protocol.name}</h3>
                  <p className="text-sm text-gray-600">{protocol.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
