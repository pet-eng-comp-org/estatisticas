import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // A variavel continua se chamando REACT_APP_API_URL: ela esta configurada na
  // stack em producao, e renomear so para acompanhar a troca de ferramenta
  // seria uma mudanca de infraestrutura sem ganho nenhum.
  envPrefix: ['VITE_', 'REACT_APP_'],
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  server: {
    host: true,
    port: 3000,
  },
});
