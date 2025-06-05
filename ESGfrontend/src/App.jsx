import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import WelcomeLayout from './layouts/WelcomeLayout';
import Dashboard from './pages/PlantPages/Dashboard';
import Login from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import GeneralDetails from './pages/GeneralDetails';
import DynamicModulePage from './components/DynamicModulePage';
import CreateEmployee from './pages/createEmployee';
import DynamicEntityDetails from './pages/DynamicEntityDetails';
import TestHarness from './features/temp';
import ChatbotButton from './AICHATBOT/ChatbotButton';
import { AppProvider } from './AICHATBOT/AppProvider';

const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const RedirectBasedOnSetup = () => {
    const hasCompanyDetails = localStorage.getItem('has_company_details');
    return hasCompanyDetails ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
};

function App() {
    return (
        <AppProvider>
            <Router>
                <Routes>
                    {/* Public route */}
                    <Route path="/login" element={<Login />} />

                    {/* Welcome Flow Routes - Only accessible if not completed setup */}
                    <Route element={
                        <RequireAuth>
                            <WelcomeLayout />
                        </RequireAuth>
                    }>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/general" element={<GeneralDetails />} />
                    </Route>

                    {/* Main App Flow Routes - Only accessible after setup */}
                    <Route element={
                        <RequireAuth>
                            <Layout />
                        </RequireAuth>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/:moduleName" element={<DynamicModulePage />} />
                        <Route path="/createEmployee" element={<CreateEmployee />} />
                        <Route path="/module/:moduleId" element={<DynamicEntityDetails />} />
                    </Route>

                    <Route path="/testHarness" element={<TestHarness />} />
                    <Route path="/chatbot" element={<ChatbotButton />} />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<RedirectBasedOnSetup />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}

export default App;