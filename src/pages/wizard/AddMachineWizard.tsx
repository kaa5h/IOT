import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Protocol } from './Step2Protocol';
import { Step3Connection } from './Step3Connection';
import { Step4DataPoints } from './Step4DataPoints';
import { Step5Review } from './Step5Review';

const steps = [
  { number: 1, title: 'Basic Info', component: Step1BasicInfo },
  { number: 2, title: 'Protocol', component: Step2Protocol },
  { number: 3, title: 'Connection', component: Step3Connection },
  { number: 4, title: 'Data Points', component: Step4DataPoints },
  { number: 5, title: 'Review', component: Step5Review },
];

export const AddMachineWizard: React.FC = () => {
  const navigate = useNavigate();
  const { wizardData, setWizardStep, resetWizard } = useStore();
  const currentStep = wizardData.currentStep;

  useEffect(() => {
    // Reset wizard when component mounts
    return () => {
      // Keep wizard data for now, only reset on explicit cancel
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setWizardStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setWizardStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    resetWizard();
    navigate('/');
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Add New Machine</h1>
        <p className="text-gray-600 mt-1">
          Configure a new industrial machine connection
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${
                      index <= currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step.number}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 rounded ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <div className="p-8">
          <CurrentStepComponent onNext={handleNext} onBack={handleBack} />
        </div>
      </Card>
    </div>
  );
};
