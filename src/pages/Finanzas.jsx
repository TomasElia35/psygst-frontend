import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Download, CheckCircle, FileText, X, CreditCard, Banknote, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeFechaString, normalizeFechaToDate } from '../utils/dateUtils';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { Search } from 'lucide-react';

// ─── Payment Method Modal ──────────────────────────────────────────────────────
function PagoModal({ pago, onClose, onConfirm }) {
    const [metodo, setMetodo] = useState('EFECTIVO');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Enviamos la moneda y cotización originales solo por consistencia, aunque no cambian
        await onConfirm(pago.uuid, metodo, pago.moneda, pago.cotizacion);
        setIsSubmitting(false);
    };

    const montoOriginal = parseFloat(pago.monto);
    const moneda = pago.moneda || 'ARS';
    const cotizacion = pago.cotizacion || 1;
    const montoConvertidoARS = moneda === 'ARS' ? montoOriginal : montoOriginal * cotizacion;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 460 }}>
                <div className="modal-header">
                    <h2>Registrar Cobro</h2>
                    <button onClick={onClose} className="btn-ghost border-0 p-1"><X size={20} /></button>
                </div>

                <div className="p-4">
                    <p className="text-sm text-muted mb-1">Paciente</p>
                    <p className="font-bold mb-1">{pago.pacienteNombreCompleto}</p>
                    <p className="text-sm text-muted mb-4">Fecha turno: {pago.fechaTurno}</p>

                    <div className="flex justify-between items-center mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                            <p className="text-xs text-muted">A cobrar en ARS</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                                ${montoConvertidoARS.toFixed(2)}
                            </p>
                        </div>
                        {moneda !== 'ARS' && (
                            <div className="text-right">
                                <p className="text-xs text-muted">Monto original</p>
                                <p className="text-sm font-semibold text-slate-500">{montoOriginal.toFixed(2)} {moneda}</p>
                                <p className="text-[10px] text-muted mt-1">Cotización: {cotizacion}</p>
                            </div>
                        )}
                    </div>

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
    // Todos los pagos realizados (sin filtro de backend)
    const [todosPagados, setTodosPagados] = useState([]);

    // Filtro mes/año (solo aplica al historial de cobros)
    const now = new Date();
    const [filterYear, setFilterYear] = useState(now.getFullYear());
    const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);

    const [isExporting, setIsExporting] = useState(false);
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    // Búsqueda client-side
    const [busqueda, setBusqueda] = useState('');

    // Utils locales eliminadas, ahora usamos las importadas de dateUtils

    // Pendientes: SIEMPRE todos, sin filtro de mes
    useEffect(() => { fetchPendientes(); }, []);
    // Pagados: carga una sola vez todos
    useEffect(() => { fetchPagados(); }, []);

    const fetchPendientes = async () => {
        try {
            const { data } = await api.get('/pagos/pendientes');
            setPagosPendientes(data.map(p => ({ ...p, fechaTurno: normalizeFechaString(p.fechaTurno) })));
        } catch (err) {
            toast.error('Error al cargar pagos pendientes');
        }
    };

    const fetchPagados = async () => {
        try {
            // Traemos todos sin filtro de mes (size grande para no paginar en backend)
            const { data } = await api.get('/pagos/pagados?page=0&size=9999&busqueda=');
            setTodosPagados(data.content.map(p => ({
                ...p,
                fechaTurno: normalizeFechaString(p.fechaTurno),
                _fechaPagoDate: normalizeFechaToDate(p.fechaPago),
                fechaPago: Array.isArray(p.fechaPago)
                    ? new Date(p.fechaPago[0], p.fechaPago[1] - 1, p.fechaPago[2], p.fechaPago[3] || 0, p.fechaPago[4] || 0).toISOString()
                    : p.fechaPago
            })));
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Filtrado client-side por fecha del TURNO (no por fecha de cobro) ──────
    // Ej: turno de mayo cobrado en junio aparece en MAYO
    const pagosRealizados = todosPagados.filter(p => {
        // fechaTurno ya está normalizado como string 'YYYY-MM-DD'
        const ft = p.fechaTurno; // e.g. '2026-05-31'
        if (!ft) return false;
        const partes = ft.split('-');
        const turnoYear = parseInt(partes[0], 10);
        const turnoMonth = parseInt(partes[1], 10);
        const matchMes = turnoYear === filterYear && turnoMonth === filterMonth;
        const matchBusq = busqueda.trim() === '' ||
            p.pacienteNombreCompleto?.toLowerCase().includes(busqueda.toLowerCase());
        return matchMes && matchBusq;
    });

    const handleSearch = (e) => { e.preventDefault(); };


    const handleRegistrarPago = async (pagoUuid, metodoPago, moneda, cotizacion) => {
        try {
            await api.patch(`/pagos/${pagoUuid}/registrar`, { metodoPago, moneda, cotizacion });
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
            const res = await api.get(`/pagos/reporte-mensual?year=${filterYear}&month=${filterMonth}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${filterYear}_${filterMonth}.xlsx`);
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

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const handlePrevMes = () => {
        if (filterMonth === 1) { setFilterMonth(12); setFilterYear(y => y - 1); }
        else setFilterMonth(m => m - 1);
    };
    const handleNextMes = () => {
        if (filterMonth === 12) { setFilterMonth(1); setFilterYear(y => y + 1); }
        else setFilterMonth(m => m + 1);
    };
    const isCurrentMonth = filterYear === now.getFullYear() && filterMonth === now.getMonth() + 1;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Control Financiero &amp; Facturación</h1>
                    <p className="page-subtitle">Gestioná cobranzas, transferencias y emití comprobantes</p>
                </div>

                {/* ─── Selector de Mes ─── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '0.5rem 0.75rem'
                }}>
                    <Calendar size={16} color="var(--accent)" />
                    <button
                        onClick={handlePrevMes}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 6 }}
                        title="Mes anterior"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', minWidth: 150, textAlign: 'center' }}>
                        {MESES[filterMonth - 1]} {filterYear}
                        {isCurrentMonth && (
                            <span style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', background: 'rgba(var(--accent-rgb, 99,102,241),0.12)', padding: '1px 6px', borderRadius: 20 }}>
                                HOY
                            </span>
                        )}
                    </span>
                    <button
                        onClick={handleNextMes}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '2px 4px', borderRadius: 6 }}
                        title="Mes siguiente"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid-3 mb-6">
                <div className="card-glass p-6 flex flex-col justify-start gap-6" style={{ gridColumn: 'span 2' }}>
                    <div>
                        <h2 className="text-lg font-bold mb-4">Pagos Pendientes de Cobro</h2>
                        {pagosPendientes.length === 0 ? (
                            <EmptyState 
                                icon={CheckCircle} 
                                title="Sin cobros pendientes" 
                                description="Todos tus turnos realizados ya fueron cobrados. ¡Todo al día!" 
                            />
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
                        <div className="flex justify-between items-center mb-4 mt-4">
                            <div>
                                <h2 className="text-lg font-bold">Historial de Cobros</h2>
                                <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                                    Ordernado por fecha de turno
                                </p>
                            </div>
                            <form onSubmit={handleSearch} className="search-bar w-auto">
                                <Search size={16} color="var(--text-muted)" />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </form>
                        </div>

                        {pagosRealizados.length === 0 ? (
                            todosPagados.length === 0 ? (
                                <Loader text="Cargando historial..." />
                            ) : (
                                <EmptyState 
                                    icon={FileText} 
                                    title="Historial Vacío" 
                                    description={`No hay turnos cobrados correspondientes al mes de ${MESES[filterMonth - 1]} ${filterYear}.`} 
                                />
                            )
                        ) : (
                            <>
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
                                            {pagosRealizados.map(p => (
                                                <tr key={p.uuid}>
                                                    <td><span className="text-sm">{p.fechaPago ? new Date(p.fechaPago).toLocaleDateString() : '—'}</span></td>
                                                    <td className="font-bold text-sm">{p.pacienteNombreCompleto}</td>
                                                    <td className="text-[var(--success)] font-bold">
                                                        {p.moneda !== 'ARS' ? (
                                                            <div className="flex flex-col">
                                                                <span>${(parseFloat(p.monto) * (p.cotizacion || 1)).toFixed(2)} ARS</span>
                                                                <span className="text-xs font-normal text-muted">
                                                                    ({p.monto} {p.moneda})
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span>${parseFloat(p.monto).toFixed(2)}</span>
                                                        )}
                                                    </td>
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
                            </>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Download size={18} color="var(--accent)" /> Exportar Contador
                    </h2>
                    <p className="text-xs text-muted mb-4">Genera un reporte consolidado en Excel (.xlsx) para la presentación del Monotributo.</p>

                    <div style={{
                        background: 'var(--surface-2, rgba(99,102,241,0.07))',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '0.75rem 1rem',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Calendar size={14} color="var(--accent)" />
                        <span className="text-sm font-semibold">
                            {MESES[filterMonth - 1]} {filterYear}
                        </span>
                        <span className="text-xs text-muted">(filtro activo)</span>
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
