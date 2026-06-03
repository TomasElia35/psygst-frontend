/**
 * Genera la URL para abrir WhatsApp con un mensaje predefinido.
 * @param {string} celular - Número de teléfono del paciente
 * @param {string} mensaje - Texto del mensaje
 * @returns {string|null} URL de WhatsApp o null si no hay número
 */
export const getWhatsAppUrl = (celular, mensaje) => {
    if (!celular) return null;
    const phone = celular.replace(/\D/g, '');
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
};

/**
 * Genera el texto para confirmar un turno nuevo.
 */
export const generarMensajeTurnoNuevo = (pacienteNombre, fechaAmigable, hora, modalidad, precio, moneda, profesionalNombre) => {
    return `✅ Hola ${pacienteNombre}! Su turno fue confirmado para el ${fechaAmigable} a las ${hora}hs. Modalidad: ${modalidad}. Importe: ${precio} ${moneda}. Solamente puede cancelar antes de las 48hs de la fecha del turno. ¡Nos vemos!\nProfesional: ${profesionalNombre || ''}`;
};

/**
 * Genera el texto para cancelar un turno.
 */
export const generarMensajeTurnoCancelado = (pacienteNombre, fechaAmigable, hora) => {
    return `Hola ${pacienteNombre}! Su turno del ${fechaAmigable} a las ${hora}hs ha sido cancelado. Comuníquese para reprogramar.`;
};

/**
 * Genera el texto para enviar una factura.
 */
export const generarMensajeFactura = (pacienteNombre, urlDescarga) => {
    return `Hola ${pacienteNombre}, te adjuntamos la factura correspondiente a tu atención médica.\nPuedes descargarla usando este enlace:\n${urlDescarga}`;
};
