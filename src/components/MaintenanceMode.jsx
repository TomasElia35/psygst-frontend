import React from 'react';
import { Settings, ServerCog } from 'lucide-react';

const MaintenanceMode = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex justify-center items-center space-x-4">
          <Settings className="h-16 w-16 text-indigo-500 animate-spin-slow" style={{ animationDuration: '3s' }} />
          <ServerCog className="h-16 w-16 text-purple-500 animate-pulse" />
        </div>
        
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Sistema en Mantenimiento
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Estamos realizando una actualización crítica de nuestra infraestructura de base de datos para ofrecerte un servicio más rápido y seguro.
          </p>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mt-6 border border-gray-600">
          <h3 className="text-sm font-medium text-gray-300">Estado actual</h3>
          <p className="text-xs text-gray-400 mt-1">
            Migración a PostgreSQL en progreso. El acceso estará restablecido pronto.
          </p>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-4">
            <div className="bg-indigo-500 h-2 rounded-full w-2/3 animate-pulse"></div>
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Gracias por tu paciencia. <br/> El equipo de Psy-Gst.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceMode;
