import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Pacientes from './pages/Pacientes';
import FichaPaciente from './pages/FichaPaciente';
import Finanzas from './pages/Finanzas';
import Notificaciones from './pages/Notificaciones';
import Registro from './pages/Registro';
import ErrorBoundary from './components/ErrorBoundary';
import MaintenanceMode from './components/MaintenanceMode.jsx';

// RN-S03: Block all routes during DB migration to prevent new data creation
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    // If maintenance mode is active, show only the maintenance screen
    if (MAINTENANCE_MODE) {
        return <MaintenanceMode />;
    }

    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="agenda" element={<Agenda />} />
                        <Route path="pacientes" element={<Pacientes />} />
                        <Route path="pacientes/:uuid" element={<FichaPaciente />} />
                        <Route path="finanzas" element={<Finanzas />} />
                        <Route path="notificaciones" element={<Notificaciones />} />
                        {/* Catch-all redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}

export default App;
