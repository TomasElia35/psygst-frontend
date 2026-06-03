import React from 'react';
import { CalendarDays, Users, Wallet, Bell } from 'lucide-react';

const Features = () => {
    const features = [
        {
            icon: <CalendarDays size={28} />,
            title: "Agenda Inteligente",
            desc: "Gestioná tus turnos de forma rápida y visual. Nunca más un sobreturno o un horario olvidado."
        },
        {
            icon: <Users size={28} />,
            title: "Fichas de Pacientes",
            desc: "Toda la historia clínica, notas y evolución clínica en un solo lugar seguro y accesible."
        },
        {
            icon: <Wallet size={28} />,
            title: "Control de Finanzas",
            desc: "Llevá el registro de pagos, ingresos y deudas de forma automática y transparente."
        },
        {
            icon: <Bell size={28} />,
            title: "Notificaciones",
            desc: "Recordatorios automáticos para mantener el flujo de trabajo organizado y eficiente."
        }
    ];

    return (
        <section className="features-section" id="features">
            <div className="section-header fade-in">
                <p className="section-eyebrow">Funcionalidades</p>
                <h2>Todo lo que necesitás</h2>
                <p>Una herramienta pensada exclusivamente para tu tranquilidad profesional.</p>
            </div>
            <div className="features-grid">
                {features.map((feat, index) => (
                    <div key={index} className={`feature-card fade-in delay-${(index % 3) + 1}`}>
                        <div className="feature-icon">
                            {feat.icon}
                        </div>
                        <h3>{feat.title}</h3>
                        <p>{feat.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
