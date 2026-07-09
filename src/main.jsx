import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

function ThemedToaster() {
    const { theme } = useTheme();
    const style = theme === 'dark'
        ? { background: '#1E293B', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.07)' }
        : { background: '#FFFFFF', color: '#2C1810', border: '1px solid rgba(155,107,71,0.2)' };
    return <Toaster position="top-right" toastOptions={{ style }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <App />
                <ThemedToaster />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>,
);
