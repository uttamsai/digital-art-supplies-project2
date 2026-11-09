import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built index.html's <script>/<link> tags resolve
  // correctly when the site is hosted under a path (e.g. a GCS bucket's
  // objects at storage.googleapis.com/<bucket-name>/...) rather than at a
  // domain root.
  base: './',
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:8080' } },
})
