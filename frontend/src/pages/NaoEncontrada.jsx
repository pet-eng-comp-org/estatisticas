import React from "react";
import { Link } from "react-router-dom";

import useTitulo from "../hooks/useTitulo";

function NaoEncontrada() {
  useTitulo("Página não encontrada");
  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Página não encontrada</h1>
      <p className="subtitulo-pagina">
        Este endereço não existe. Volte para o <Link to="/">início</Link> ou
        procure a disciplina em <Link to="/disciplinas">Disciplinas</Link>.
      </p>
    </main>
  );
}

export default NaoEncontrada;
