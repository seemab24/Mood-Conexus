import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Use your repo name in base (case-sensitive)
export default defineConfig({
  base: '/Mood-Conexus/',
  plugins: [react()],
})
