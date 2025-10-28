import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Machines } from './pages/Machines';
import { Templates } from './pages/Templates';
import { Deployments } from './pages/Deployments';
import { Settings } from './pages/Settings';
import { AddMachineWizard } from './pages/wizard/AddMachineWizard';
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
          <Route path="templates" element={<Templates />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="wizard" element={<AddMachineWizard />} />
        </Route>
      </Routes>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </BrowserRouter>
  );
}

export default App;
