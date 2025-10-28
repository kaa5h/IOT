import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { MachineDetail } from './pages/MachineDetail';
import { EditMachine } from './pages/EditMachine';
import { Templates } from './pages/Templates';
import { Deployments } from './pages/Deployments';
import { Settings } from './pages/Settings';
import { AddMachineWizard } from './pages/wizard/AddMachineWizard';
import { RequestsList } from './pages/requests/RequestsList';
import { CreateRequest } from './pages/requests/CreateRequest';
import { FillDataPoints } from './pages/requests/FillDataPoints';
import { ReviewSCF } from './pages/requests/ReviewSCF';
import { GenerateSCF } from './pages/requests/GenerateSCF';
import { ToastContainer } from './components/ui/Toast';
import { useToast } from './hooks/useToast';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="machines" element={<Machines />} />
          <Route path="machines/:id" element={<MachineDetail />} />
          <Route path="machines/:id/edit" element={<EditMachine />} />
          <Route path="templates" element={<Templates />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="requests" element={<RequestsList />} />
          <Route path="requests/create" element={<CreateRequest />} />
          <Route path="requests/:id/fill" element={<FillDataPoints />} />
          <Route path="requests/:id/review" element={<ReviewSCF />} />
          <Route path="requests/:id/generate" element={<GenerateSCF />} />
          <Route path="settings" element={<Settings />} />
          <Route path="wizard" element={<AddMachineWizard />} />
        </Route>
      </Routes>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </BrowserRouter>
  );
}

export default App;
