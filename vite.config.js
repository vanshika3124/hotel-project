import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Yahan SWC ki jagah simple react plugin use karein
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})