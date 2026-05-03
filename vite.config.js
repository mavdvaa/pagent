import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tasks': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/sha': 'http://localhost:3000',
      '/triggered': 'http://localhost:3000',
    }
  }
})
