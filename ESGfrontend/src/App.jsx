import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/PlantPages/Dashboard';
import Login from './pages/LoginPage';
import DynamicModulePage from './components/DynamicModulePage';
import CreateEmployee from './pages/createEmployee';
import DynamicEntityDetails from './pages/DynamicEntityDetails';
import TestHarness from './features/temp';
import ChatbotButton from './AICHATBOT/ChatbotButton'; // Corrected import
import { AppProvider } from './AICHATBOT/AppProvider'; // Import AppProvider
import LandingPage from './pages/LandingPage'; // Import LandingPage

function App() {
  return (
    <AppProvider> {/* Wrap the app with AppProvider */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/landing" element={<LandingPage />} /> {/* New landing page route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/:moduleName" element={<DynamicModulePage />} />
          <Route path="/createEmployee" element={<CreateEmployee />} />
          <Route path="/module/:moduleId" element={<DynamicEntityDetails />} />
          <Route path="/testHarness" element={<TestHarness />} />
          <Route path="/chatbot" element={<ChatbotButton />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;