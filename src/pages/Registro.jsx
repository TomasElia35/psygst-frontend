import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function Registro() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        idRol: 2, // 2: PROFESIONAL por defecto
        nombre: '',
        apellido: '',
        email: '',
        celular: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            toast.success('Usuario registrado exitosamente. Ya puedes iniciar sesión.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al registrar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box" style={{ maxWidth: '500px' }}>
                <div className="login-header">
                    <h1>PsyGst</h1>
                    <p>Registro de nuevo profesional</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Apellido</label>
                            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Celular</label>
                        <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="Ej: 1122334455" />
                    </div>

                    <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid var(--border)' }} />

                    <div className="form-group">
                        <label>Nombre de Usuario</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Rol</label>
                        <select name="idRol" value={formData.idRol} onChange={handleChange}>
                            <option value={2}>Profesional / Terapeuta</option>
                            <option value={1}>Administrador</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    );
}
