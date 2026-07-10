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

// Detecta pantallas chicas (celular) para elegir la vista por defecto.
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth < breakpoint
    );
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [breakpoint]);
    return isMobile;
}

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

export default function Agenda() {
    const isMobile = useIsMobile();
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    // En celular arranca en vista DÍA (columna full-width → se leen los nombres).
    const [view, setView] = useState(isMobile ? Views.DAY : Views.WEEK);

    // Al cruzar el breakpoint (rotar / redimensionar), ajusta la vista.
    useEffect(() => {
        setView(isMobile ? Views.DAY : Views.WEEK);
    }, [isMobile]);

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

    // Elegir un día en el date picker → abre ese día en vista DÍA.
    const handlePickDate = (e) => {
        if (!e.target.value) return;
        const [y, m, d] = e.target.value.split('-').map(Number);
        setCurrentDate(new Date(y, m - 1, d));
        setView(Views.DAY);
    };

    // Tocar el encabezado de un día (en vista semana) → entra a ese día.
    const handleDrillDown = (date) => {
        setCurrentDate(date);
        setView(Views.DAY);
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

    // Resalta la columna del día actual.
    const dayPropGetter = (date) => {
        if (isSameDay(date, new Date())) {
            return { style: { backgroundColor: 'rgba(99, 102, 241, 0.10)' } };
        }
        return {};
    };

    return (
        <div className="h-full flex-col">
            <div className="page-header agenda-header">
                <div>
                    <h1 className="page-title">Agenda</h1>
                    <p className="page-subtitle">
                        {view === Views.DAY ? 'Vista por día' : 'Vista semanal'} — gestioná tus turnos
                    </p>
                </div>
                <div className="agenda-actions flex gap-3 items-center">
                    {/* Selector de día: abre ese día en vista DÍA */}
                    <label className="agenda-datepick flex items-center gap-2 text-sm">
                        <span className="text-muted hide-mobile">Ir al día:</span>
                        <input
                            type="date"
                            value={format(currentDate, 'yyyy-MM-dd')}
                            onChange={handlePickDate}
                            className="agenda-date-input"
                        />
                    </label>
                    <div className="agenda-legend flex items-center gap-3 hide-mobile">
                        <span className="flex items-center gap-1 text-sm text-muted">
                            <span className="legend-dot" style={{ background: 'var(--presencial-color)' }}></span>
                            Presencial
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted">
                            <span className="legend-dot" style={{ background: 'var(--virtual-color)' }}></span>
                            Virtual
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted">
                            <span className="legend-dot" style={{ background: 'var(--cancelado-color)' }}></span>
                            Cancelado
                        </span>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => { setSelectedEvent(null); setSelectedSlot(null); setIsModalOpen(true); }}
                    >
                        + Nuevo Turno
                    </button>
                </div>
            </div>

            <div className="card rbc-wrapper" style={{ padding: 0, overflow: 'hidden', minHeight: 640 }}>
                <Calendar
                    localizer={localizer}
                    culture="es"
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 680 }}
                    views={[Views.WEEK, Views.DAY]}
                    view={view}
                    onView={setView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    drilldownView={Views.DAY}
                    onDrillDown={handleDrillDown}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventPropGetter}
                    slotPropGetter={slotPropGetter}
                    dayPropGetter={dayPropGetter}
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
