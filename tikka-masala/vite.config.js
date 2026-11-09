import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: true, port: 5173 },
  build: {
    chunkSizeWarningLimit: 600,
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : id.includes('node_modules/gsap') || id.includes('node_modules/lenis') ? 'motion' : undefined),
      },
    },
  },
});
