import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: '/sticklycodes-10.github.io/',
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile()
  ],
})
