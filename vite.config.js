import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
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
