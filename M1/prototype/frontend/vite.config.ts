import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The proxy keeps frontend + API same-origin, so httpOnly cookies just work.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
