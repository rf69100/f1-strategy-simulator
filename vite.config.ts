import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use VITE_BASE when provided; otherwise default to a relative base './'
// Relative base avoids leading-slash asset URLs which are fragile when the server
// may serve files from a subpath or different virtual root.
const basePath = process.env.VITE_BASE || './';

export default defineConfig({
  base: basePath,
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
})