import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="landing-footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <img
                            src="/LogoPsyGst.png"
                            alt="PsyGst"
                            style={{ height: 36, objectFit: 'contain', display: 'block' }}
                        />
                    </Link>
                    <p className="footer-tagline">La herramienta de gestión para profesionales de la salud mental de Argentina.</p>
                </div>

                <div className="footer-col">
                    <h4>Producto</h4>
                    <a href="#como-funciona">¿Cómo funciona?</a>
                    <a href="#features">Funcionalidades</a>
                    <a href="#testimonios">Testimonios</a>
                    <a href="#demo">Solicitar Demo</a>
                </div>

                <div className="footer-col">
                    <h4>Sistema</h4>
                    <Link to="/login">Iniciar Sesión</Link>
                </div>

                <div className="footer-col">
                    <h4>Contacto</h4>
                    <a href="mailto:psygst.ok@gmail.com">psygst.ok@gmail.com</a>
                    <a href="https://wa.me/542235298074" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Psygst · Todos los derechos reservados.</p>
                <p>Diseñado para psicólogos y psiquiatras de Argentina</p>
            </div>
        </footer>
    );
};

export default Footer;
