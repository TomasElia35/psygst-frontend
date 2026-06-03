import React, { useState, useEffect, useRef } from 'react';

const stats = [
    { value: 500, suffix: '+', label: 'Consultorios activos' },
    { value: 98, suffix: '%', label: 'Tasa de satisfacción' },
    { value: 15000, suffix: '+', label: 'Turnos gestionados por mes' },
    { value: 40, suffix: '%', label: 'Reducción en ausencias' },
];

function useCountUp(target, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

function StatItem({ value, suffix, label, started }) {
    const count = useCountUp(value, 1800, started);
    return (
        <div className="stat-item">
            <span className="stat-number">
                {count.toLocaleString('es-AR')}{suffix}
            </span>
            <span className="stat-label">{label}</span>
        </div>
    );
}

const Stats = () => {
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="stats-section" ref={ref}>
            <div className="stats-grid">
                {stats.map((s, i) => (
                    <StatItem key={i} {...s} started={started} />
                ))}
            </div>
        </section>
    );
};

export default Stats;
