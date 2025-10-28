import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { MachineType } from '../../types';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const machineTypes: Array<{ value: MachineType; label: string }> = [
  { value: 'PLC', label: 'PLC' },
  { value: 'Robot', label: 'Robot' },
  { value: 'Sensor', label: 'Sensor' },
  { value: 'HMI', label: 'HMI' },
  { value: 'CNC Machine', label: 'CNC Machine' },
  { value: 'Custom', label: 'Custom' },
];

export const Step1BasicInfo: React.FC<StepProps> = ({ onNext, onBack }) => {
  const { wizardData, updateWizardData } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!wizardData.name.trim()) {
      newErrors.name = 'Machine name is required';
    }
    if (!wizardData.type) {
      newErrors.type = 'Machine type is required';
    }
    if (!wizardData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">
          Enter the basic details about your machine
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Machine Name"
          placeholder="e.g., Assembly Line Robot 1"
          value={wizardData.name}
          onChange={(e) => updateWizardData({ name: e.target.value })}
          error={errors.name}
          required
        />

        <Select
          label="Machine Type"
          options={[
            { value: '', label: 'Select a type...' },
            ...machineTypes.map(t => ({ value: t.value, label: t.label })),
          ]}
          value={wizardData.type}
          onChange={(e) => updateWizardData({ type: e.target.value as MachineType })}
          error={errors.type}
          required
        />

        <Input
          label="Location/Area"
          placeholder="e.g., Production Floor A"
          value={wizardData.location}
          onChange={(e) => updateWizardData({ location: e.target.value })}
          error={errors.location}
          required
        />

        <Textarea
          label="Description"
          placeholder="Optional description of the machine..."
          value={wizardData.description}
          onChange={(e) => updateWizardData({ description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
