import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/PlantPages/Dashboard';
import Login from './pages/LoginPage';
import DynamicModulePage from './components/DynamicModulePage';
import CreateEmployee from './pages/createEmployee';
import DynamicEntityDetails from './pages/DynamicEntityDetails';
// import Chatbot from './features/modules/Chatbot';
import TestHarness from './features/temp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:moduleName" element={<DynamicModulePage />} />
        <Route path="/createEmployee" element={<CreateEmployee />} />
        <Route path="/module/:moduleId" element={<DynamicEntityDetails />} />
        {/* <Route path="/chatbot" element={<Chatbot />} /> */}
        <Route path="/testHarness" element={<TestHarness />} />
      </Routes>
    </Router>
  );
}

export default App;