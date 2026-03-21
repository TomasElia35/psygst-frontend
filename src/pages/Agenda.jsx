import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import api from '../api/axios';
import toast from 'react-hot-toast';
import NuevoTurnoModal from '../components/NuevoTurnoModal';

export default function Agenda() {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const calendarRef = useRef(null);

    useEffect(() => {
        fetchTurnos();
    }, [currentDate]);

    const fetchTurnos = async () => {
        try {
            const { data } = await api.get(`/turnos/semana?fechaInicio=${currentDate}`);

            // Helper: normalize LocalDate ([2026,3,13] or "2026-03-13") → "2026-03-13"
            const normFecha = (f) => {
                if (!f) return '';
                if (Array.isArray(f)) return `${f[0]}-${String(f[1]).padStart(2,'0')}-${String(f[2]).padStart(2,'0')}`;
                return String(f).substring(0, 10);
            };
            // Helper: normalize LocalTime ([9,0] or "09:00:00") → "09:00:00"
            const normTime = (t) => {
                if (!t) return '00:00:00';
                if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1] || 0).padStart(2,'0')}:00`;
                return String(t);
            };

            const formattedEvents = data.map(turno => {
                let backgroundColor = 'var(--accent)';
                if (turno.modalidad === 'VIRTUAL') backgroundColor = 'var(--success)';
                if (turno.estado === 'CANCELADO') backgroundColor = 'var(--danger)';

                const fecha = normFecha(turno.fecha);
                const horaComienzo = normTime(turno.horaComienzo);
                const horaFin = normTime(turno.horaFin);

                return {
                    id: turno.uuid,
                    title: turno.pacienteNombreCompleto,
                    start: `${fecha}T${horaComienzo}`,
                    end: `${fecha}T${horaFin}`,
                    backgroundColor,
                    extendedProps: {
                        ...turno,
                        fecha,
                        horaComienzo: horaComienzo.substring(0, 5),
                        horaFin: horaFin.substring(0, 5),
                    }
                };
            });
            setEvents(formattedEvents);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la agenda');
        }
    };

    const handleDateSelect = (selectInfo) => {
        // Only allow future or current dates
        if (new Date(selectInfo.startStr) < new Date().setHours(0, 0, 0, 0)) {
            toast.error('No se pueden crear turnos en el pasado');
            let calendarApi = selectInfo.view.calendar;
            calendarApi.unselect();
            return;
        }
        setSelectedSlot({
            fecha: selectInfo.startStr.split('T')[0],
            horaComienzo: selectInfo.startStr.split('T')[1].substring(0, 5),
            horaFin: selectInfo.endStr.split('T')[1].substring(0, 5)
        });
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event.extendedProps);
        setSelectedSlot(null);
        setIsModalOpen(true);
    };

    const handleDatesSet = (dateInfo) => {
        // When week changes, update currentDate to fetch new data
        const startStr = dateInfo.startStr.split('T')[0];
        if (startStr !== currentDate) {
            setCurrentDate(startStr);
        }
    };

    return (
        <div className="h-full flex-col">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Agenda Semanal</h1>
                    <p className="page-subtitle">Gestiona tus turnos y horarios disponibles (WF-03)</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }}></span> Presencial
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--success)' }}></span> Virtual
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--danger)' }}></span> Cancelado
                    </div>
                    <button className="btn btn-primary" onClick={() => { setSelectedEvent(null); setSelectedSlot(null); setIsModalOpen(true); }}>
                        + Nuevo Turno
                    </button>
                </div>
            </div>

            <div className="card flex-1 overflow-hidden" style={{ minHeight: 700, padding: '0' }}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'timeGridWeek,timeGridDay'
                    }}
                    locale="es"
                    slotMinTime="08:00:00"
                    slotMaxTime="21:00:00"
                    allDaySlot={false}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    events={events}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    datesSet={handleDatesSet}
                    height={680}
                    slotDuration="00:30:00"
                />
            </div>

            {isModalOpen && (
                <NuevoTurnoModal
                    onClose={() => setIsModalOpen(false)}
                    selectedSlot={selectedSlot}
                    selectedEvent={selectedEvent}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchTurnos();
                    }}
                />
            )}
        </div>
    );
}
