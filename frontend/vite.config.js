import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function readSharedServiceConfig() {
  try {
    const configPath = path.resolve(__dirname, '../service-config.json')
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch {
    return {
      ports: { frontend: 3000, backend: 5000 },
      hosts: { backend: 'http://localhost' },
    }
  }
}

const shared = readSharedServiceConfig()
const frontendPort = Number(shared?.ports?.frontend) || 3000
const backendPort = Number(shared?.ports?.backend) || 5000
const backendHost = String(shared?.hosts?.backend || 'http://localhost')
const backendUrl = process.env.VITE_API_URL || `${backendHost}:${backendPort}`

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces (localhost, 127.0.0.1, network IP)
    port: frontendPort,
    strictPort: true, // Fail if port is already in use
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  }
})
