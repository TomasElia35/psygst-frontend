import { Edit3 } from 'lucide-react';

export default function DatosTab({ isNew, formData, handleChange, handleSubmit, isSubmitting, obrasSociales }) {
    return (
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
    );
}
