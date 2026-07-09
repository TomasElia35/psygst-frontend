import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axios';
import toast from 'react-hot-toast';
import NuevoTurnoModal from '../components/NuevoTurnoModal';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
    getDay,
    locales: { es },
});

const messages = {
    week: 'Semana',
    day: 'Día',
    today: 'Hoy',
    previous: '‹',
    next: '›',
    date: 'Fecha',
    time: 'Hora',
    event: 'Turno',
    noEventsInRange: 'Sin turnos en este período',
    showMore: (total) => `+${total} más`,
};

export default function Agenda() {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState(Views.WEEK);

    useEffect(() => {
        let isMounted = true;
        fetchTurnos(isMounted);
        return () => { isMounted = false; };
    }, [currentDate]);

    const fetchTurnos = async (isMounted = true) => {
        try {
            // Compute monday of the current week to match the existing API contract
            const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
            const fechaInicio = format(monday, 'yyyy-MM-dd');
            const { data } = await api.get(`/turnos/semana?fechaInicio=${fechaInicio}`);
            if (!isMounted) return;

            const normFecha = (f) => {
                if (!f) return '';
                if (Array.isArray(f)) return `${f[0]}-${String(f[1]).padStart(2,'0')}-${String(f[2]).padStart(2,'0')}`;
                return String(f).substring(0, 10);
            };
            const normTime = (t) => {
                if (!t) return '00:00:00';
                if (Array.isArray(t)) return `${String(t[0]).padStart(2,'0')}:${String(t[1] || 0).padStart(2,'0')}:00`;
                return String(t);
            };

            const formattedEvents = data.map(turno => {
                let color = 'var(--presencial-color)';
                if (turno.modalidad === 'VIRTUAL') color = 'var(--virtual-color)';
                if (turno.estado === 'CANCELADO') color = 'var(--cancelado-color)';

                const fecha = normFecha(turno.fecha);
                const horaComienzo = normTime(turno.horaComienzo);
                const horaFin = normTime(turno.horaFin);

                return {
                    id: turno.uuid,
                    title: turno.pacienteNombreCompleto,
                    start: new Date(`${fecha}T${horaComienzo}`),
                    end: new Date(`${fecha}T${horaFin}`),
                    color,
                    resource: {
                        ...turno,
                        fecha,
                        horaComienzo: horaComienzo.substring(0, 5),
                        horaFin: horaFin.substring(0, 5),
                    },
                };
            });
            setEvents(formattedEvents);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la agenda');
        }
    };

    const handleSelectSlot = ({ start, end }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            toast.error('No se pueden crear turnos en el pasado');
            return;
        }
        setSelectedSlot({
            fecha: format(start, 'yyyy-MM-dd'),
            horaComienzo: format(start, 'HH:mm'),
            horaFin: format(end, 'HH:mm'),
        });
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
        setSelectedSlot(null);
        setIsModalOpen(true);
    };

    const eventPropGetter = (event) => ({
        style: {
            backgroundColor: event.color,
            borderRadius: '6px',
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
        },
    });

    const slotPropGetter = (date) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (date < now) {
            return { style: { opacity: 0.5, cursor: 'not-allowed' } };
        }
        return {};
    };

    return (
        <div className="h-full flex-col">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Agenda Semanal</h1>
                    <p className="page-subtitle">Gestioná tus turnos y horarios disponibles</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="legend-dot" style={{ background: 'var(--presencial-color)' }}></span>
                        Presencial
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="legend-dot" style={{ background: 'var(--virtual-color)' }}></span>
                        Virtual
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <span className="legend-dot" style={{ background: 'var(--cancelado-color)' }}></span>
                        Cancelado
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setSelectedEvent(null); setSelectedSlot(null); setIsModalOpen(true); }}
                    >
                        + Nuevo Turno
                    </button>
                </div>
            </div>

            <div className="card rbc-wrapper" style={{ padding: 0, overflow: 'hidden', minHeight: 720 }}>
                <Calendar
                    localizer={localizer}
                    culture="es"
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 720 }}
                    views={[Views.WEEK, Views.DAY]}
                    view={view}
                    onView={setView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventPropGetter}
                    slotPropGetter={slotPropGetter}
                    min={new Date(0, 0, 0, 8, 0)}
                    max={new Date(0, 0, 0, 21, 0)}
                    step={30}
                    timeslots={2}
                    messages={messages}
                    popup
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
