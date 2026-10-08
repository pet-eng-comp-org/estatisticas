import React from "react";

import { Lupa } from "../Icones";

import "./style.css";

/**
 * Campo de busca do mockup. Na tela inicial as pilulas de filtro ficam dentro
 * da caixa (children); em Disciplinas, ao lado.
 */
const BarraBusca = ({ valor, aoMudar, aoEnviar, id = "busca", className = "", children }) => (
  <form
    className={`barra-busca ${className}`}
    role="search"
    onSubmit={(e) => {
      e.preventDefault();
      if (aoEnviar) aoEnviar(valor);
    }}
  >
    <label className="sr-only" htmlFor={id}>
      Buscar disciplina por nome ou código
    </label>
    <span className="barra-busca-lupa">
      <Lupa />
    </span>
    <input
      id={id}
      type="search"
      className="barra-busca-campo"
      placeholder="Buscar disciplina..."
      value={valor}
      onChange={(e) => aoMudar(e.target.value)}
      autoComplete="off"
    />
    {children && <div className="barra-busca-filtros">{children}</div>}
  </form>
);

export default BarraBusca;
