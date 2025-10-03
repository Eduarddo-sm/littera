import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Project root for source files
  root: path.resolve(__dirname, 'src'),
  // Ensure Vite reads environment files from the repository root (where `.env` is located)
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html'),
        login: path.resolve(__dirname, 'src/pages/login/login.html'),
        cadastro: path.resolve(__dirname, 'src/pages/cadastro/cadastro.html'),
      },
    },
  },
});
