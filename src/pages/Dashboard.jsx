import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Calendar as CalendarIcon, Wallet, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function MetricCard({ title, value, icon: Icon, color }) {
    return (
        <div className="metric-card">
            <div className="flex justify-between items-center mb-2">
                <span className="metric-label">{title}</span>
                <div className="metric-icon" style={{ backgroundColor: `${color}15`, color }}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="metric-value">{value}</div>
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState({ turnosHoy: 0, pacientesActivos: 0, ingresosMes: 0, pagosPendientes: 0 });
    const [turnosHoy, setTurnosHoy] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const currentMonth = d.getMonth() + 1;
            const currentYear = d.getFullYear();

            const [turnosRes, pacientesRes, pagosPendientesRes, pagosPagadosRes] = await Promise.all([
                api.get(`/turnos/semana?fechaInicio=${today}`),
                api.get('/pacientes?size=1'),
                api.get('/pagos/pendientes'),
                api.get('/pagos/pagados')
            ]);

            // Helper: normalize fecha from either string "2026-03-13" or array [2026,3,13]
            const normalizeFecha = (fecha) => {
                if (!fecha) return '';
                if (Array.isArray(fecha)) {
                    const [y, m, day] = fecha;
                    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                }
                return String(fecha).substring(0, 10);
            };

            const todosTurnos = turnosRes.data || [];
            const turnosDelDia = todosTurnos.filter(t => normalizeFecha(t.fecha) === today && t.estado !== 'CANCELADO');
            setTurnosHoy(turnosDelDia);

            // Normalize turno data for display
            const turnosDelDiaNormalized = turnosDelDia.map(t => ({
                ...t,
                fecha: normalizeFecha(t.fecha),
                horaComienzo: Array.isArray(t.horaComienzo) ? t.horaComienzo.slice(0, 2).map(n => String(n).padStart(2, '0')).join(':') : String(t.horaComienzo).substring(0, 5),
                horaFin: Array.isArray(t.horaFin) ? t.horaFin.slice(0, 2).map(n => String(n).padStart(2, '0')).join(':') : String(t.horaFin).substring(0, 5),
            }));
            setTurnosHoy(turnosDelDiaNormalized);

            let mesSuma = 0;
            if (pagosPagadosRes.data && pagosPagadosRes.data.length > 0) {
                const pagosMes = pagosPagadosRes.data.filter(p => {
                    if (!p.fechaPago) return false;
                    let pd;
                    if (Array.isArray(p.fechaPago)) {
                        pd = new Date(p.fechaPago[0], p.fechaPago[1] - 1, p.fechaPago[2]);
                    } else {
                        pd = new Date(p.fechaPago);
                    }
                    return pd.getMonth() + 1 === currentMonth && pd.getFullYear() === currentYear;
                });
                mesSuma = pagosMes.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0);
            }

            setStats({
                turnosHoy: turnosDelDia.length,
                pacientesActivos: pacientesRes.data?.totalElements || 0,
                ingresosMes: mesSuma,
                pagosPendientes: pagosPendientesRes.data?.length || 0
            });

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8">Cargando dashboard...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hola, {user?.nombreCompleto} 👋</h1>
                    <p className="page-subtitle">Este es el resumen de tu consultorio de hoy.</p>
                </div>
            </div>

            <div className="grid-4 mb-4">
                <MetricCard title="Turnos Hoy" value={stats.turnosHoy} icon={CalendarIcon} color="var(--accent)" />
                <MetricCard title="Pacientes Activos" value={stats.pacientesActivos} icon={Users} color="var(--success)" />
                <MetricCard title="Ingresos del Mes" value={`$${stats.ingresosMes.toFixed(2)}`} icon={Activity} color="var(--warning)" />
                <MetricCard title="Pagos Pendientes" value={stats.pagosPendientes} icon={Wallet} color="var(--danger)" />
            </div>

            <div className="grid-2">
                <div className="card">
                    <h2 className="text-lg font-bold mb-4">Turnos de Hoy</h2>
                    {turnosHoy.length === 0 ? (
                        <div className="empty-state">
                            <CalendarIcon size={32} />
                            <p>No tienes turnos programados para hoy.</p>
                        </div>
                    ) : (
                        <div className="flex-col gap-3">
                            {turnosHoy.map(turno => (
                                <div key={turno.uuid} className="p-3 border rounded border-[rgba(255,255,255,0.07)] flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                                    <div>
                                        <p className="font-bold">{turno.pacienteNombreCompleto}</p>
                                        <p className="text-sm text-muted">{turno.horaComienzo.substring(0, 5)} - {turno.horaFin.substring(0, 5)}</p>
                                    </div>
                                    <span className={`badge badge-${turno.estado.toLowerCase()}`}>
                                        {turno.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h2 className="text-lg font-bold mb-4">Acciones Rápidas</h2>
                    <div className="grid-2">
                        <button className="btn btn-ghost flex-col items-center justify-center p-4 h-full" onClick={() => window.location.href = '/agenda'}>
                            <CalendarIcon size={24} className="mb-2" />
                            Ver Agenda Completa
                        </button>
                        <button className="btn btn-ghost flex-col items-center justify-center p-4 h-full" onClick={() => window.location.href = '/pacientes'}>
                            <Users size={24} className="mb-2" />
                            Gestionar Pacientes
                        </button>
                        <button className="btn btn-ghost flex-col items-center justify-center p-4 h-full" onClick={() => window.location.href = '/finanzas'}>
                            <Wallet size={24} className="mb-2" />
                            Revisar Finanzas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
