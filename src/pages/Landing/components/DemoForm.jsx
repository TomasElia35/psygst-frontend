import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const DemoForm = () => {
    const [nombre, setNombre] = useState('');
    const [especialidad, setEspecialidad] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Número de WhatsApp de Psygst
        // Puedes cambiar esto por el número real del negocio
        const phoneNumber = "5491100000000"; 
        
        const message = `¡Hola! Mi nombre es ${nombre}, soy ${especialidad} y me gustaría solicitar una demo de Psygst para mi consultorio.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    };

    return (
        <section className="demo-section" id="demo">
            <div className="demo-container fade-in">
                <h2>Solicitá tu Demo</h2>
                <p>Dejanos tus datos y te contactaremos por WhatsApp para coordinar una demostración personalizada del sistema.</p>
                <form className="demo-form" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Tu Nombre y Apellido" 
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                    />
                    <input 
                        type="text" 
                        placeholder="Especialidad (ej. Psicología, Psiquiatría)" 
                        value={especialidad}
                        onChange={(e) => setEspecialidad(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-whatsapp">
                        <MessageCircle size={20} />
                        Contactar por WhatsApp
                    </button>
                </form>
            </div>
        </section>
    );
};

export default DemoForm;
