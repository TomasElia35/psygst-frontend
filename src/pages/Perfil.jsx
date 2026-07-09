import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Save, User, Key } from 'lucide-react';

export default function Perfil() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profesiones, setProfesiones] = useState([]);
    
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        cuit: '',
        nroLicencia: '',
        cbu: '',
        alias: '',
        idProfesion: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch catalogue
                const resProfesiones = await api.get(`/profesiones`);
                setProfesiones(resProfesiones.data);

                // Fetch personal data
                const resPerfil = await api.get(`/profesionales/me`);
                
                const data = resPerfil.data;
                setFormData({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    email: data.email || '',
                    celular: data.celular || '',
                    cuit: data.cuit || '',
                    nroLicencia: data.nroLicencia || '',
                    cbu: data.cbu || '',
                    alias: data.alias || '',
                    idProfesion: data.profesion?.idProfesion || ''
                });
                
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Error al cargar los datos del perfil");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            await api.put(`/profesionales/me`, formData);
            toast.success("Perfil actualizado exitosamente");
        } catch (error) {
            console.error("Error updating profile:", error);
            const msg = error.response?.data?.message || "Error al actualizar el perfil";
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!passwordData.oldPassword) {
            toast.error("Ingresá tu contraseña actual");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("La contraseña nueva debe tener al menos 8 caracteres");
            return;
        }

        if (passwordData.newPassword === passwordData.oldPassword) {
            toast.error("La contraseña nueva debe ser diferente a la actual");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        setSavingPassword(true);
        
        try {
            await api.put(`/auth/cambiar-password`, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Contraseña actualizada exitosamente");
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error("Error changing password:", error);
            const msg = error.response?.data?.message || "Error al cambiar la contraseña";
            toast.error(msg);
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="fade-in max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            <header className="mb-6 flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-full text-primary">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Mi Perfil</h1>
                    <p className="text-muted">Configura tus datos personales y profesionales</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                
                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Datos Personales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input 
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Apellido</label>
                        <input 
                            type="text" 
                            name="apellido" 
                            value={formData.apellido} 
                            onChange={handleChange} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Celular</label>
                        <input 
                            type="text" 
                            name="celular" 
                            value={formData.celular} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Datos Profesionales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group mb-0 md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Profesión</label>
                        <select 
                            name="idProfesion" 
                            value={formData.idProfesion} 
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">Seleccione una profesión...</option>
                            {profesiones.map(p => (
                                <option key={p.idProfesion} value={p.idProfesion}>
                                    {p.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">CUIT</label>
                        <input 
                            type="text" 
                            name="cuit" 
                            value={formData.cuit} 
                            onChange={handleChange} 
                            placeholder="Ej: 20-12345678-9"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Nro de Licencia (MN / MP)</label>
                        <input 
                            type="text" 
                            name="nroLicencia" 
                            value={formData.nroLicencia} 
                            onChange={handleChange} 
                            placeholder="Ej: MN 12345"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4 border-b pb-2 mt-8">Datos Bancarios <span className="text-sm font-normal text-muted ml-2">(Para facturación)</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">CBU / CVU</label>
                        <input 
                            type="text" 
                            name="cbu" 
                            value={formData.cbu} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Alias Bancario</label>
                        <input 
                            type="text" 
                            name="alias" 
                            value={formData.alias} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>

            <form onSubmit={handlePasswordSubmit} className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
                <header className="mb-6 flex items-center gap-3 border-b pb-4">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full text-amber-600 dark:text-amber-400">
                        <Key size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Cambiar Contraseña</h2>
                        <p className="text-sm text-muted">Actualiza tu contraseña de acceso al sistema</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-group mb-0 md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
                        <input 
                            type="password" 
                            name="oldPassword" 
                            value={passwordData.oldPassword} 
                            onChange={handlePasswordChange} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                    
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            value={passwordData.newPassword} 
                            onChange={handlePasswordChange} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                    <div className="form-group mb-0">
                        <label className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            value={passwordData.confirmPassword} 
                            onChange={handlePasswordChange} 
                            required 
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                    <button 
                        type="submit" 
                        disabled={savingPassword}
                        className="btn bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
                    >
                        <Save size={18} />
                        {savingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
}
