import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Database,
  FileText,
  BookOpen,
  Network,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  RefreshCw,
} from 'lucide-react';
import { generateId } from '../../lib/utils';
import type { LLMMessage, LLMEnhancement, TestResult, DataSource, DataSourceType } from '../../types';

const simulateLLMResponse = (
  _userMessage: string,
  draftYAML: string,
  dataSources: DataSource[]
): { content: string; yaml: string; improvements: string[]; sourcesUsed: DataSourceType[] } => {
  // Simulated LLM response
  const improvements = [
    'Added proper error handling for connection failures',
    'Optimized sampling intervals based on data criticality',
    'Added data validation rules for incoming values',
    'Included security configuration for encrypted connections',
    'Added metadata tags for better organization',
  ];

  const enhancedYAML = draftYAML.includes('# Enhanced by LLM')
    ? draftYAML
    : `# Enhanced by LLM\n${draftYAML}\n  # Added security and validation\n  security:\n    enabled: true\n    mode: SignAndEncrypt\n  validation:\n    enabled: true\n    rules:\n      - type: range\n        min: 0\n        max: 100\n`;

  return {
    content: `I've analyzed your SCF draft and the available data sources. Here are the key improvements I've made:\n\n${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}\n\nThe enhanced configuration includes proper security settings, optimized sampling rates, and validation rules. Would you like me to explain any specific changes or make further adjustments?`,
    yaml: enhancedYAML,
    improvements,
    sourcesUsed: dataSources.slice(0, 3).map((ds) => ds.type),
  };
};

export const LLMEnhancementPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { otRequests, updateOTRequest, addNotification } = useStore();

  const request = otRequests.find((r) => r.id === id);

  const [chatHistory, setChatHistory] = useState<LLMMessage[]>(
    request?.llmEnhancement?.chatHistory || []
  );
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedYAML, setEnhancedYAML] = useState(
    request?.llmEnhancement?.enhancedYAML || request?.itDraft?.yaml || ''
  );
  const [improvements, setImprovements] = useState<string[]>(
    request?.llmEnhancement?.improvements || []
  );
  const [testResults, setTestResults] = useState<TestResult[]>(
    request?.llmEnhancement?.testResults || []
  );

  const chatEndRef = useRef<HTMLDivElement>(null);

  const availableDataSources: DataSource[] = [
    {
      type: 'opcua_browse',
      name: 'OPC UA Device Browser',
      description: 'Browse connected OPC UA devices and their node structure',
      queried: true,
    },
    {
      type: 'scf_library',
      name: 'SCF Library',
      description: 'Previous Service Commissioning Files and configurations',
      queried: true,
    },
    {
      type: 'manifest',
      name: 'Manifest & Metadata',
      description: 'Device capabilities, protocol specifications, data types',
      queried: true,
    },
    {
      type: 'uns',
      name: 'Unified Namespace (UNS)',
      description: 'Global data structure and topic hierarchy',
      queried: true,
    },
    {
      type: 'documentation',
      name: 'Documentation',
      description: 'Configuration rules, best practices, protocol specs',
      queried: true,
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!request) {
    return (
      <div className="p-6">
        <p className="text-red-600">Request not found</p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!userInput.trim() || isProcessing) return;

    const userMessage: LLMMessage = {
      id: generateId('msg'),
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    // Simulate LLM processing delay
    setTimeout(() => {
      const response = simulateLLMResponse(userInput, enhancedYAML, availableDataSources);

      const assistantMessage: LLMMessage = {
        id: generateId('msg'),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        dataSourcesUsed: response.sourcesUsed,
      };

      setChatHistory((prev) => [...prev, assistantMessage]);
      setEnhancedYAML(response.yaml);
      setImprovements(response.improvements);
      setIsProcessing(false);
    }, 2000);
  };

  const handleRunTests = () => {
    // Simulate test execution
    const newTests: TestResult[] = [
      {
        id: generateId('test'),
        testType: 'syntax',
        status: 'passed',
        message: 'YAML syntax is valid',
        timestamp: new Date().toISOString(),
      },
      {
        id: generateId('test'),
        testType: 'connectivity',
        status: 'passed',
        message: 'Connection parameters are valid',
        timestamp: new Date().toISOString(),
      },
      {
        id: generateId('test'),
        testType: 'data_validation',
        status: 'warning',
        message: 'Some data points may have high sampling rates',
        timestamp: new Date().toISOString(),
      },
    ];

    setTestResults(newTests);
  };

  const handleAcceptEnhancement = () => {
    const enhancement: LLMEnhancement = {
      id: generateId('llm'),
      chatHistory,
      dataSources: availableDataSources,
      testResults,
      enhancedYAML,
      enhancedAt: new Date().toISOString(),
      improvements,
    };

    updateOTRequest(request.id, {
      llmEnhancement: enhancement,
      status: 'llm_enhanced',
    });

    addNotification({
      id: generateId('notif'),
      type: 'system_alert' as const,
      priority: 'medium' as const,
      title: 'LLM Enhancement Complete',
      message: `SCF enhanced for ${request.machineName}, ready for manual refinement`,
      timestamp: new Date().toISOString(),
      read: false,
      visibleTo: ['IT'] as const,
      actionUrl: `/collaboration/${request.id}/refine`,
      actionLabel: 'Refine Manually',
    });

    navigate(`/collaboration/${request.id}/refine`);
  };

  const handleRegenerate = () => {
    setChatHistory([]);
    setImprovements([]);
    setTestResults([]);
    setEnhancedYAML(request?.itDraft?.yaml || '');
  };

  const getTestIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
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
              <Sparkles className="h-8 w-8 text-purple-600" />
              LLM Enhancement
            </h1>
            <p className="text-gray-600 mt-1">
              Collaborate with AI to enhance the SCF using multiple data sources
            </p>
          </div>
          <div>
            <Badge className="bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              {request.machineName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Data Sources */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Data Sources
              </h3>
              <div className="space-y-2">
                {availableDataSources.map((source) => (
                  <div
                    key={source.type}
                    className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {source.type === 'opcua_browse' && <Network className="h-4 w-4 text-blue-600" />}
                          {source.type === 'scf_library' && <FileText className="h-4 w-4 text-green-600" />}
                          {source.type === 'manifest' && <BookOpen className="h-4 w-4 text-purple-600" />}
                          {source.type === 'uns' && <Network className="h-4 w-4 text-orange-600" />}
                          {source.type === 'documentation' && <BookOpen className="h-4 w-4 text-gray-600" />}
                          <span className="text-xs font-medium text-gray-900">{source.name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                      </div>
                      {source.queried && (
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvements List */}
          {improvements.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Improvements Made</h3>
                <ul className="space-y-2">
                  {improvements.map((improvement, idx) => (
                    <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center - Chat Interface */}
        <div className="col-span-6 space-y-4">
          <div style={{ height: 'calc(100vh - 250px)' }}>
            <Card className="flex flex-col h-full">
              <CardContent className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Chat with LLM</h3>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Start a conversation to enhance your SCF</p>
                    <p className="text-xs mt-1">
                      Ask questions, request improvements, or explore data sources
                    </p>
                  </div>
                )}

                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.dataSourcesUsed && message.dataSourcesUsed.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs opacity-75">
                            Sources: {message.dataSourcesUsed.join(', ')}
                          </p>
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                        <span className="text-sm text-gray-600">LLM is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask LLM to improve the configuration..."
                  disabled={isProcessing}
                />
                <Button onClick={handleSendMessage} disabled={isProcessing || !userInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Enhanced YAML Preview */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Enhanced Configuration</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="yaml"
                  value={enhancedYAML}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Testing */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Testing</h3>
                <Button size="sm" onClick={handleRunTests}>
                  <Play className="h-3 w-3 mr-1" />
                  Run Tests
                </Button>
              </div>

              {testResults.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">
                  No tests run yet. Click "Run Tests" to validate the configuration.
                </p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((test) => (
                    <div
                      key={test.id}
                      className="p-2 border border-gray-200 rounded text-xs"
                    >
                      <div className="flex items-start gap-2">
                        {getTestIcon(test.status)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {test.testType.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-gray-600 mt-1">{test.message}</div>
                          <div className="text-gray-400 mt-1">
                            {new Date(test.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={handleAcceptEnhancement}
                disabled={chatHistory.length === 0}
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept & Continue
              </Button>
              <Button variant="outline" onClick={handleRegenerate} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/collaboration')}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
