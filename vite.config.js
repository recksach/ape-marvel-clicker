import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8090,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
