import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Download, CheckCircle, FileText, X, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Payment Method Modal ──────────────────────────────────────────────────────
function PagoModal({ pago, onClose, onConfirm }) {
    const [metodo, setMetodo] = useState('EFECTIVO');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onConfirm(pago.uuid, metodo);
        setIsSubmitting(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 420 }}>
                <div className="modal-header">
                    <h2>Registrar Cobro</h2>
                    <button onClick={onClose} className="btn-ghost border-0 p-1"><X size={20} /></button>
                </div>

                <div className="p-4">
                    <p className="text-sm text-muted mb-1">Paciente</p>
                    <p className="font-bold mb-1">{pago.pacienteNombreCompleto}</p>
                    <p className="text-sm text-muted mb-4">Fecha turno: {pago.fechaTurno}</p>

                    <p className="text-2xl font-bold mb-6" style={{ color: 'var(--success)' }}>
                        ${parseFloat(pago.monto).toFixed(2)}
                    </p>

                    <div className="form-group mb-2">
                        <label>Método de pago</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className={`btn flex-1 justify-center gap-2 ${metodo === 'EFECTIVO' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setMetodo('EFECTIVO')}
                            >
                                <Banknote size={16} /> Efectivo
                            </button>
                            <button
                                type="button"
                                className={`btn flex-1 justify-center gap-2 ${metodo === 'TRANSFERENCIA' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setMetodo('TRANSFERENCIA')}
                            >
                                <CreditCard size={16} /> Transferencia
                            </button>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-success"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registrando...' : '✓ Confirmar Cobro'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Finanzas Component ───────────────────────────────────────────────────
export default function Finanzas() {
    const [pagosPendientes, setPagosPendientes] = useState([]);
    const [pagosRealizados, setPagosRealizados] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [isExporting, setIsExporting] = useState(false);
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    // Helper: normalize fechaTurno from array or string
    const normFecha = (f) => {
        if (!f) return '';
        if (Array.isArray(f)) return `${f[0]}-${String(f[1]).padStart(2,'0')}-${String(f[2]).padStart(2,'0')}`;
        return String(f).substring(0, 10);
    };

    useEffect(() => {
        fetchPendientes();
        fetchPagados();
    }, []);

    const fetchPendientes = async () => {
        try {
            const { data } = await api.get('/pagos/pendientes');
            setPagosPendientes(data.map(p => ({ ...p, fechaTurno: normFecha(p.fechaTurno) })));
        } catch (err) {
            toast.error('Error al cargar pagos pendientes');
        }
    };

    const fetchPagados = async () => {
        try {
            const { data } = await api.get('/pagos/pagados');
            setPagosRealizados(data.map(p => ({
                ...p,
                fechaTurno: normFecha(p.fechaTurno),
                fechaPago: Array.isArray(p.fechaPago)
                    ? new Date(p.fechaPago[0], p.fechaPago[1]-1, p.fechaPago[2], p.fechaPago[3]||0, p.fechaPago[4]||0).toISOString()
                    : p.fechaPago
            })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleRegistrarPago = async (pagoUuid, metodoPago) => {
        try {
            await api.patch(`/pagos/${pagoUuid}/registrar`, { metodoPago });
            toast.success('Pago registrado correctamente');
            setPagoSeleccionado(null);
            fetchPendientes();
            fetchPagados();
        } catch (err) {
            toast.error('Error al registrar pago: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleGenerarRecibo = async (pagoUuid) => {
        try {
            const { data } = await api.post(`/recibos/generar/${pagoUuid}`);
            toast.success(`Recibo ${data.nroRecibo} generado`);
            const pdfData = await api.get(`/recibos/${data.uuid}/descargar`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([pdfData.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `recibo_${data.nroRecibo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Error al generar recibo. ¿El turno está pagado?');
        }
    };

    const handleExportarExcel = async () => {
        try {
            setIsExporting(true);
            const res = await api.get(`/pagos/reporte-mensual?year=${year}&month=${month}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${year}_${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Reporte Excel generado (CU-10)');
        } catch (err) {
            toast.error('Error al descargar reporte Excel');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Control Financiero &amp; Facturación</h1>
                    <p className="page-subtitle">Gestioná cobranzas, transferencias y emití comprobantes</p>
                </div>
            </div>

            <div className="grid-3 mb-6">
                <div className="card-glass p-6 flex flex-col justify-start gap-6" style={{ gridColumn: 'span 2' }}>
                    <div>
                        <h2 className="text-lg font-bold mb-4">Pagos Pendientes de Cobro</h2>
                        {pagosPendientes.length === 0 ? (
                            <div className="empty-state">
                                <p>No tienes cobros pendientes. ¡Todo al día!</p>
                            </div>
                        ) : (
                            <div className="table-wrapper border-0">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha Turno</th>
                                            <th>Paciente</th>
                                            <th>Monto</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagosPendientes.map(p => (
                                            <tr key={p.uuid}>
                                                <td><span className="text-sm">{p.fechaTurno}</span></td>
                                                <td className="font-bold text-sm">{p.pacienteNombreCompleto}</td>
                                                <td className="text-[var(--danger)] font-bold">${parseFloat(p.monto).toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-success text-xs py-1 px-2"
                                                        onClick={() => setPagoSeleccionado(p)}
                                                    >
                                                        <CheckCircle size={14} /> Cobrar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-bold mb-4 mt-4">Historial de Cobros Recientes</h2>
                        {pagosRealizados.length === 0 ? (
                            <div className="empty-state">
                                <p>Aún no has registrado cobros.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper border-0">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Fecha Pago</th>
                                            <th>Paciente</th>
                                            <th>Monto</th>
                                            <th>Medio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagosRealizados.slice(0, 10).map(p => (
                                            <tr key={p.uuid}>
                                                <td><span className="text-sm">{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString() : '—'}</span></td>
                                                <td className="font-bold text-sm">{p.pacienteNombreCompleto}</td>
                                                <td className="text-[var(--success)] font-bold">${parseFloat(p.monto).toFixed(2)}</td>
                                                <td className="text-xs text-muted">{p.metodoPago}</td>
                                                <td>
                                                    <button className="btn btn-ghost text-xs py-1 px-2" onClick={() => handleGenerarRecibo(p.uuid)}>
                                                        <FileText size={14} /> Recibo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Download size={18} color="var(--accent)" /> Exportar Contador
                    </h2>
                    <p className="text-xs text-muted mb-6">Genera un reporte consolidado en Excel (.xlsx) para la presentación del Monotributo.</p>

                    <div className="form-group">
                        <label>Año</label>
                        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </div>
                    <div className="form-group mb-6">
                        <label>Mes</label>
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            {[...Array(12).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('es', { month: 'long' }).toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn btn-primary w-full justify-center" onClick={handleExportarExcel} disabled={isExporting}>
                        {isExporting ? 'Generando Excel...' : 'Descargar Excel'}
                    </button>
                </div>
            </div>

            {/* Payment Method Modal */}
            {pagoSeleccionado && (
                <PagoModal
                    pago={pagoSeleccionado}
                    onClose={() => setPagoSeleccionado(null)}
                    onConfirm={handleRegistrarPago}
                />
            )}
        </div>
    );
}
