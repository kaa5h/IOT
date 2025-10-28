import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Rocket } from 'lucide-react';

export const Deployments: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
        <p className="text-gray-600 mt-1">View deployment history and status</p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
          <p className="text-gray-600">
            Deployment history will appear here once you start deploying machines
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
