// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Use this plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()], // And use it here
})