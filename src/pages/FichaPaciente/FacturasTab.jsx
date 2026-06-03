import { FileText, FileUp, FileDown, MessageCircle } from 'lucide-react';
import api from '../../api/axios';
import EmptyState from '../../components/EmptyState';
import toast from 'react-hot-toast';
import { getWhatsAppUrl, generarMensajeFactura } from '../../utils/whatsappUtils';

export default function FacturasTab({ facturas, uploadingFactura, handleUploadFactura, pacienteNombre, pacienteCelular }) {
    return (
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
                <EmptyState 
                    icon={FileText} 
                    title="Sin facturas" 
                    description="No hay facturas cargadas para este paciente." 
                />
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
                                            <button className="btn btn-whatsapp text-xs p-1 h-8 px-2 flex gap-1 items-center" onClick={() => {
                                                if (!pacienteCelular) {
                                                    toast.error('El paciente no tiene un celular configurado');
                                                    return;
                                                }
                                                const urlDescarga = `${api.defaults.baseURL}/facturas/${f.uuid}/descargar`;
                                                const mensaje = generarMensajeFactura(pacienteNombre, urlDescarga);
                                                const url = getWhatsAppUrl(pacienteCelular, mensaje);
                                                if (url) window.open(url, '_blank');
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
    );
}
