import { useState, useEffect } from 'react';
import api from '../api/axios';
import { RefreshCw, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notificaciones() {
    const [fallidas, setFallidas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFallidas();
    }, []);

    const fetchFallidas = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/notificaciones/fallidas');
            setFallidas(data);
        } catch (err) {
            toast.error('Error al cargar notificaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReenviar = async (uuid) => {
        try {
            await api.post(`/notificaciones/${uuid}/reenviar`);
            toast.success('Notificación reconvertida a PENDIENTE (RN-N02). El Scheduler la tomará en el próximo ciclo.');
            fetchFallidas();
        } catch (err) {
            toast.error('Error al encolar reenvío');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2"><Bell size={24} color="var(--accent)" /> Monitor de Notificaciones</h1>
                    <p className="page-subtitle">Revisar los recordatorios automáticos de WhatsApp/Email que fallaron tras 3 intentos (RN-N02).</p>
                </div>
                <button className="btn btn-ghost" onClick={fetchFallidas}>
                    <RefreshCw size={16} /> Actualizar
                </button>
            </div>

            <div className="card border-danger">
                <h2 className="text-lg font-bold mb-4 text-danger flex items-center gap-2">
                    Notificaciones Fallidas
                </h2>

                {isLoading ? (
                    <p className="text-muted p-4">Cargando...</p>
                ) : fallidas.length === 0 ? (
                    <div className="empty-state">
                        <p>El sistema de notificaciones funciona perfectamente. No hay envíos fallidos.</p>
                    </div>
                ) : (
                    <div className="flex-col gap-3">
                        {fallidas.map(n => (
                            <div key={n.uuid} className="p-4 rounded border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)] border flex justify-between items-center" style={{ borderColor: 'var(--danger-bg)' }}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="badge badge-fallido text-[10px]">FALLIDO</span>
                                        <span className="font-bold text-sm">{n.pacienteNombreCompleto}</span>
                                        <span className="text-xs text-muted">({n.canal})</span>
                                    </div>
                                    <p className="text-xs text-muted mb-2">Intentos realizados: {n.intentos}/3 | Tipo: {n.tipo}</p>
                                    <p className="text-sm font-mono opacity-80 bg-[rgba(0,0,0,0.3)] p-2 rounded">{n.detalle || 'Error desconocido del Gateway'}</p>
                                </div>
                                <button className="btn btn-ghost shrink-0 border-[var(--border-accent)] hover:border-[var(--accent)]" onClick={() => handleReenviar(n.uuid)}>
                                    Reintentar Manualmente
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
