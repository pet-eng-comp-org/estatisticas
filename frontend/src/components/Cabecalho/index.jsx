import React from "react";
import { Link, NavLink } from "react-router-dom";

import { Logo } from "../Icones";
import { useCurriculo, CURRICULOS } from "../../contexto/Curriculo";

import "./style.css";

const SECOES = [
  ["/", "Início"],
  ["/grade", "Grade"],
  ["/disciplinas", "Disciplinas"],
  ["/comparar", "Comparar currículos"],
];

const Cabecalho = () => {
  const { curriculo, setCurriculo } = useCurriculo();

  return (
    <header className="cabecalho">
      <div className="cabecalho-moldura">
        <Link to="/" className="cabecalho-marca">
          <Logo />
          <span className="cabecalho-nomes">
            <span className="cabecalho-titulo">Estatísticas de disciplinas</span>
            <span className="cabecalho-curso">Engenharia de Computação UFES</span>
          </span>
        </Link>

        <nav className="cabecalho-secoes" aria-label="Seções do site">
          {SECOES.map(([caminho, rotulo]) => (
            <NavLink
              key={caminho}
              to={caminho}
              end={caminho === "/"}
              className={({ isActive }) => `cabecalho-link${isActive ? " ativo" : ""}`}
            >
              {rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="cabecalho-curriculo" role="group" aria-label="Currículo">
          {CURRICULOS.map((ano) => (
            <button
              key={ano}
              type="button"
              className="cabecalho-ano"
              aria-pressed={curriculo === ano}
              title={ano === "2022" ? "Currículo em vigor desde 2022" : "Currículo anterior, de 2008"}
              onClick={() => setCurriculo(ano)}
            >
              {ano}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Cabecalho;
