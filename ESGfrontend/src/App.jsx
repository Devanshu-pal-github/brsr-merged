import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/PlantPages/Dashboard';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DynamicModulePage from './components/DynamicModulePage';
import CreateEmployee from './pages/createEmployee';
import DynamicEntityDetails from './pages/DynamicEntityDetails';
import TestHarness from './features/temp';
import ChatbotButton from './AICHATBOT/ChatbotButton';
import { AppProvider } from './AICHATBOT/AppProvider';
import CompanyPage from './features/company/pages/CompanyPage';
import AuditLogPage from './pages/PlantPages/auditLogPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/:moduleName" element={<DynamicModulePage />} />
          <Route path="/createEmployee" element={<CreateEmployee />} />
          <Route path="/module/:moduleId" element={<DynamicEntityDetails />} />
          <Route path="/testHarness" element={<TestHarness />} />
          <Route path="/chatbot" element={<ChatbotButton />} />
          <Route path="/audit" element={<AuditLogPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;