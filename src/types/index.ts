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

// IT/OT Collaboration Types
export type UserRole = 'IT' | 'OT';
export type RequestStatus =
  | 'pending_ot'        // IT created, waiting for OT to fill
  | 'filled_by_ot'      // OT filled, sent back to IT
  | 'generating_scf'    // LLM is generating SCF
  | 'pending_review'    // SCF generated, waiting for IT review (Route B)
  | 'approved'          // IT approved the SCF
  | 'rejected'          // IT rejected the SCF
  | 'deployed';         // Successfully deployed

export interface DataPointRequest {
  id: string;
  machineId?: string;
  machineName: string;
  machineType: MachineType;
  location: string;
  protocol: ProtocolType;
  description?: string;

  // Request metadata
  requestedBy: string;      // IT user who created request
  requestedAt: string;

  // Data points
  dataPoints: DataPoint[];
  filledBy?: string;        // OT user who filled
  filledAt?: string;

  // Workflow
  status: RequestStatus;
  route: 'it_review' | 'direct_deploy';  // Which route OT chose

  // SCF (Service Commissioning File)
  scf?: ServiceCommissioningFile;

  // Review (for Route B)
  reviewedBy?: string;      // IT user who reviewed
  reviewedAt?: string;
  reviewComments?: string;
}

export interface ServiceCommissioningFile {
  id: string;
  yaml: string;
  generatedAt: string;
  generatedBy: 'IT' | 'OT';
  protocol: ProtocolType;
  machineInfo: {
    name: string;
    type: MachineType;
    location: string;
  };
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

  // IT/OT Collaboration
  currentUserRole: UserRole;
  dataPointRequests: DataPointRequest[];
}
