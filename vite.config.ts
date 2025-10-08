import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  root: path.resolve(__dirname, 'src'),

  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html'),
        login: path.resolve(__dirname, 'src/pages/login/login.html'),
        cadastro: path.resolve(__dirname, 'src/pages/cadastro/cadastro.html'),
        userarea: path.resolve(__dirname, 'src/pages/userarea/userArea.html'),
        termos: path.resolve(__dirname, 'src/pages/termos/termos.html'),
        meusAnuncios: path.resolve(__dirname, 'src/pages/meusAnuncios/meusAnuncios.html'),
        livroPagina: path.resolve(__dirname, 'src/pages/livro/livroPagina.html'),
        minhaProposta: path.resolve(__dirname, 'src/pages/minhasPropostas/minhasPropostas.html'),
      },
    },
  },
});
