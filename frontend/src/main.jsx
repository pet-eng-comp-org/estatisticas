import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Grade from './pages/Grade';
import Ranking from './pages/Ranking';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Grade modo="periodo" />} />
        <Route path="/departamentos" element={<Grade modo="departamento" />} />
        <Route path="/nome" element={<Grade modo="nome" />} />
        <Route path="/reprovacoes" element={<Ranking />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
