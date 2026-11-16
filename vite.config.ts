import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// User site (yerayespinosaesteban.github.io) is served from the domain root.
// The 3D scene is lazy-loaded, so three.js lands in its own async chunk.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
})
