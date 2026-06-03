import React from 'react';
import { ClipboardList, CalendarCheck, BanknoteIcon } from 'lucide-react';

const steps = [
    {
        number: '01',
        icon: <ClipboardList size={32} />,
        title: 'Registrá a tu paciente',
        desc: 'Cargá los datos del paciente en segundos. Obra social, datos de contacto y preferencias en un solo formulario.',
    },
    {
        number: '02',
        icon: <CalendarCheck size={32} />,
        title: 'Agendá el turno',
        desc: 'Seleccioná el horario desde la agenda visual. El sistema controla solapamientos y envía confirmación al paciente por WhatsApp.',
    },
    {
        number: '03',
        icon: <BanknoteIcon size={32} />,
        title: 'Gestioná el cobro',
        desc: 'Registrá el pago en pesos, dólares o euros. Generá recibos y exportá el reporte mensual para tu contador.',
    },
];

const HowItWorks = () => {
    return (
        <section className="how-section" id="como-funciona">
            <div className="section-header fade-in">
                <p className="section-eyebrow">¿Cómo funciona?</p>
                <h2>Tres pasos, cero complicaciones</h2>
                <p>Diseñado para que puedas empezar a usarlo el mismo día, sin capacitación.</p>
            </div>
            <div className="how-grid">
                {steps.map((step, i) => (
                    <div key={i} className={`how-step fade-in delay-${i + 1}`}>
                        <div className="how-step-number">{step.number}</div>
                        <div className="how-step-icon">{step.icon}</div>
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                        {i < steps.length - 1 && <div className="how-connector" />}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
