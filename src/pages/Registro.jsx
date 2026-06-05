import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Registro() {
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        idRol: '',   // UUID — populated once roles are fetched
        nombre: '',
        apellido: '',
        email: '',
        celular: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/roles')
            .then(res => {
                setRoles(res.data);
                if (res.data.length > 0) {
                    // Default to PROFESIONAL role
                    const prof = res.data.find(r => r.nombre === 'ROLE_PROFESIONAL') || res.data[0];
                    setFormData(prev => ({ ...prev, idRol: prof.idRol }));
                }
            })
            .catch(err => console.error('Error cargando roles', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Colega registrado exitosamente.');
            // Reset form
            setFormData({
                username: '',
                password: '',
                idRol: formData.idRol,
                nombre: '',
                apellido: '',
                email: '',
                celular: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al registrar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="login-box" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="login-header">
                    <h1 style={{ fontSize: '24px' }}>Nuevo Colega</h1>
                    <p>Registrar a un nuevo profesional o administrador</p>
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
                            {roles.map(r => (
                                <option key={r.idRol} value={r.idRol}>
                                    {r.nombre === 'ROLE_PROFESIONAL' ? 'Profesional / Terapeuta' : 'Administrador'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
}
