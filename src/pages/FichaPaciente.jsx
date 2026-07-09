import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DatosTab from './FichaPaciente/DatosTab';
import HistoriaClinicaTab from './FichaPaciente/HistoriaClinicaTab';
import FacturasTab from './FichaPaciente/FacturasTab';

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
            if (motRes.data && motRes.data.length > 0) {
                setMotivosBaja(motRes.data);
                setSelectedMotivoBaja(motRes.data[0].idMotivo);
            }
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
            const resumen = nuevaNota.length > 120
                ? nuevaNota.substring(0, 120).trimEnd() + '...'
                : nuevaNota;
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
                <DatosTab 
                    isNew={isNew} 
                    formData={formData} 
                    handleChange={handleChange} 
                    handleSubmit={handleSubmit} 
                    isSubmitting={isSubmitting} 
                    obrasSociales={obrasSociales} 
                />
            )}

            {activeTab === 'historia' && !isNew && (
                <HistoriaClinicaTab 
                    nuevaNota={nuevaNota} 
                    setNuevaNota={setNuevaNota} 
                    handleCreateNota={handleCreateNota} 
                    isSubmitting={isSubmitting} 
                    notasClinicas={notasClinicas} 
                    handleVerNota={handleVerNota} 
                />
            )}

            {activeTab === 'facturas' && !isNew && (
                <FacturasTab 
                    facturas={facturas} 
                    uploadingFactura={uploadingFactura} 
                    handleUploadFactura={handleUploadFactura} 
                    pacienteNombre={formData.nombre} 
                    pacienteCelular={formData.celular} 
                />
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
