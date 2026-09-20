import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Grade from './pages/Grade';
import Ranking from './pages/Ranking';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* A disciplina aberta entra no endereco: da para copiar o link de
            uma disciplina e o botao voltar do navegador passa a funcionar. */}
        <Route path="/" element={<Grade modo="periodo" />} />
        <Route path="/disciplina/:codigo" element={<Grade modo="periodo" />} />
        <Route path="/departamentos" element={<Grade modo="departamento" />} />
        <Route path="/departamentos/disciplina/:codigo" element={<Grade modo="departamento" />} />
        <Route path="/nome" element={<Grade modo="nome" />} />
        <Route path="/nome/disciplina/:codigo" element={<Grade modo="nome" />} />
        <Route path="/reprovacoes" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
