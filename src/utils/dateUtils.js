/**
 * Normaliza una fecha que puede venir de Java como Array [YYYY, MM, DD] o String "YYYY-MM-DD".
 * Retorna siempre un string en formato "YYYY-MM-DD".
 */
export const normalizeFechaString = (fecha) => {
    if (!fecha) return '';
    if (Array.isArray(fecha)) {
        const [y, m, day] = fecha;
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return String(fecha).substring(0, 10);
};

/**
 * Normaliza una fecha que puede venir de Java como Array o String y devuelve un objeto Date local.
 */
export const normalizeFechaToDate = (fecha) => {
    if (!fecha) return null;
    if (Array.isArray(fecha)) {
        // [year, month, day, hour, minute]
        return new Date(fecha[0], fecha[1] - 1, fecha[2], fecha[3] || 0, fecha[4] || 0);
    }
    return new Date(fecha);
};

/**
 * Normaliza una hora que puede venir de Java como Array [HH, mm] o String "HH:mm:ss".
 * Retorna siempre "HH:mm:ss".
 */
export const normalizeTimeString = (time) => {
    if (!time) return '00:00:00';
    if (Array.isArray(time)) {
        return `${String(time[0]).padStart(2, '0')}:${String(time[1] || 0).padStart(2, '0')}:00`;
    }
    return String(time);
};

/**
 * Formatea una fecha "YYYY-MM-DD" a un texto amigable como "Martes 07-04-2026".
 */
export const formatFechaAmigable = (fechaStr) => {
    if (!fechaStr) return '';
    const [year, month, day] = fechaStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const diaSemana = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
    const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    return `${diaCapitalizado} ${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
};
