# New IT-OT Collaboration Workflow Implementation Plan

## Overview
This document outlines the complete implementation plan for the new machine-readable IT-OT collaboration workflow with LLM-enhanced SCF generation.

## Workflow Stages

### 1. OT Initiates Request (ot_data_provided)
**Actor**: OT User
**Page**: `/collaboration/ot-request`
**Action**: OT provides operational data and requirements to IT

**UI Components**:
- Request type selector (new_machine, update_config, troubleshoot, integration)
- Machine details form (name, type, location, protocol)
- Operational data section:
  - Description textarea
  - Current issue (optional)
  - Requirements textarea
  - Optional data points grid
  - Configuration notes
- Submit button → Creates OTRequest with status 'ot_data_provided'

**Notification**: IT receives notification "New OT request for {machineName}"

---

### 2. IT Creates SCF Draft (it_draft_created)
**Actor**: IT User
**Page**: `/collaboration/it-draft/{requestId}`
**Action**: IT reviews OT data and creates initial SCF draft

**UI Components**:
- Display OT request details (read-only)
- Show operational data provided by OT
- Code editor (Monaco Editor) for YAML draft
- Template selector (load from existing SCFs)
- Draft notes textarea
- Actions:
  - Save draft
  - Send to LLM for enhancement

**Notification**: System updates status, no notification yet

---

### 3. LLM Enhancement Interface (llm_enhancing → llm_enhanced)
**Actor**: IT User (supervising LLM)
**Page**: `/collaboration/llm-enhance/{requestId}`
**Action**: IT uses LLM chat interface to enhance SCF with multiple data sources

**UI Components**:

**Left Sidebar - Data Sources Panel**:
- OPC UA Browse
  - Device tree browser
  - Tag selector
  - Connection status
- SCF Library
  - List of previous SCFs
  - Search and filter
  - Click to reference
- Manifest
  - Metadata definitions
  - Version compatibility
- UNS (Unified Namespace)
  - Global data structure
  - Topic hierarchy
- Documentation
  - Configuration rules
  - Best practices
  - Protocol specs

**Main Area - Chat Interface**:
- Chat history (user ↔ assistant messages)
- Input box with "Send" button
- Show which data sources were queried per message
- Display LLM improvements list
- Show enhanced YAML in real-time

**Right Panel - Testing & Results**:
- Test buttons:
  - Syntax validation
  - Connectivity test
  - Data validation
  - Integration test
- Test results display
- Status indicators (passed/failed/warning)

**Actions**:
- Query data sources (LLM does automatically)
- Run tests
- Accept enhanced SCF → Move to manual refinement
- Regenerate with different prompt

**Notification**: None (interactive session)

---

### 4. Manual Refinement (it_refining → ready_to_deploy)
**Actor**: IT User
**Page**: `/collaboration/refine/{requestId}`
**Action**: IT manually reviews and edits the LLM-enhanced SCF

**UI Components**:
- Split view:
  - Left: LLM-enhanced YAML (read-only reference)
  - Right: Editable YAML (Monaco Editor with YAML syntax)
- Diff viewer showing changes from LLM version
- Refinement notes textarea
- VS Code-like features:
  - Syntax highlighting
  - Auto-completion
  - Linting/validation
  - Search/replace

**Actions**:
- Save refinements
- Mark as "Ready to Deploy"
- Go back to LLM enhancement if needed

**Notification**: System updates status when marked ready

---

### 5. Deployment Configuration (ready_to_deploy → deploying)
**Actor**: IT User
**Page**: `/collaboration/deploy/{requestId}`
**Action**: IT configures and triggers deployment

**UI Components**:

**Deployment Method Selection**:
- Radio buttons: Upload vs GitOps

**Path A - Upload Method**:
- Target selection: Admin UI or API
- API endpoint input (if API selected)
- File upload preview
- "Deploy via Upload" button

**Path B - GitOps Method**:
- Git repository input
- Branch selector
- CI/CD pipeline selection:
  - Ansible
  - Kubernetes Operator
  - Both
- Commit message input
- "Deploy via GitOps" button

**Common Fields**:
- Environment selector (dev/staging/prod)
- Deployment notes textarea
- Review final YAML (read-only)

**Actions**:
- Configure deployment
- Trigger deployment
- Monitor deployment progress

**Notification**:
- IT and OT receive "Deployment initiated for {machineName}"
- On success: "Deployment completed successfully"
- On failure: "Deployment failed: {error}"

---

### 6. Deployment Status (deploying → deployed/failed)
**Actor**: System (with IT monitoring)
**Page**: `/collaboration/status/{requestId}`
**Action**: Monitor deployment progress and view results

**UI Components**:
- Deployment progress indicator
- Real-time logs (if available)
- Pipeline stages visualization
- Status timeline
- Final results display

---

## New Store State Structure

```typescript
interface StoreState {
  // ... existing state ...

  // New workflow (alongside legacy for gradual migration)
  otRequests: OTRequest[];

  // Actions
  createOTRequest: (request: OTRequest) => void;
  updateOTRequest: (id: string, updates: Partial<OTRequest>) => void;
  deleteOTRequest: (id: string) => void;
}
```

## Navigation Structure

Update sidebar to include:
```
Collaboration (new top-level menu)
├── Active Collaborations
├── Create New Request (OT only)
├── Pending IT Drafts (IT only)
├── LLM Enhancements (IT only)
└── Deployment Queue (IT only)
```

## Implementation Priority

### Phase 1 (MVP):
1. ✅ Update types (DONE)
2. Update Zustand store with OTRequest state
3. Create OT Request page (basic form)
4. Create IT Draft page (simple textarea)
5. Create basic LLM chat interface (no real LLM, simulated)
6. Create deployment page (upload method only)
7. Update navigation

### Phase 2 (Enhanced):
8. Add Monaco Editor for code editing
9. Implement data source browsers (OPC UA, SCF library, etc.)
10. Add diff viewer for manual refinement
11. Implement GitOps deployment
12. Add real-time testing capability

### Phase 3 (Production-Ready):
13. Integrate actual LLM API
14. Implement actual data source querying
15. Add deployment monitoring
16. Create analytics dashboard
17. Add collaboration history

## Key Libraries Needed

```bash
npm install @monaco-editor/react  # Code editor
npm install react-split            # Split panes
npm install diff                   # Diff viewer
npm install js-yaml                # YAML parsing
```

## Migration Strategy

Keep legacy `dataPointRequests` for now, introduce `otRequests` alongside.
Gradually migrate features to new workflow.
Remove legacy code once all features are ported.

---

## Next Steps

1. Install required libraries
2. Update store with otRequests state
3. Create OT Request page
4. Create IT Draft page
5. Create LLM enhancement chat
6. Create deployment interface
7. Update routing
8. Test end-to-end workflow

This is a significant architectural change that will transform the application into a true LLM-powered SCF generation platform.
