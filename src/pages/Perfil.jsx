import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Save, User } from 'lucide-react';

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
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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
        </div>
    );
}
