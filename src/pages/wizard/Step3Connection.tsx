import React from 'react';
import { useStore } from '../../store/useStore';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export const Step3Connection: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { wizardData, updateWizardData } = useStore();
  const protocolConfig = wizardData.protocolConfig as any;

  const updateConfig = (updates: any) => {
    updateWizardData({
      protocolConfig: { ...protocolConfig, ...updates },
    });
  };

  const renderOpcUaForm = () => (
    <div className="space-y-4">
      <Input
        label="Endpoint URL"
        placeholder="opc.tcp://192.168.1.100:4840"
        value={protocolConfig.endpointUrl || ''}
        onChange={(e) => updateConfig({ endpointUrl: e.target.value })}
        required
      />

      <Select
        label="Security Mode"
        options={[
          { value: 'None', label: 'None' },
          { value: 'Sign', label: 'Sign' },
          { value: 'SignAndEncrypt', label: 'Sign and Encrypt' },
        ]}
        value={protocolConfig.securityMode || 'None'}
        onChange={(e) => updateConfig({ securityMode: e.target.value })}
        required
      />

      <Select
        label="Security Policy"
        options={[
          { value: 'None', label: 'None' },
          { value: 'Basic256Sha256', label: 'Basic256Sha256' },
          { value: 'Aes128_Sha256_RsaOaep', label: 'Aes128_Sha256_RsaOaep' },
          { value: 'Aes256_Sha256_RsaPss', label: 'Aes256_Sha256_RsaPss' },
        ]}
        value={protocolConfig.securityPolicy || 'None'}
        onChange={(e) => updateConfig({ securityPolicy: e.target.value })}
        required
      />

      <Input
        label="Username"
        placeholder="Optional"
        value={protocolConfig.username || ''}
        onChange={(e) => updateConfig({ username: e.target.value })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Optional"
        value={protocolConfig.password || ''}
        onChange={(e) => updateConfig({ password: e.target.value })}
      />
    </div>
  );

  const renderS7Form = () => (
    <div className="space-y-4">
      <Input
        label="IP Address"
        placeholder="192.168.1.100"
        value={protocolConfig.ipAddress || ''}
        onChange={(e) => updateConfig({ ipAddress: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Rack Number"
          type="number"
          placeholder="0"
          value={protocolConfig.rack || '0'}
          onChange={(e) => updateConfig({ rack: parseInt(e.target.value) || 0 })}
          required
        />

        <Input
          label="Slot Number"
          type="number"
          placeholder="1"
          value={protocolConfig.slot || '1'}
          onChange={(e) => updateConfig({ slot: parseInt(e.target.value) || 1 })}
          required
        />
      </div>
    </div>
  );

  const renderModbusForm = () => (
    <div className="space-y-4">
      <Input
        label="IP Address"
        placeholder="192.168.1.100"
        value={protocolConfig.ipAddress || ''}
        onChange={(e) => updateConfig({ ipAddress: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Port"
          type="number"
          placeholder="502"
          value={protocolConfig.port || '502'}
          onChange={(e) => updateConfig({ port: parseInt(e.target.value) || 502 })}
          required
        />

        <Input
          label="Unit/Slave ID"
          type="number"
          placeholder="1"
          value={protocolConfig.unitId || '1'}
          onChange={(e) => updateConfig({ unitId: parseInt(e.target.value) || 1 })}
          required
        />
      </div>
    </div>
  );

  const renderMqttForm = () => (
    <div className="space-y-4">
      <Input
        label="Broker Address"
        placeholder="192.168.1.100"
        value={protocolConfig.brokerAddress || ''}
        onChange={(e) => updateConfig({ brokerAddress: e.target.value })}
        required
      />

      <Input
        label="Port"
        type="number"
        placeholder="1883"
        value={protocolConfig.port || '1883'}
        onChange={(e) => updateConfig({ port: parseInt(e.target.value) || 1883 })}
        required
      />

      <Input
        label="Client ID"
        placeholder="Auto-generated"
        value={protocolConfig.clientId || `client-${Date.now()}`}
        onChange={(e) => updateConfig({ clientId: e.target.value })}
      />

      <Input
        label="Username"
        placeholder="Optional"
        value={protocolConfig.username || ''}
        onChange={(e) => updateConfig({ username: e.target.value })}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Optional"
        value={protocolConfig.password || ''}
        onChange={(e) => updateConfig({ password: e.target.value })}
      />
    </div>
  );

  const renderFormByProtocol = () => {
    switch (wizardData.protocolType) {
      case 'opcua':
        return renderOpcUaForm();
      case 's7':
        return renderS7Form();
      case 'modbus':
        return renderModbusForm();
      case 'mqtt':
        return renderMqttForm();
      default:
        return <p className="text-gray-600">Please select a protocol first.</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connection Parameters</h2>
        <p className="text-gray-600">
          Configure the connection settings for {wizardData.protocolType?.toUpperCase()}
        </p>
      </div>

      {renderFormByProtocol()}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
