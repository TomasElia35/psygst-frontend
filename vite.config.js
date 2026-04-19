import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true,
        allowedHosts: true,
        proxy: {
            '/api/v1': {
                // For local dev: 'http://localhost:8080'
                // For testing against Render: 'https://psygst-backend.onrender.com'
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
})
