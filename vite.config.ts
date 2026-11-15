import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_PATH sets where the app is served from, e.g. "/thebibleinthreepictures/"
// for the GitHub Pages preview. The PWA scope must match it (task T3.10).
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
})
