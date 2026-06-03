import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogoClick = (e) => {
        e.preventDefault();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="landing-nav fade-in">
            <Link to="/" onClick={handleLogoClick} className="logo">
                <img
                    src="/LogoPsyGst.png"
                    alt="PsyGst"
                    style={{ height: 40, objectFit: 'contain', display: 'block' }}
                />
            </Link>
            <div className="nav-actions">
                <Link to="/login" className="btn btn-outline">
                    Acceder al Sistema
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
