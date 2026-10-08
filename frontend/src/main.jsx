import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import "./estilos/base.css";

import Cabecalho from "./components/Cabecalho";
import { CurriculoProvider } from "./contexto/Curriculo";

import Inicio from "./pages/Inicio";
import Grade from "./pages/Grade";
import Disciplinas from "./pages/Disciplinas";
import NaoEncontrada from "./pages/NaoEncontrada";

// A pagina da disciplina carrega a biblioteca de graficos junto; quem so
// percorre a grade nao precisa dela.
const Disciplina = lazy(() => import("./pages/Disciplina"));
const Comparar = lazy(() => import("./pages/Comparar"));

// Enderecos do site anterior: links compartilhados continuam abrindo.
const DisciplinaAntiga = () => {
  const { codigo } = useParams();
  return <Navigate to={`/disciplinas/${codigo}`} replace />;
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CurriculoProvider>
        <div className="app">
          <Cabecalho />
          <Suspense fallback={<main className="pagina" />}>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/grade" element={<Grade />} />
              <Route path="/disciplinas" element={<Disciplinas />} />
              <Route path="/disciplinas/:codigo" element={<Disciplina />} />
              <Route path="/comparar" element={<Comparar />} />

              <Route path="/disciplina/:codigo" element={<DisciplinaAntiga />} />
              <Route path="/departamentos/disciplina/:codigo" element={<DisciplinaAntiga />} />
              <Route path="/nome/disciplina/:codigo" element={<DisciplinaAntiga />} />
              <Route path="/departamentos" element={<Navigate to="/disciplinas" replace />} />
              <Route path="/nome" element={<Navigate to="/disciplinas" replace />} />
              <Route path="/reprovacoes" element={<Navigate to="/disciplinas" replace />} />

              <Route path="*" element={<NaoEncontrada />} />
            </Routes>
          </Suspense>
        </div>
      </CurriculoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
