import { defineConfig } from 'vite';

// base relative : le build fonctionne tel quel sur GitHub Pages (https://user.github.io/repo/)
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
