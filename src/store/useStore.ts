import { create } from 'zustand';
import type {
  Machine,
  Template,
  Deployment,
  WizardFormData,
  GitSyncStatus,
  AIMessage,
  DataPointRequest,
  UserRole,
  Notification,
} from '../types';
import { mockMachines, mockTemplates } from '../data/mockData';

interface StoreState {
  // Data
  machines: Machine[];
  templates: Template[];
  deployments: Deployment[];

  // Wizard state
  wizardData: WizardFormData;

  // UI state
  gitSyncStatus: GitSyncStatus;
  aiChatHistory: AIMessage[];
  isAiPanelOpen: boolean;
  currentDeployment: Deployment | null;

  // IT/OT Collaboration
  currentUserRole: UserRole;
  dataPointRequests: DataPointRequest[];

  // Notifications
  notifications: Notification[];
  isNotificationPanelOpen: boolean;

  // Actions
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;

  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<WizardFormData>) => void;
  resetWizard: () => void;

  setGitSyncStatus: (status: GitSyncStatus) => void;

  addAIMessage: (message: AIMessage) => void;
  clearAIHistory: () => void;
  toggleAIPanel: () => void;

  setCurrentDeployment: (deployment: Deployment | null) => void;
  updateDeployment: (id: string, updates: Partial<Deployment>) => void;

  // IT/OT Collaboration Actions
  setUserRole: (role: UserRole) => void;
  createRequest: (request: DataPointRequest) => void;
  updateRequest: (id: string, updates: Partial<DataPointRequest>) => void;
  deleteRequest: (id: string) => void;

  // Notification Actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  toggleNotificationPanel: () => void;
}

const initialWizardData: WizardFormData = {
  name: '',
  type: '',
  location: '',
  description: '',
  protocolType: '',
  protocolConfig: {},
  dataPoints: [],
  currentStep: 0,
};

export const useStore = create<StoreState>((set) => ({
  // Initial data
  machines: mockMachines,
  templates: mockTemplates,
  deployments: [],

  // Initial wizard state
  wizardData: initialWizardData,

  // Initial UI state
  gitSyncStatus: 'synced',
  aiChatHistory: [],
  isAiPanelOpen: false,
  currentDeployment: null,

  // Initial IT/OT Collaboration state
  currentUserRole: 'IT', // Default to IT role
  dataPointRequests: [],

  // Initial Notification state
  notifications: [],
  isNotificationPanelOpen: false,

  // Machine actions
  addMachine: (machine) =>
    set((state) => ({
      machines: [...state.machines, machine],
    })),

  updateMachine: (id, updates) =>
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  deleteMachine: (id) =>
    set((state) => ({
      machines: state.machines.filter((m) => m.id !== id),
    })),

  // Wizard actions
  setWizardStep: (step) =>
    set((state) => ({
      wizardData: { ...state.wizardData, currentStep: step },
    })),

  updateWizardData: (data) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    })),

  resetWizard: () =>
    set(() => ({
      wizardData: initialWizardData,
    })),

  // Git sync actions
  setGitSyncStatus: (status) =>
    set(() => ({
      gitSyncStatus: status,
    })),

  // AI actions
  addAIMessage: (message) =>
    set((state) => ({
      aiChatHistory: [...state.aiChatHistory, message],
    })),

  clearAIHistory: () =>
    set(() => ({
      aiChatHistory: [],
    })),

  toggleAIPanel: () =>
    set((state) => ({
      isAiPanelOpen: !state.isAiPanelOpen,
    })),

  // Deployment actions
  setCurrentDeployment: (deployment) =>
    set(() => ({
      currentDeployment: deployment,
    })),

  updateDeployment: (id, updates) =>
    set((state) => ({
      currentDeployment:
        state.currentDeployment?.id === id
          ? { ...state.currentDeployment, ...updates }
          : state.currentDeployment,
      deployments: state.deployments.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  // IT/OT Collaboration actions
  setUserRole: (role) =>
    set(() => ({
      currentUserRole: role,
    })),

  createRequest: (request) =>
    set((state) => ({
      dataPointRequests: [...state.dataPointRequests, request],
    })),

  updateRequest: (id, updates) =>
    set((state) => ({
      dataPointRequests: state.dataPointRequests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  deleteRequest: (id) =>
    set((state) => ({
      dataPointRequests: state.dataPointRequests.filter((r) => r.id !== id),
    })),

  // Notification actions
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications], // New notifications at top
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () =>
    set(() => ({
      notifications: [],
    })),

  toggleNotificationPanel: () =>
    set((state) => ({
      isNotificationPanelOpen: !state.isNotificationPanelOpen,
    })),
}));
