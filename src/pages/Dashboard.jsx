import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Calendar as CalendarIcon, Wallet, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { normalizeFechaString, normalizeTimeString } from '../utils/dateUtils';
import { ESTADOS_TURNO } from '../utils/constants';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

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

            const [turnosRes, pacientesRes, pagosPendientesRes, pagosPagadosRes] = await Promise.allSettled([
                api.get(`/turnos/semana?fechaInicio=${today}`),
                api.get('/pacientes?size=1'),
                api.get('/pagos/pendientes'),
                api.get('/pagos/pagados')
            ]);

            const todosTurnos = turnosRes.status === 'fulfilled' ? (turnosRes.value.data || []) : [];
            const turnosDelDia = todosTurnos
                .filter(t => normalizeFechaString(t.fecha) === today && t.estado !== ESTADOS_TURNO.CANCELADO)
                .map(t => ({
                    ...t,
                    fecha: normalizeFechaString(t.fecha),
                    horaComienzo: normalizeTimeString(t.horaComienzo).substring(0, 5),
                    horaFin: normalizeTimeString(t.horaFin).substring(0, 5),
                }));
            setTurnosHoy(turnosDelDia);

            let mesSuma = 0;
            const pagosPagadosRaw = pagosPagadosRes.status === 'fulfilled' ? pagosPagadosRes.value.data : null;
            const pagosPagadosData = Array.isArray(pagosPagadosRaw) ? pagosPagadosRaw : (pagosPagadosRaw?.content || []);

            if (pagosPagadosData.length > 0) {
                const pagosMes = pagosPagadosData.filter(p => {
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

            const pacientesData = pacientesRes.status === 'fulfilled' ? pacientesRes.value.data : null;
            const pagosPendientesData = pagosPendientesRes.status === 'fulfilled' ? pagosPendientesRes.value.data : null;

            setStats({
                turnosHoy: turnosDelDia.length,
                pacientesActivos: pacientesData?.totalElements || 0,
                ingresosMes: mesSuma,
                pagosPendientes: pagosPendientesData?.length || 0
            });

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos del dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loader fullScreen text="Cargando resumen del día..." />;

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
                        <EmptyState 
                            icon={CalendarIcon} 
                            title="Sin turnos programados" 
                            description="No tienes turnos agendados para el día de hoy." 
                        />
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
