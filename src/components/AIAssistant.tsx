import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Send, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { generateId, sleep } from '../lib/utils';

const suggestedPrompts = [
  'Generate template for OPC UA PLC',
  'What parameters do I need for Modbus?',
  'Help me troubleshoot connection error',
  'Create 10 similar machine configs',
];

export const AIAssistant: React.FC = () => {
  const { isAiPanelOpen, aiChatHistory, addAIMessage, toggleAIPanel } = useStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: generateId('msg'),
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString(),
    };

    addAIMessage(userMessage);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    await sleep(1500);

    let response = '';
    if (input.toLowerCase().includes('template')) {
      response = `I can help you generate a template! Here's a basic OPC UA PLC configuration:

\`\`\`yaml
protocol: opcua
endpoint: opc.tcp://192.168.1.1:4840
security_mode: Sign
security_policy: Basic256Sha256
data_points:
  - name: ProductionCount
    address: ns=2;s=PLC.Production.Count
    type: Int32
\`\`\`

Would you like me to customize this further?`;
    } else if (input.toLowerCase().includes('modbus')) {
      response = `For Modbus TCP connections, you'll need these parameters:

1. **IP Address**: The device's network address (e.g., 192.168.1.100)
2. **Port**: Usually 502 (default Modbus TCP port)
3. **Unit/Slave ID**: Device identifier (typically 1)
4. **Register Addresses**: Starting addresses for reading data (e.g., 40001 for holding registers)

Would you like help configuring a specific Modbus device?`;
    } else if (input.toLowerCase().includes('troubleshoot')) {
      response = `Here are common troubleshooting steps for connection issues:

1. **Check Network Connectivity**: Ping the device IP address
2. **Verify Port Access**: Ensure firewall allows the protocol port
3. **Validate Credentials**: Check username/password if required
4. **Review Security Settings**: Match security mode and policy
5. **Check Device Status**: Ensure the device is powered and ready

What error message are you seeing?`;
    } else {
      response = `I'm here to help with your industrial IoT configurations! I can assist with:

- Generating machine configuration templates
- Explaining protocol parameters
- Troubleshooting connection issues
- Creating bulk configurations
- Optimizing data point mappings

What would you like help with?`;
    }

    const aiMessage = {
      id: generateId('msg'),
      role: 'assistant' as const,
      content: response,
      timestamp: new Date().toISOString(),
    };

    addAIMessage(aiMessage);
    setIsLoading(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  if (!isAiPanelOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <button
          onClick={toggleAIPanel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Suggested Prompts */}
      {aiChatHistory.length === 0 && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Suggested prompts:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiChatHistory.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] p-3 rounded-lg',
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Warning Banner */}
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
        <p className="text-xs text-yellow-800">
          ⚠️ AI-generated content requires validation
        </p>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="md">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
