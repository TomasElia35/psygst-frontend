import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Wallet,
    Bell,
    LogOut
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/agenda', icon: Calendar, label: 'Agenda Semanal' },
        { path: '/pacientes', icon: Users, label: 'Pacientes' },
        { path: '/finanzas', icon: Wallet, label: 'Finanzas & Recibos' },
        { path: '/notificaciones', icon: Bell, label: 'Notificaciones' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>PsyGst</h1>
                <p>Gestión Psicológica</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                ))}
                <button onClick={handleLogout} className="nav-item text-danger mobile-only-logout">
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="mb-4 px-2">
                    <p className="text-sm font-bold truncate">
                        {user?.profesionalNombre} {user?.profesionalApellido}
                    </p>
                    <p className="text-xs text-muted truncate">
                        {user?.username}
                    </p>
                </div>
                <button onClick={handleLogout} className="nav-item text-danger" style={{ color: 'var(--text-secondary)' }}>
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
