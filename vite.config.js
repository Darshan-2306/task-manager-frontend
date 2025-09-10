import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    allowedHosts: [
      'f6b5305df1d9.ngrok-free.app'  // 👈 add your ngrok host here
    ]
  }
})
