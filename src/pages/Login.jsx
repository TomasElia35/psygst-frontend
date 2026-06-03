import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Complete todos los campos');
            return;
        }

        try {
            setIsLoading(true);
            await login(username, password);
            toast.success('¡Bienvenido!');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
                toast.error('Error de red. Verifica que la IP esté configurada correctamente o que estás conectado a la PC.');
            } else if (err.response && err.response.status === 401) {
                toast.error('Credenciales incorrectas');
            } else {
                toast.error('Ocurrió un error al intentar iniciar sesión');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center' }}>Psy Gst</p>
                <img
                    src="/LogoPsyGst.png"
                    alt="PsyGst"
                    style={{ maxWidth: 160, width: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 8px' }}
                />
                <p>Inicie sesión para acceder a su consultorio</p>

                <form onSubmit={handleSubmit} className="flex-col gap-4">
                    <div className="form-group mb-0">
                        <label>Usuario</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nombre de usuario"
                                style={{ paddingLeft: 40 }}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: 12, left: 12, color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingLeft: 40 }}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div style={{
                    marginTop: '24px',
                    textAlign: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)'
                }}>
                    <span style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                    }}>
                        v{__APP_VERSION__}
                    </span>
                </div>
            </div>
        </div>
    );
}
