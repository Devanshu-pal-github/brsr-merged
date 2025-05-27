import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Workforce from './pages/PlantPages/Workforce';
import Dashboard from './pages/PlantPages/Dashboard';
import Login from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={

            <Login />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
         <Route
          path="/workforce"
          element={
            <Layout>
              <Workforce />
            </Layout>
          }
        /> 

      </Routes>
    </Router>
  );
}

export default App;