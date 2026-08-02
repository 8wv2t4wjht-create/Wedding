import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A unique id per build. It's baked into the app and also written to
// version.json, so a running app can detect when a newer version has been
// deployed and refresh itself.
const BUILD_ID = String(Date.now())

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'emit-version',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ id: BUILD_ID }),
        })
      },
    },
  ],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  base: './',
})
