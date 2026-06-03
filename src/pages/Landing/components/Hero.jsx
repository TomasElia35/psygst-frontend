import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import dashboardImg from '../../../../public/dashboard-img.png';

const Hero = () => {
    return (
        <section className="hero-section">
            {/* Background floating blobs */}
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />

            <div className="hero-content fade-in">
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    Diseñado para psicólogos y psiquiatras argentinos
                </div>
                <h1 className="hero-title">
                    Del papel a la nube: <span>la evolución</span> de tu consultorio.
                </h1>
                <p className="hero-subtitle delay-1 fade-in">
                    Simplificá la gestión de turnos, pacientes y finanzas en una única plataforma diseñada para profesionales de la salud mental.
                </p>
                <div className="hero-actions delay-2 fade-in">
                    <a href="#demo" className="btn btn-primary btn-lg">
                        Solicitar Demo gratis
                        <ArrowRight size={18} />
                    </a>
                    <Link to="/login" className="btn btn-ghost-hero btn-lg">
                        Ver el sistema
                        <Play size={16} fill="currentColor" />
                    </Link>
                </div>

                <div className="hero-trust delay-3 fade-in">
                    <div className="hero-avatars">
                        {['VM', 'MR', 'CS', 'PL'].map((a, i) => (
                            <div key={i} className="hero-avatar-chip" style={{ zIndex: 4 - i }}>
                                {a}
                            </div>
                        ))}
                    </div>
                    <p className="hero-trust-text">Más de <strong>500 profesionales</strong> ya usan Psygst</p>
                </div>
            </div>

            <div className="hero-mockup fade-in delay-2">
                <div className="hero-mockup-glow" />
                <div className="hero-mockup-window">
                    <div className="hero-mockup-bar">
                        <span /><span /><span />
                    </div>
                    {/* Imagen real del dashboard */}
                    <img
                        src={dashboardImg}
                        alt="Vista previa del dashboard de Psygst"
                        className="hero-mockup-img"
                        style={{ display: 'block' }}
                    />
                </div>
            </div>

            <div className="hero-scroll-indicator">
                <div className="scroll-mouse"><div className="scroll-dot" /></div>
            </div>
        </section>
    );
};

export default Hero;

