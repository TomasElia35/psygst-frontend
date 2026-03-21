import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

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
        observaciones: selectedEvent?.observaciones || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch active patients for the dropdown
        api.get('/pacientes?size=1000') // In real app use async select or pagination
            .then(res => setPacientes(res.data.content || []))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (selectedEvent) {
                // Update existing (PUT)
                await api.put(`/turnos/${selectedEvent.uuid}`, formData);
                toast.success('Turno actualizado correctamente');
            } else {
                // Create new (POST)
                await api.post('/turnos', formData);
                toast.success('Turno creado. Se generó pago pendiente y recordatorio (RN-F03, RN-N01).');

                const paciente = pacientes.find(p => p.uuid === formData.pacienteUuid);
                if (paciente && paciente.celular) {
                    const text = `✅ Hola ${paciente.nombre}! Su turno fue confirmado para el ${formData.fecha} a las ${formData.horaComienzo}. Modalidad: ${formData.modalidad}. Importe: $${formData.precioFinal}. Solamente puede cancelar antes de las 48hs de la fecha del turno. ¡Nos vemos!\nProfesional: ${user?.profesionalNombre || ''}`;
                    const phone = paciente.celular.replace(/\D/g, '');
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                }
            }
            onSuccess();
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('Conflicto: Ya existe un turno activo en ese horario (RN-T01)');
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
        const difMs = turnoDate - now;
        const difHs = difMs / (1000 * 60 * 60);

        let warnMsg = '¿Desea cancelar este turno? (RN-T03)';
        let warnTitle = 'Cancelar Turno';
        if (difHs > 0 && difHs < 48) {
            warnTitle = 'Aviso importante (Menos de 48hs)';
            warnMsg = 'Faltan menos de 48hs. El paciente deberá abonar la sesión igual. ¿Desea cancelar de todas formas?';
        }

        const result = await Swal.fire({
            title: warnTitle,
            text: warnMsg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
        });
        if (!result.isConfirmed) return;

        try {
            await api.patch(`/turnos/${selectedEvent.uuid}/estado`, { estado: 'CANCELADO' });
            toast.success('Turno cancelado. Notificación enviada al paciente (RN-N03).');
            const paciente = pacientes.find(p => p.uuid === selectedEvent.pacienteUuid);
            if (paciente && paciente.celular) {
                const text = `Hola ${paciente.nombre}! Su turno del ${selectedEvent.fecha} a las ${selectedEvent.horaComienzo} ha sido cancelado. Comuníquese para reprogramar.`;
                const phone = paciente.celular.replace(/\D/g, '');
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            }
            onSuccess();
        } catch (err) {
            toast.error('Error al cancelar turno');
        }
    }

    const handleRealizarTurno = async () => {
        try {
            await api.patch(`/turnos/${selectedEvent.uuid}/estado`, { estado: 'REALIZADO' });
            toast.success('Turno marcado como realizado (RN-T04 terminal).');
            onSuccess();
        } catch (err) {
            toast.error('Error al marcar realizado');
        }
    }

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
                        <select
                            name="pacienteUuid"
                            value={formData.pacienteUuid}
                            onChange={handleChange}
                            required
                            disabled={!!selectedEvent} // Don't allow changing patient of existing turno
                        >
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

                    <div className="form-group">
                        <label>Precio Final ($)</label>
                        <input
                            type="number"
                            name="precioFinal"
                            value={formData.precioFinal}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="Ej: 15000"
                            disabled={!!selectedEvent} // RN-T06: price frozen at creation
                        />
                    </div>

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Notas internas sobre el turno..."
                            rows={2}
                        />
                    </div>

                    {selectedEvent && (
                        <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p className="text-sm font-bold mb-2">Estado Actual: <span className={`badge badge-${selectedEvent.estado.toLowerCase()}`}>{selectedEvent.estado}</span></p>

                            {selectedEvent.estado === 'CONFIRMADO' && (
                                <div className="flex gap-2">
                                    <button type="button" className="btn btn-success text-sm py-1" onClick={handleRealizarTurno}>Marcar Realizado</button>
                                    <button type="button" className="btn btn-warning text-sm py-1" onClick={() => {
                                        const paciente = pacientes.find(p => p.uuid === selectedEvent.pacienteUuid);
                                        if (paciente && paciente.celular) {
                                            const text = `✅ Hola ${paciente.nombre}! Su turno fue confirmado para el ${selectedEvent.fecha} a las ${selectedEvent.horaComienzo}. Modalidad: ${selectedEvent.modalidad}. Importe: $${selectedEvent.precioFinal}. Solamente puede cancelar antes de las 48hs de la fecha del turno. ¡Nos vemos!\nProfesional: ${user?.profesionalNombre || ''}`;
                                            const phone = paciente.celular.replace(/\D/g, '');
                                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                                            window.open(url, '_blank');
                                        } else {
                                            toast.error("El paciente no tiene un celular registrado.");
                                        }
                                    }}>Reenviar WhatsApp</button>
                                    <button type="button" className="btn btn-danger text-sm py-1" onClick={handleCancelarTurno}>Cancelar Turno</button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
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
