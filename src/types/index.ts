export type MachineType = 'PLC' | 'Robot' | 'Sensor' | 'HMI' | 'CNC Machine' | 'Custom';
export type MachineStatus = 'connected' | 'disconnected' | 'deploying' | 'error' | 'draft';
export type ProtocolType = 'opcua' | 's7' | 'modbus' | 'mqtt' | 'custom';
export type DataType = 'Float' | 'Int32' | 'Boolean' | 'String' | 'UInt16' | 'UInt32';
export type AccessType = 'read' | 'write' | 'readwrite';
export type GitSyncStatus = 'synced' | 'syncing' | 'conflict';
export type DeploymentStage = 'validating' | 'generating' | 'committing' | 'pipeline' | 'testing' | 'complete';

export interface DataPoint {
  id?: string;
  name: string;
  address: string;
  dataType: DataType;
  access: AccessType;
  pollingRate?: number;
}

export interface OpcUaConfig {
  endpointUrl: string;
  securityMode: 'None' | 'Sign' | 'SignAndEncrypt';
  securityPolicy: 'None' | 'Basic256Sha256' | 'Aes128_Sha256_RsaOaep' | 'Aes256_Sha256_RsaPss';
  username?: string;
  password?: string;
}

export interface S7Config {
  ipAddress: string;
  rack: number;
  slot: number;
}

export interface ModbusConfig {
  ipAddress: string;
  port: number;
  unitId: number;
}

export interface MqttConfig {
  brokerAddress: string;
  port: number;
  username?: string;
  password?: string;
  clientId: string;
}

export type ProtocolConfig = OpcUaConfig | S7Config | ModbusConfig | MqttConfig | Record<string, any>;

export interface Protocol {
  type: ProtocolType;
  config: ProtocolConfig;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  location: string;
  description?: string;
  protocol: Protocol;
  status: MachineStatus;
  dataPoints: DataPoint[];
  lastUpdated: string;
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  protocol: ProtocolType;
  tags: string[];
  icon?: string;
  machineType: MachineType;
  config: Partial<Machine>;
}

export interface DeploymentLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Deployment {
  id: string;
  machineId: string;
  machineName: string;
  stage: DeploymentStage;
  progress: number;
  logs: DeploymentLog[];
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'failed';
}

export interface WizardFormData {
  // Step 1: Basic Info
  name: string;
  type: MachineType | '';
  location: string;
  description: string;

  // Step 2: Protocol
  protocolType: ProtocolType | '';

  // Step 3: Connection Parameters
  protocolConfig: Partial<ProtocolConfig>;

  // Step 4: Data Points
  dataPoints: DataPoint[];

  // Current step
  currentStep: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  config?: Partial<Machine>;
}

export interface DeviceNode {
  id: string;
  name: string;
  address: string;
  dataType: DataType;
  isFolder: boolean;
  children?: DeviceNode[];
  selected?: boolean;
}

export interface AppState {
  machines: Machine[];
  templates: Template[];
  deployments: Deployment[];
  wizardData: WizardFormData;
  gitSyncStatus: GitSyncStatus;
  aiChatHistory: AIMessage[];
  isAiPanelOpen: boolean;
  currentDeployment: Deployment | null;
}
