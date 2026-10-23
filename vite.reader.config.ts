import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// builds only the story reader (story-reader.html) as a normal multi-file site, for the private draft page
export default defineConfig({
  base: './',
  define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()), __POLISH_DEFAULT__: 'false', __PERF_DEFAULT__: 'false' },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  build: { outDir: '/tmp/claude-0/-home-claude/a720f6f4-ce5b-546c-a91e-36541dcf18f6/scratchpad/artstory', emptyOutDir: true, rollupOptions: { input: path.resolve(__dirname, 'story-reader.html') }, chunkSizeWarningLimit: 100000 },
  publicDir: false,
});
