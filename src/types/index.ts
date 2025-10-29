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

// IT/OT Collaboration Types - New Workflow
export type UserRole = 'IT' | 'OT';

// New workflow status flow
export type CollaborationStatus =
  | 'ot_data_provided'     // OT has sent operational data to IT
  | 'it_draft_created'     // IT has created initial SCF draft
  | 'llm_enhancing'        // LLM is enhancing the SCF
  | 'llm_enhanced'         // LLM has returned enhanced SCF to IT
  | 'it_refining'          // IT is manually refining the SCF
  | 'ready_to_deploy'      // SCF is finalized and ready
  | 'deploying'            // Deployment in progress
  | 'deployed'             // Successfully deployed
  | 'failed';              // Deployment or process failed

// Data sources that LLM can query
export type DataSourceType = 'opcua_browse' | 'scf_library' | 'manifest' | 'uns' | 'documentation';

export interface DataSource {
  type: DataSourceType;
  name: string;
  description: string;
  queried: boolean;
  queryTime?: string;
  results?: any;
}

// OT Request - OT provides operational data to IT
export interface OTRequest {
  id: string;
  requestType: 'new_machine' | 'update_config' | 'troubleshoot' | 'integration';
  machineName: string;
  machineType: MachineType;
  location: string;
  protocol: ProtocolType;

  // Operational data from OT
  operationalData: {
    description: string;
    currentIssue?: string;
    requirements: string;
    dataPoints?: DataPoint[];
    configNotes?: string;
  };

  // Metadata
  requestedBy: string;      // OT user
  requestedAt: string;

  // Workflow state
  status: CollaborationStatus;

  // IT Draft
  itDraft?: SCFDraft;

  // LLM Enhancement
  llmEnhancement?: LLMEnhancement;

  // Manual refinement
  refinedSCF?: string;       // YAML content after IT manual edit
  refinedBy?: string;
  refinedAt?: string;

  // Deployment
  deploymentMethod?: 'upload' | 'gitops';
  deploymentConfig?: DeploymentConfig;
  deployedAt?: string;
  deployedBy?: string;
}

// IT creates initial draft
export interface SCFDraft {
  id: string;
  yaml: string;              // Initial YAML draft
  createdBy: string;         // IT user
  createdAt: string;
  notes?: string;
}

// LLM Enhancement process
export interface LLMEnhancement {
  id: string;
  chatHistory: LLMMessage[];
  dataSources: DataSource[];
  testResults?: TestResult[];
  enhancedYAML: string;
  enhancedAt: string;
  improvements: string[];    // List of improvements made
}

export interface LLMMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  dataSourcesUsed?: DataSourceType[];
}

export interface TestResult {
  id: string;
  testType: 'syntax' | 'connectivity' | 'data_validation' | 'integration';
  status: 'passed' | 'failed' | 'warning';
  message: string;
  timestamp: string;
  details?: any;
}

// Deployment configuration
export interface DeploymentConfig {
  method: 'upload' | 'gitops';

  // For upload method
  uploadTarget?: 'admin_ui' | 'api';
  apiEndpoint?: string;

  // For GitOps method
  gitRepo?: string;
  gitBranch?: string;
  cicdPipeline?: 'ansible' | 'k8s_operator' | 'both';

  // Common
  environment?: 'dev' | 'staging' | 'prod';
  deploymentNotes?: string;
}

// Legacy types for backward compatibility (to be migrated)
export type RequestStatus =
  | 'pending_ot'
  | 'filled_by_ot'
  | 'generating_scf'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'deployed';

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

// Notification System
export type NotificationType =
  | 'request_created'       // IT created new request
  | 'request_filled'        // OT filled data points
  | 'scf_generated'         // SCF generated (by IT or OT)
  | 'review_pending'        // SCF awaiting peer review
  | 'scf_approved'          // IT approved SCF
  | 'scf_rejected'          // IT rejected SCF
  | 'deployment_success'    // Machine deployed successfully
  | 'deployment_failed'     // Deployment failed
  | 'machine_connected'     // Machine connected
  | 'machine_disconnected'  // Machine disconnected
  | 'machine_error'         // Machine error
  | 'validation_warning'    // Configuration validation warning
  | 'system_alert'          // System maintenance/updates
  | 'git_sync_issue';       // Git synchronization issue

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;

  // Related entities
  machineId?: string;
  machineName?: string;
  requestId?: string;
  deploymentId?: string;

  // Role-based visibility
  visibleTo: UserRole[];

  // Action
  actionUrl?: string;      // URL to navigate when clicked
  actionLabel?: string;    // Button label like "Review Now", "View Details"
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
