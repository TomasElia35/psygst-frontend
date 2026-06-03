import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { formatFechaAmigable } from '../utils/dateUtils';
import { getWhatsAppUrl, generarMensajeTurnoNuevo, generarMensajeTurnoCancelado } from '../utils/whatsappUtils';
import { ESTADOS_TURNO, MODALIDAD_TURNO } from '../utils/constants';

export default function NuevoTurnoModal({ onClose, selectedSlot, selectedEvent, onSuccess }) {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [formData, setFormData] = useState({
        pacienteUuid: selectedEvent?.pacienteUuid || '',
        fecha: selectedSlot?.fecha || selectedEvent?.fecha || new Date().toISOString().split('T')[0],
        horaComienzo: selectedSlot?.horaComienzo || selectedEvent?.horaComienzo || '09:00',
        horaFin: selectedSlot?.horaFin || selectedEvent?.horaFin || '10:00',
        modalidad: selectedEvent?.modalidad || 'PRESENCIAL',
        precioFinal: selectedEvent?.precioFinal || '',
        moneda: selectedEvent?.moneda || 'ARS',
        cotizacion: selectedEvent?.cotizacion || '',
        observaciones: selectedEvent?.observaciones || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FUNCIÓN DE AYUDA PARA FORMATEAR FECHA AHORA VIENE DE DATEUTILS ---

    useEffect(() => {
        api.get('/pacientes?size=1000')
            .then(res => setPacientes(res.data.content || []))
            .catch(err => console.error(err));
    }, []);

    const handleFetchCotizacion = async () => {
        try {
            const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
            const data = await res.json();
            let newCotizacion = '';
            if (formData.moneda === 'USD') {
                newCotizacion = data.blue.value_avg;
            } else if (formData.moneda === 'EUR') {
                newCotizacion = data.blue_euro.value_avg;
            }
            if (newCotizacion) {
                setFormData({ ...formData, cotizacion: newCotizacion });
                toast.success('Cotización obtenida correctamente');
            } else {
                toast.error('No se pudo obtener la cotización para esta moneda');
            }
        } catch (err) {
            toast.error('Error al obtener cotización. Ingresela manualmente.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (selectedEvent) {
                await api.put(`/turnos/${selectedEvent.uuid}`, formData);
                toast.success('Turno actualizado correctamente');
            } else {
                await api.post('/turnos', formData);
                toast.success('Turno creado correctamente.');

                const paciente = pacientes.find(p => p.uuid === formData.pacienteUuid);
                if (paciente && paciente.celular) {
                    const fechaFormateada = formatFechaAmigable(formData.fecha);
                    const mensaje = generarMensajeTurnoNuevo(
                        paciente.nombre, 
                        fechaFormateada, 
                        formData.horaComienzo, 
                        formData.modalidad, 
                        formData.precioFinal, 
                        formData.moneda, 
                        user?.nombreCompleto
                    );
                    const url = getWhatsAppUrl(paciente.celular, mensaje);
                    if (url) window.open(url, '_blank');
                }
            }
            onSuccess();
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('Conflicto: Ya existe un turno activo en ese horario');
            } else {
                toast.error(err.response?.data?.message || 'Error al guardar el turno');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelarTurno = async () => {
        const [year, month, day] = selectedEvent.fecha.split('-').map(Number);
        const [hour, minute] = selectedEvent.horaComienzo.split(':').map(Number);
        const turnoDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();
        const difHs = (turnoDate - now) / (1000 * 60 * 60);

        let warnMsg = '¿Desea cancelar este turno?';
        let warnTitle = 'Cancelar Turno';
        if (difHs > 0 && difHs < 48) {
            warnTitle = 'Aviso importante (Menos de 48hs)';
            warnMsg = 'Faltan menos de 48hs. El paciente deberá abonar la sesión igual. ¿Desea cancelar?';
        }

        const result = await Swal.fire({
            title: warnTitle, text: warnMsg, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Sí, cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            await api.patch(`/turnos/${selectedEvent.uuid}/estado`, { estado: 'CANCELADO' });
            toast.success('Turno cancelado.');

            const paciente = pacientes.find(p => p.uuid === selectedEvent.pacienteUuid);
            if (paciente && paciente.celular) {
                const fechaFormateada = formatFechaAmigable(selectedEvent.fecha);
                const mensaje = generarMensajeTurnoCancelado(paciente.nombre, fechaFormateada, selectedEvent.horaComienzo);
                const url = getWhatsAppUrl(paciente.celular, mensaje);
                if (url) window.open(url, '_blank');
            }
            onSuccess();
        } catch (err) {
            toast.error('Error al cancelar turno');
        }
    };

    const handleRealizarTurno = async () => {
        try {
            await api.patch(`/turnos/${selectedEvent.uuid}/estado`, { estado: 'REALIZADO' });
            toast.success('Turno realizado');
            onSuccess();
        } catch (err) {
            toast.error('Error al marcar realizado');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>{selectedEvent ? 'Detalle de Turno' : 'Nuevo Turno'}</h2>
                    <button onClick={onClose} className="btn-ghost border-0 p-1"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Paciente</label>
                        <select name="pacienteUuid" value={formData.pacienteUuid} onChange={handleChange} required disabled={!!selectedEvent}>
                            <option value="">Seleccione un paciente...</option>
                            {pacientes.map(p => (
                                <option key={p.uuid} value={p.uuid}>{p.nombre} {p.apellido}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Modalidad</label>
                            <select name="modalidad" value={formData.modalidad} onChange={handleChange}>
                                <option value="PRESENCIAL">Presencial</option>
                                <option value="VIRTUAL">Virtual</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Hora Inicio</label>
                            <input type="time" name="horaComienzo" value={formData.horaComienzo} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Hora Fin</label>
                            <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Moneda</label>
                            <select name="moneda" value={formData.moneda} onChange={handleChange} disabled={!!selectedEvent}>
                                <option value="ARS">Pesos Argentinos (ARS)</option>
                                <option value="USD">Dólares (USD)</option>
                                <option value="EUR">Euros (EUR)</option>
                                <option value="BRL">Reales (BRL)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Precio Final ({formData.moneda})</label>
                            <input type="number" name="precioFinal" value={formData.precioFinal} onChange={handleChange} step="0.01" min="0.01" required disabled={!!selectedEvent} />
                        </div>
                    </div>

                    {formData.moneda !== 'ARS' && (
                        <div className="form-group">
                            <label>Cotización (Valor en ARS por unidad)</label>
                            <div className="flex gap-2">
                                <input type="number" name="cotizacion" value={formData.cotizacion} onChange={handleChange} step="0.01" min="0.01" required={!selectedEvent} disabled={!!selectedEvent} className="flex-1 px-3 py-2 border rounded-md" />
                                {(!selectedEvent && (formData.moneda === 'USD' || formData.moneda === 'EUR')) && (
                                    <button type="button" onClick={handleFetchCotizacion} className="btn btn-secondary px-3 py-2 whitespace-nowrap text-sm">Traer Cotización</button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} />
                    </div>

                    {selectedEvent && (
                        <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p className="text-sm font-bold mb-2">Estado: <span className={`badge badge-${selectedEvent.estado.toLowerCase()}`}>{selectedEvent.estado}</span></p>

                            {selectedEvent.estado === 'CONFIRMADO' && (
                                <div className="flex gap-2">
                                    <button type="button" className="btn btn-success text-sm py-1" onClick={handleRealizarTurno}>Marcar Realizado</button>
                                    <button type="button" className="btn btn-warning text-sm py-1" onClick={() => {
                                        const paciente = pacientes.find(p => p.uuid === selectedEvent.pacienteUuid);
                                        if (paciente && paciente.celular) {
                                            const fechaF = formatFechaAmigable(selectedEvent.fecha);
                                            const mensaje = generarMensajeTurnoNuevo(
                                                paciente.nombre, 
                                                fechaF, 
                                                selectedEvent.horaComienzo, 
                                                selectedEvent.modalidad, 
                                                selectedEvent.precioFinal, 
                                                selectedEvent.moneda || 'ARS', 
                                                user?.nombreCompleto
                                            );
                                            const url = getWhatsAppUrl(paciente.celular, mensaje);
                                            if (url) {
                                                window.open(url, '_blank');
                                            } else {
                                                toast.error("Número de celular inválido.");
                                            }
                                        } else {
                                            toast.error("El paciente no tiene celular registrado.");
                                        }
                                    }}>Reenviar WhatsApp</button>
                                    <button type="button" className="btn btn-danger text-sm py-1" onClick={handleCancelarTurno}>Cancelar Turno</button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar</button>
                        {(!selectedEvent || selectedEvent.estado === 'CONFIRMADO') && (
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Turno'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
