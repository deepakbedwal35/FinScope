import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 

export default defineConfig({

  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      fontFamily: {
        
        nova: ['"Nova Square"', 'sans-serif'], 
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true
      }
    }
  }
})

