import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const tabs = [
  { id: 'preferences', label: 'User Preferences' },
  { id: 'git', label: 'Git Repository' },
  { id: 'pipeline', label: 'Pipeline Configuration' },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preferences');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your application preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <Select
                  label="Default Protocol"
                  options={[
                    { value: '', label: 'None' },
                    { value: 'opcua', label: 'OPC UA' },
                    { value: 's7', label: 'Siemens S7' },
                    { value: 'modbus', label: 'Modbus TCP' },
                    { value: 'mqtt', label: 'MQTT' },
                  ]}
                  value=""
                />

                <Input
                  label="Default Polling Rate (ms)"
                  type="number"
                  placeholder="1000"
                  defaultValue="1000"
                />

                <Select
                  label="Language"
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'de', label: 'German' },
                    { value: 'es', label: 'Spanish' },
                  ]}
                  value="en"
                />

                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'git' && (
          <Card>
            <CardHeader>
              <CardTitle>Git Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <Input
                  label="Repository URL"
                  value="https://github.com/company/iot-configs.git"
                  disabled
                />

                <Input
                  label="Branch Name"
                  value="main"
                  disabled
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto-sync enabled</p>
                    <p className="text-sm text-gray-600">Automatically commit changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <Select
                  label="Sync Frequency"
                  options={[
                    { value: 'realtime', label: 'Real-time' },
                    { value: '5min', label: 'Every 5 minutes' },
                    { value: '15min', label: 'Every 15 minutes' },
                    { value: 'manual', label: 'Manual' },
                  ]}
                  value="realtime"
                />

                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'pipeline' && (
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <Input
                  label="Deployment Timeout (minutes)"
                  type="number"
                  placeholder="30"
                  defaultValue="30"
                />

                <Input
                  label="Retry Attempts on Failure"
                  type="number"
                  placeholder="3"
                  defaultValue="3"
                />

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Enable parallel deployments</p>
                    <p className="text-sm text-gray-600">Deploy multiple machines simultaneously</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Email notifications</p>
                    <p className="text-sm text-gray-600">Receive deployment status updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
