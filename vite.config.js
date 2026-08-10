import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const configuredBase = process.env.VITE_BASE_PATH?.trim()

export default defineConfig({
  plugins: [react()],
  // Relative paths work for both /<repository>/ Pages URLs and custom domains.
  // CI can override this with the PAGES_BASE_PATH repository variable.
  base: configuredBase || './',
  build: {
    sourcemap: true,
  },
})
