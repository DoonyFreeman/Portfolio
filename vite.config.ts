import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base подставляется при деплое: для репозитория `portfolio` -> '/portfolio/'.
// Для репозитория вида `DoonyFreeman.github.io` оставить '/'.
// Можно переопределить через переменную окружения VITE_BASE.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
})
