import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import biomePlugin from 'vite-plugin-biome'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), biomePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
