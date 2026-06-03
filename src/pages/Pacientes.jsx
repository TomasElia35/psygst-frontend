import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, UserPlus, FileText, ChevronRight, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function Pacientes() {
    const [pacientes, setPacientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPacientes();
        }, 300); // debounce search
        return () => clearTimeout(timer);
    }, [searchTerm, page]);

    const fetchPacientes = async () => {
        try {
            const { data } = await api.get(`/pacientes?page=${page}&size=20${searchTerm ? `&q=${searchTerm}` : ''}`);
            setPacientes(data.content);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Error al cargar pacientes');
        }
    };

    const handleCreateNew = () => {
        // Navigate to dummy route "new" which we handle inside FichaPaciente
        navigate('/pacientes/new');
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Directorio de Pacientes</h1>
                    <p className="page-subtitle">Gestiona la ficha personal y clínica de tus pacientes</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreateNew}>
                    <UserPlus size={18} /> Nuevo Paciente
                </button>
            </div>

            <div className="card-glass p-0">
                <div className="p-4 border-b border-[rgba(255,255,255,0.07)]" style={{ borderColor: 'var(--border)' }}>
                    <div className="search-bar">
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-wrapper border-0 rounded-none">
                    <table>
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Contacto</th>
                                <th>Obra Social / Nro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pacientes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-0 border-b-0">
                                        <div className="p-8">
                                            <EmptyState 
                                                icon={Users} 
                                                title="No hay pacientes" 
                                                description="No se encontraron pacientes que coincidan con la búsqueda." 
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pacientes.map(p => (
                                    <tr key={p.uuid} onClick={() => navigate(`/pacientes/${p.uuid}`)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="flex-col">
                                                <span className="font-bold">{p.nombre} {p.apellido}</span>
                                                <span className="text-xs text-muted mt-1">DNI: {p.dni}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="text-sm">{p.email || '-'}</span>
                                                <span className="text-xs text-muted mt-1">{p.celular || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex-col">
                                                <span className="text-sm border opacity-80 px-2 py-0.5 rounded text-xs inline-flex w-max" style={{ borderColor: 'var(--border)' }}>
                                                    {p.obraSocialNombre}
                                                </span>
                                                <span className="text-xs text-muted mt-1">{p.nroAfiliado || 'Particular'}</span>
                                            </div>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="btn btn-ghost text-sm py-1 px-3"
                                                onClick={() => navigate(`/pacientes/${p.uuid}`)}
                                            >
                                                <FileText size={14} /> Ficha Clínica <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination page={page} totalPages={totalPages} setPage={setPage} />
                )}
            </div>
        </div>
    );
}
