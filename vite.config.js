import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // also opens on phone via Network URL
    port: 5173,
    strictPort: true,    // fail loudly if an old server is still running
    open: true,          // auto-open browser
    hmr: { overlay: true },
    watch: { usePolling: true, interval: 250 }, // makes auto-refresh reliable on Windows / OneDrive
  },
})
