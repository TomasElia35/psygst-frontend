import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Edit3, Trash2, FileText, Plus, FileUp, MessageCircle, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function FichaPaciente() {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const isNew = uuid === 'new';

    const [activeTab, setActiveTab] = useState('datos');
    const [formData, setFormData] = useState({
        nombre: '', apellido: '', dni: '', email: '', celular: '',
        idObraSocial: '', nroAfiliado: '', observaciones: ''
    });

    const [obrasSociales, setObrasSociales] = useState([]);
    const [notasClinicas, setNotasClinicas] = useState([]);
    const [facturas, setFacturas] = useState([]);
    const [uploadingFactura, setUploadingFactura] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nuevaNota, setNuevaNota] = useState('');
    const [motivosBaja, setMotivosBaja] = useState([]);
    const [showBajaModal, setShowBajaModal] = useState(false);
    const [selectedMotivoBaja, setSelectedMotivoBaja] = useState('');

    useEffect(() => {
        // Basic catalog fetches should be externalized in a real app
        // Mocking for now to avoid creating extra API endpoints just for catalogs 
        // Usually there's an /obras-sociales and /motivos endpoint
        fetchCatalogs();

        if (!isNew) {
            fetchPaciente();
            fetchHistoriaClinica();
            fetchFacturas();
        }
    }, [uuid]);

    const fetchCatalogs = async () => {
        try {
            const [osRes, motRes] = await Promise.all([
                api.get('/obras-sociales'),
                api.get('/motivos')
            ]);
            setObrasSociales(osRes.data);
            setMotivosBaja(motRes.data);
            // Set default motivo once loaded
            if (motRes.data.length > 0) setSelectedMotivoBaja(motRes.data[0].idMotivo);
        } catch (err) {
            console.error('Error cargando catálogos', err);
        }
    };

    const fetchPaciente = async () => {
        try {
            const { data } = await api.get(`/pacientes/${uuid}`);
            setFormData(data);
        } catch (err) {
            toast.error('Paciente no encontrado');
            navigate('/pacientes');
        }
    };

    const fetchHistoriaClinica = async () => {
        try {
            const { data } = await api.get(`/historia-clinica/paciente/${uuid}`);
            // Note: This only returns metadata per RN-H04
            setNotasClinicas(data);
        } catch (err) {
            console.error('Error fetching HC', err);
        }
    };

    const fetchFacturas = async () => {
        try {
            const { data } = await api.get(`/facturas/paciente/${uuid}`);
            setFacturas(data);
        } catch (err) {
            console.error('Error fetching facturas', err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isNew) {
                const { data } = await api.post('/pacientes', formData);
                toast.success('Paciente creado');
                // uuid field in PacienteResponse == idPaciente (the UUID PK)
                navigate(`/pacientes/${data.uuid}`);
            } else {
                await api.put(`/pacientes/${uuid}`, formData);
                toast.success('Datos actualizados');
            }
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('Error: Ya existe un paciente con ese DNI (RN-P01)');
            } else {
                toast.error(err.response?.data?.message || 'Error al guardar');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDarBaja = async () => {
        const result = await Swal.fire({
            title: '¿Está seguro de dar de baja?',
            text: 'Los turnos futuros deben cancelarse primero (RN-P02).',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar'
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`/pacientes/${uuid}?idMotivo=${selectedMotivoBaja}`);
            toast.success('Paciente dado de baja exitosamente');
            navigate('/pacientes');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error al dar de baja');
        }
        setShowBajaModal(false);
    };

    const handleCreateNota = async () => {
        if (!nuevaNota.trim()) return;
        try {
            setIsSubmitting(true);
            const resumen = nuevaNota.substring(0, 50) + '...';
            await api.post('/historia-clinica', {
                pacienteUuid: uuid,
                contenido: nuevaNota,
                resumen: resumen
            });
            toast.success('Nota clínica guardada y cifrada (RN-H02)');
            setNuevaNota('');
            fetchHistoriaClinica();
        } catch (err) {
            toast.error('Error al guardar nota');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerNota = async (notaUuid) => {
        try {
            const { data } = await api.get(`/historia-clinica/${notaUuid}`);
            Swal.fire({
                title: 'NOTA CLÍNICA (Descifrada)',
                html: `<strong>Fecha:</strong> ${new Date(data.fechaCreacion).toLocaleDateString()}<br/><br/>${data.contenido.replace(/\n/g, '<br/>')}`,
                icon: 'info'
            });
        } catch (err) {
            toast.error('Error al leer la nota clínica');
        }
    };

    const handleUploadFactura = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            setUploadingFactura(true);
            await api.post(`/facturas/paciente/${uuid}`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Factura subida exitosamente');
            fetchFacturas();
        } catch (err) {
            toast.error('Error al subir factura');
        } finally {
            setUploadingFactura(false);
            e.target.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="page-header mb-[20px]">
                <div className="flex items-center gap-4">
                    <button className="btn-ghost" style={{ padding: 8 }} onClick={() => navigate('/pacientes')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">{isNew ? 'Nuevo Paciente' : `${formData.nombre} ${formData.apellido}`}</h1>
                        <p className="page-subtitle text-xs">Administración de ficha y registros clínicos</p>
                    </div>
                </div>
                {!isNew && (
                    <button className="btn btn-danger" onClick={() => setShowBajaModal(true)}>
                        <Trash2 size={16} /> Dar de baja
                    </button>
                )}
            </div>

            {!isNew && (
                <div className="tabs">
                    <div className={`tab ${activeTab === 'datos' ? 'active' : ''}`} onClick={() => setActiveTab('datos')}>Datos Personales</div>
                    <div className={`tab ${activeTab === 'historia' ? 'active' : ''}`} onClick={() => setActiveTab('historia')}>Historia Clínica</div>
                    <div className={`tab ${activeTab === 'facturas' ? 'active' : ''}`} onClick={() => setActiveTab('facturas')}>Facturas (ARCA)</div>
                </div>
            )}

            {activeTab === 'datos' && (
                <div className="card">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <Edit3 size={18} color="var(--accent)" />
                        {isNew ? 'Completar Datos' : 'Información del Paciente'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex-col gap-2">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Apellido *</label>
                                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>DNI *</label>
                                <input type="text" name="dni" value={formData.dni} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Teléfono Celular (WhatsApp)</label>
                                <input type="text" name="celular" value={formData.celular} onChange={handleChange} placeholder="Ej: 1155667788" />
                            </div>
                            <div className="form-group">
                                <label>Obra Social</label>
                                <select name="idObraSocial" value={formData.idObraSocial} onChange={handleChange}>
                                    <option value="">-- Sin obra social --</option>
                                    {obrasSociales.map(os => (
                                        <option key={os.idObraSocial} value={os.idObraSocial}>{os.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Número de Afiliado</label>
                                <input type="text" name="nroAfiliado" value={formData.nroAfiliado || ''} onChange={handleChange} disabled={!formData.idObraSocial || obrasSociales.find(os => os.idObraSocial === formData.idObraSocial)?.nombre === 'Particular'} />
                            </div>
                        </div>

                        <div className="form-group mt-2">
                            <label>Observaciones Administrativas</label>
                            <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} rows={3} />
                        </div>

                        <div className="flex justify-end mt-4">
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Datos'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'historia' && !isNew && (
                <div className="flex gap-6">
                    <div className="flex-1 card">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <FileText size={18} color="var(--accent)" /> Redactar Evolución
                        </h2>
                        <div className="form-group mb-4">
                            <textarea
                                className="w-full p-4"
                                rows={6}
                                placeholder="Escribe la nota clínica de la sesión. Estos datos serán cifrados con AES-256-GCM antes de guardarse en la base de datos (RN-H02)."
                                value={nuevaNota}
                                onChange={(e) => setNuevaNota(e.target.value)}
                                style={{ fontSize: 13.5 }}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button className="btn btn-primary" onClick={handleCreateNota} disabled={isSubmitting || !nuevaNota.trim()}>
                                <Plus size={16} /> Guardar Nota Cifrada
                            </button>
                        </div>
                    </div>

                    <div className="w-[320px] shrink-0">
                        <h3 className="text-sm font-bold uppercase text-muted mb-4 border-b border-[rgba(255,255,255,0.05)] pb-2" style={{ borderColor: 'var(--border)' }}>Historial Clínico</h3>
                        {notasClinicas.length === 0 ? (
                            <p className="text-sm text-muted">No hay registros clínicos aún.</p>
                        ) : (
                            <div className="flex-col gap-3">
                                {notasClinicas.map(nota => (
                                    <div key={nota.uuid} className="p-3 bg-[var(--bg-card)] border border-[rgba(255,255,255,0.07)] rounded cursor-pointer hover:border-[var(--accent)] transition-all" onClick={() => handleVerNota(nota.uuid)} style={{ borderColor: 'var(--border)' }}>
                                        <p className="text-xs text-[var(--accent)] font-bold mb-1">{new Date(nota.fechaCreacion).toLocaleDateString()}</p>
                                        <p className="text-sm text-muted line-clamp-2">{nota.resumen}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'facturas' && !isNew && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <FileText size={18} color="var(--accent)" /> Historial de Facturas
                        </h2>
                        <div>
                            <input
                                type="file"
                                id="upload-factura"
                                style={{ display: 'none' }}
                                accept=".pdf,image/*"
                                onChange={handleUploadFactura}
                            />
                            <label htmlFor="upload-factura" className="btn btn-primary cursor-pointer gap-2" style={{ display: 'inline-flex' }}>
                                <FileUp size={16} /> {uploadingFactura ? 'Subiendo...' : 'Subir Factura'}
                            </label>
                        </div>
                    </div>

                    {facturas.length === 0 ? (
                        <div className="empty-state p-8 text-center rounded bg-[var(--bg-card)] border border-[rgba(255,255,255,0.05)]">
                            <p className="text-muted">No hay facturas cargadas para este paciente.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper border-0">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="text-left w-32">Fecha Subida</th>
                                        <th className="text-left">Archivo</th>
                                        <th className="text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {facturas.map(f => (
                                        <tr key={f.uuid}>
                                            <td className="text-sm">{new Date(f.fechaCreacion).toLocaleDateString()}</td>
                                            <td className="font-bold text-sm" style={{ wordBreak: 'break-all' }}>{f.nombreArchivo}</td>
                                            <td>
                                                <div className="flex gap-2 justify-end">
                                                    <button className="btn btn-ghost text-xs p-1 h-8 px-2" onClick={() => window.open(`${api.defaults.baseURL}/facturas/${f.uuid}/descargar`, '_blank')} title="Ver / Descargar">
                                                        <FileDown size={14} /> Descargar
                                                    </button>
                                                    <button className="btn btn-success text-xs p-1 h-8 px-2 flex gap-1 items-center" style={{ backgroundColor: '#25D366', color: 'white' }} onClick={() => {
                                                        const text = `Hola ${formData.nombre}, te adjuntamos la factura correspondiente a tu atención médica.\nPuedes descargarla usando este enlace:\n${api.defaults.baseURL}/facturas/${f.uuid}/descargar`;
                                                        const phone = formData.celular ? formData.celular.replace(/\D/g, '') : '';
                                                        if (!phone) {
                                                            toast.error('El paciente no tiene un celular configurado');
                                                            return;
                                                        }
                                                        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                                                        window.open(url, '_blank');
                                                    }} title="Avisar por WhatsApp">
                                                        <MessageCircle size={14} /> WhatsApp
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showBajaModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 400 }}>
                        <h3 className="font-bold text-lg mb-4 text-danger">Confirmar Baja del Paciente</h3>
                        <p className="text-sm text-muted mb-4">
                            Esta acción es un borrado lógico. Asegúrese de cancelar todos los turnos futuros antes de proceder (RN-P02).
                        </p>
                        <div className="form-group">
                            <label>Motivo de Baja * (RN-P03)</label>
                            <select value={selectedMotivoBaja} onChange={(e) => setSelectedMotivoBaja(e.target.value)}>
                                {motivosBaja.map(m => (
                                    <option key={m.idMotivo} value={m.idMotivo}>{m.descripcion || m.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowBajaModal(false)}>Cancelar</button>
                            <button className="btn btn-danger" onClick={handleDarBaja}>Confirmar Baja</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
