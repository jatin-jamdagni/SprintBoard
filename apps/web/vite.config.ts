import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
     tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react()
  ],
  resolve:{
    alias: {
      "@repo/types": path.resolve(__dirname, "../../packages/types/src/index.ts")
    }
  },
  server:{
    port: 5173,
    proxy: {
      "/api":{
        target: "http://localhost:3000", changeOrigin: true
      }
    }
  }
})
