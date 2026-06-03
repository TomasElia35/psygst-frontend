import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Dra. Valeria Moreno',
        role: 'Psicóloga Clínica · CABA',
        avatar: 'VM',
        color: '#2064C6',
        text: 'Desde que uso Psygst dejé de preocuparme por los pagos y las ausencias. Los recordatorios automáticos por WhatsApp redujeron mis "no-shows" casi a cero.',
        stars: 5,
    },
    {
        name: 'Lic. Martín Reyes',
        role: 'Psicólogo · Rosario',
        avatar: 'MR',
        color: '#36B3A8',
        text: 'Manejo mi consultorio con más de 40 pacientes activos. La agenda visual y las fichas clínicas me ahorran al menos 2 horas por semana de administración.',
        stars: 5,
    },
    {
        name: 'Dra. Carolina Suárez',
        role: 'Psiquiatra · Córdoba',
        avatar: 'CS',
        color: '#7C3AED',
        text: 'El módulo de finanzas con exportación a Excel para el contador fue un game changer. Nunca fue tan fácil presentar el monotributo.',
        stars: 5,
    },
];

const Testimonials = () => {
    return (
        <section className="testimonials-section" id="testimonios">
            <div className="section-header fade-in">
                <p className="section-eyebrow">Testimonios</p>
                <h2>Lo que dicen nuestros usuarios</h2>
                <p>Profesionales de la salud mental de toda Argentina confían en Psygst.</p>
            </div>
            <div className="testimonials-grid">
                {testimonials.map((t, i) => (
                    <div key={i} className={`testimonial-card fade-in delay-${i + 1}`}>
                        <div className="testimonial-stars">
                            {Array.from({ length: t.stars }).map((_, j) => (
                                <Star key={j} size={16} fill="#FBBF24" color="#FBBF24" />
                            ))}
                        </div>
                        <p className="testimonial-text">"{t.text}"</p>
                        <div className="testimonial-author">
                            <div className="testimonial-avatar" style={{ background: t.color }}>
                                {t.avatar}
                            </div>
                            <div>
                                <p className="testimonial-name">{t.name}</p>
                                <p className="testimonial-role">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
