import { FileText, Plus } from 'lucide-react';

export default function HistoriaClinicaTab({ nuevaNota, setNuevaNota, handleCreateNota, isSubmitting, notasClinicas, handleVerNota }) {
    return (
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
    );
}
