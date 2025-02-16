import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '',
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          data: [
            './src/constants/borders.json',
            './src/constants/world-topo.json',
            './src/constants/cities-pruned.json',
            './src/constants/node-overrides.json',
            './src/constants/continents.json',
          ],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})
