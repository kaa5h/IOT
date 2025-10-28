# IoT Connect - Industrial Machine Connection Interface

A unified web application for managing industrial IoT machine connections without manual coding. Built for Operational Technology (OT) and Information Technology (IT) teams to collaborate seamlessly.

## Overview

This prototype demonstrates how to eliminate fragmented workflows in industrial machine configuration by providing a single, unified interface that serves both OT users (who understand machines) and IT users (who understand code).

### Key Problems Solved
- ❌ No more switching between UI, Git, Excel, VS Code, and deployment pipelines
- ❌ No more manual copy-paste of machine parameters
- ❌ No more 20-30 minute deployment cycles breaking workflow
- ❌ No more OT users struggling with YAML and Git
- ❌ No more missing machine documentation
- ✅ Single source of truth for all machine configurations

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173

# Build for production
npm run build
```

## Features

### Complete CRUD Operations
- ✅ **Create:** 5-step wizard with protocol selection and device browsing
- ✅ **Read:** Dashboard, list view, and detailed machine pages
- ✅ **Update:** Full edit capability for all machine parameters
- ✅ **Delete:** Safe deletion with confirmation

### Multi-Protocol Support
- OPC UA (with security modes)
- Siemens S7 (rack/slot configuration)
- Modbus TCP (IP/port/unit ID)
- MQTT (broker/topics)
- Custom protocols

### User-Friendly Features
- 🎯 Visual wizard (no coding required)
- 🔍 Device browsing (auto-discovery simulation)
- 📋 Template library (6 pre-built templates)
- 🤖 AI assistant (contextual help)
- 📊 Real-time status monitoring
- 🚀 Deployment progress tracking
- 🔄 Git sync status indicators

### IT/OT Collaboration
See [FEATURES.md](./FEATURES.md) for detailed explanation of how this improves IT/OT communication.

## User Flows

### 1. Add New Machine (OT User - Primary Flow)
1. Click "Add New Machine" on dashboard
2. Fill basic info (name, type, location)
3. Select protocol (e.g., OPC UA)
4. Enter connection parameters
5. Browse device or manually add data points
6. Review and test connection
7. Deploy → watch progress → done!

### 2. Edit Existing Machine
1. Click any machine card on dashboard
2. View complete details
3. Click "Edit" button
4. Modify any parameters
5. Add/remove data points
6. Save changes

### 3. Use Template (Quick Start)
1. Go to Templates page
2. Browse available templates
3. Click "Use Template"
4. Wizard opens with pre-filled data
5. Adjust IP/name as needed
6. Deploy

### 4. Troubleshoot Machine
1. Open machine detail page
2. Check status and last updated time
3. Click "Test Connection"
4. View connection parameters
5. Edit if needed
6. Toggle Connect/Disconnect

### 5. Delete Machine
1. Open machine detail page
2. Click "Delete" button
3. Confirm deletion
4. Machine removed from system

## Architecture

### Tech Stack
- **React 18** with TypeScript for type safety
- **React Router** for navigation
- **Zustand** for state management
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Vite** for fast development

### Project Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # App layout (sidebar, topbar)
│   └── modals/          # Modal dialogs
├── pages/
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Machines.tsx         # Machine list view
│   ├── MachineDetail.tsx    # Machine detail & actions
│   ├── EditMachine.tsx      # Edit machine form
│   ├── Templates.tsx        # Template library
│   └── wizard/              # 5-step wizard components
├── store/
│   └── useStore.ts      # Zustand state management
├── types/
│   └── index.ts         # TypeScript interfaces
├── data/
│   └── mockData.ts      # 10 pre-populated machines
└── lib/
    └── utils.ts         # Utility functions
```

### State Management
All CRUD operations update the Zustand store:
- `addMachine()` - Create new machine
- `updateMachine()` - Update existing machine
- `deleteMachine()` - Remove machine
- `machines` - Array of all machines
- `templates` - Array of templates

## Mock Data

The app comes with:
- **10 pre-populated machines** with various statuses
- **6 templates** for common use cases
- Simulated deployment (25 seconds vs real 20-30 minutes)
- Simulated device browsing with tree structure
- Simulated connection testing (80% success rate)

## Key Components

### AddMachineWizard
Complete 5-step wizard with:
- Step 1: Basic Information
- Step 2: Protocol Selection
- Step 3: Connection Parameters (dynamic forms)
- Step 4: Data Points Configuration
- Step 5: Review & Deploy

### MachineDetail
Comprehensive machine view with:
- Real-time status
- Connection details
- Data points table
- Action buttons (Edit, Delete, Test, Connect/Disconnect)

### EditMachine
Full edit interface with:
- All basic information editable
- Data points inline editing
- Add/remove data points
- Validation before save

### DeploymentModal
Live deployment tracking with:
- 6 stages with progress indicators
- Real-time log output
- Progress bar
- Success animation

## Design System

### Colors
- **Primary:** #2563EB (Blue) - Actions, links
- **Success:** #10B981 (Green) - Connected, success
- **Warning:** #F59E0B (Amber) - Warnings, syncing
- **Error:** #EF4444 (Red) - Errors, disconnected
- **Info:** #3B82F6 (Light Blue) - In progress

### Typography
- Headings: Inter, semi-bold
- Body: Inter, regular
- Code: Monospace

## Future Enhancements

Ready for:
- Backend API integration
- Real Git repository connection
- Actual protocol implementations
- WebSocket for real-time updates
- User authentication
- Multi-tenancy
- Audit logging
- File import (CSV/Excel parsing)
- Bulk operations

## License

MIT
