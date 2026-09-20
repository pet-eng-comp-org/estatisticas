import React from "react";

import "./style.css";

/**
 * A lista tem mais de trezentas disciplinas, e a tela "Nome" as mostra todas
 * em ordem alfabetica: sem busca, achar uma e rolar ate ela.
 */
const CampoBusca = ({ valor, aoMudar, encontradas, total }) => (
  <div className="campo-busca">
    <label className="sr-only" htmlFor="busca-disciplina">
      Buscar disciplina por nome ou código
    </label>
    <input
      id="busca-disciplina"
      type="search"
      className="busca-entrada"
      placeholder="Buscar por nome ou código…"
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      autoComplete="off"
    />
    {valor && (
      <span className="busca-resultado" aria-live="polite">
        {encontradas === 0
          ? "nenhuma disciplina encontrada"
          : `${encontradas} de ${total}`}
      </span>
    )}
  </div>
);

export default CampoBusca;
