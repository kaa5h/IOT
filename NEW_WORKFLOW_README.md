# New IT-OT Collaboration Workflow - Implementation Guide

## 🚀 What Changed

The application workflow has been completely redesigned to match the following process:

**Old Flow**: IT creates request → OT fills data → Generate/Review SCF → Deploy
**New Flow**: OT requests help → IT creates draft → LLM enhances (with multi-source data) → IT refines → Deploy (Upload or GitOps)

## 📋 New Workflow Steps

```
1. OT Requests Knowledge from IT
   ↓ (OT provides operational data)

2. IT Creates Initial SCF Draft
   ↓ (IT reviews OT data, creates YAML draft)

3. LLM Enhancement Interface
   ↓ (LLM queries: OPC UA, SCFs, Manifest, UNS, Docs)
   ↓ (LLM tests via API)
   ↓ (LLM returns enhanced SCF)

4. IT Manual Refinement
   ↓ (IT edits in VS Code-like editor)

5. Deployment Configuration
   ↓ (Choose: Upload to Admin UI/API OR GitOps → Ansible/K8s)

6. Deployed ✅
```

## ✅ What's Been Implemented

### 1. Type System (src/types/index.ts)
- ✅ `CollaborationStatus` - New workflow states
- ✅ `OTRequest` - Complete request structure
- ✅ `SCFDraft` - IT draft creation
- ✅ `LLMEnhancement` - Chat history, data sources, testing
- ✅ `LLMMessage` - Chat messages
- ✅ `TestResult` - API testing results
- ✅ `DeploymentConfig` - Upload vs GitOps configuration
- ✅ `DataSource` - OPC UA, SCF library, Manifest, UNS, Documentation

### 2. Documentation
- ✅ `WORKFLOW_IMPLEMENTATION_PLAN.md` - Detailed implementation guide
- ✅ `NEW_WORKFLOW_README.md` - This file

## 🎯 What Needs to Be Built

### Phase 1: Core Pages

#### 1. OT Request Page (`src/pages/collaboration/OTRequest.tsx`)
```typescript
// Route: /collaboration/ot-request
// Actor: OT User
// Purpose: OT provides operational data to IT

Features needed:
- Request type selector (new_machine, update_config, troubleshoot, integration)
- Machine details form
- Operational data inputs:
  * Description
  * Current issue
  * Requirements
  * Optional data points
  * Config notes
- Submit → creates OTRequest with status 'ot_data_provided'
```

#### 2. IT Draft Creation Page (`src/pages/collaboration/ITDraft.tsx`)
```typescript
// Route: /collaboration/it-draft/:id
// Actor: IT User
// Purpose: IT creates initial SCF draft from OT data

Features needed:
- Display OT request details (read-only card)
- Code editor for YAML (use @monaco-editor/react)
- Template selector (load existing SCF templates)
- Draft notes field
- Actions:
  * Save draft
  * Send to LLM
```

#### 3. LLM Enhancement Chat (`src/pages/collaboration/LLMEnhance.tsx`)
```typescript
// Route: /collaboration/llm-enhance/:id
// Actor: IT User
// Purpose: Interactive LLM chat for SCF enhancement

Layout:
┌─────────────────────────────────────────────┐
│ Left: Data Sources    │  Main: Chat        │
│ - OPC UA Browse       │  - Messages        │
│ - SCF Library         │  - Input           │
│ - Manifest            │  - Enhanced YAML   │
│ - UNS                 │                    │
│ - Documentation       │  Right: Testing    │
│                       │  - Run tests       │
│                       │  - Results         │
└─────────────────────────────────────────────┘

Features needed:
- Chat interface with message history
- Data source browser panels
- Test execution buttons
- Real-time YAML display
- Accept/regenerate actions
```

#### 4. Manual Refinement (`src/pages/collaboration/Refine.tsx`)
```typescript
// Route: /collaboration/refine/:id
// Actor: IT User
// Purpose: IT manually refines LLM-enhanced SCF

Features needed:
- Split view: LLM version (left) vs Edited version (right)
- Monaco Editor with YAML syntax
- Diff viewer
- Refinement notes
- Mark as "Ready to Deploy" button
```

#### 5. Deployment Page (`src/pages/collaboration/Deploy.tsx`)
```typescript
// Route: /collaboration/deploy/:id
// Actor: IT User
// Purpose: Configure and trigger deployment

Features needed:
- Deployment method selector (Upload vs GitOps)
- Upload path configuration:
  * Target: Admin UI or API
  * API endpoint
- GitOps path configuration:
  * Git repo, branch
  * CI/CD: Ansible, K8s Operator
- Environment selector
- Final YAML review
- Deploy button
```

### Phase 2: Supporting Components

#### Data Source Browsers
- `src/components/collaboration/OPCUABrowser.tsx` - Device tree browser
- `src/components/collaboration/SCFLibrary.tsx` - Previous SCF list
- `src/components/collaboration/ManifestViewer.tsx` - Metadata viewer
- `src/components/collaboration/UNSViewer.tsx` - Namespace hierarchy
- `src/components/collaboration/DocsViewer.tsx` - Documentation

#### Editors & Viewers
- `src/components/collaboration/YAMLEditor.tsx` - Monaco-based editor
- `src/components/collaboration/DiffViewer.tsx` - Show changes
- `src/components/collaboration/TestRunner.tsx` - Run & display tests

#### Chat Interface
- `src/components/collaboration/ChatInterface.tsx` - Message list
- `src/components/collaboration/DataSourcePanel.tsx` - Source selector

### Phase 3: Store Updates

Update `src/store/useStore.ts`:
```typescript
interface StoreState {
  // ... existing ...

  // New workflow
  otRequests: OTRequest[];

  // Actions
  createOTRequest: (request: OTRequest) => void;
  updateOTRequest: (id: string, updates: Partial<OTRequest>) => void;
  deleteOTRequest: (id: string) => void;
}
```

### Phase 4: Routing

Update `src/App.tsx`:
```typescript
<Route path="collaboration">
  <Route index element={<CollaborationList />} />
  <Route path="ot-request" element={<OTRequest />} />
  <Route path="it-draft/:id" element={<ITDraft />} />
  <Route path="llm-enhance/:id" element={<LLMEnhance />} />
  <Route path="refine/:id" element={<Refine />} />
  <Route path="deploy/:id" element={<Deploy />} />
  <Route path="status/:id" element={<DeploymentStatus />} />
</Route>
```

### Phase 5: Navigation

Update `src/components/layout/Sidebar.tsx`:
```typescript
// Add new menu section
{
  label: 'Collaboration',
  icon: Users,
  items: [
    { path: '/collaboration', label: 'Active Collaborations' },
    { path: '/collaboration/ot-request', label: 'New Request', role: 'OT' },
    // ... etc
  ]
}
```

## 📦 Required Dependencies

```bash
npm install @monaco-editor/react  # Code editor
npm install react-split            # Split panes
npm install js-yaml                # YAML parsing
npm install diff                   # Diff viewer
npm install react-markdown         # Render LLM responses
```

## 🔄 Migration Strategy

1. **Parallel Systems**: Keep old `dataPointRequests` and new `otRequests` side-by-side
2. **Feature Flag**: Add a setting to switch between old and new workflow
3. **Gradual Rollout**: Implement new pages one by one
4. **Legacy Support**: Maintain old pages until new workflow is stable
5. **Final Migration**: Remove old pages once new workflow is validated

## 🎨 UI/UX Guidelines

### LLM Chat Interface
- Show thinking indicators when LLM is processing
- Display data sources queried per message
- Use syntax highlighting for code snippets
- Show improvements list clearly

### Code Editors
- Use dark theme for code areas
- Provide YAML validation
- Show line numbers
- Enable search/replace

### Testing Panel
- Use color codes: ✅ Green (passed), ❌ Red (failed), ⚠️ Yellow (warning)
- Show timestamp for each test
- Allow re-running tests
- Display detailed error messages

### Deployment
- Show progress indicators
- Display real-time logs if available
- Provide rollback option
- Confirm before deploying to production

## 📚 Example Code Snippets

### Creating an OT Request
```typescript
const handleSubmit = () => {
  const request: OTRequest = {
    id: generateId('otreq'),
    requestType: 'new_machine',
    machineName: formData.machineName,
    machineType: formData.machineType,
    location: formData.location,
    protocol: formData.protocol,
    operationalData: {
      description: formData.description,
      requirements: formData.requirements,
      dataPoints: dataPoints,
    },
    requestedBy: 'OT User',
    requestedAt: new Date().toISOString(),
    status: 'ot_data_provided',
  };

  createOTRequest(request);
  addNotification(NotificationTemplates.otRequestCreated(request.id, request.machineName));
  navigate('/collaboration');
};
```

### LLM Chat Message
```typescript
const sendMessage = async (content: string) => {
  const message: LLMMessage = {
    id: generateId('msg'),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  };

  // Add to chat history
  const updatedChat = [...llmEnhancement.chatHistory, message];

  // Simulate LLM response (replace with actual API call)
  const response = await callLLMAPI(content, dataSources);

  updatedChat.push({
    id: generateId('msg'),
    role: 'assistant',
    content: response.content,
    timestamp: new Date().toISOString(),
    dataSourcesUsed: response.sourcesQueried,
  });

  updateOTRequest(requestId, {
    llmEnhancement: {
      ...llmEnhancement,
      chatHistory: updatedChat,
      enhancedYAML: response.yaml,
    },
  });
};
```

## 🧪 Testing the New Workflow

1. **As OT**: Create request with operational data
2. **As IT**: Create SCF draft from OT data
3. **As IT**: Use LLM chat to enhance (simulated)
4. **As IT**: Manually refine the YAML
5. **As IT**: Configure deployment (upload method)
6. **Verify**: Check notifications at each step
7. **Verify**: Check status updates in collaboration list

## 🚨 Important Notes

- This is a **major architectural change**
- Requires **significant development time**
- Test thoroughly before production use
- Consider building MVP first (basic pages without LLM integration)
- Add actual LLM API integration later
- Focus on UX - the workflow should feel natural

## 📞 Next Actions

1. Review this plan
2. Install required dependencies
3. Start with Phase 1: Build OT Request page
4. Build IT Draft page
5. Build simplified LLM Enhancement page
6. Add routing and navigation
7. Test end-to-end
8. Iterate and improve

---

**Status**: Type system updated ✅
**Next**: Implement core pages
**Timeline**: 2-3 weeks for complete implementation
