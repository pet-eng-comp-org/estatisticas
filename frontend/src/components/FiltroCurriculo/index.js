import React from "react";

import "./style.css";

/**
 * O curso trocou de curriculo em 2022 e as duas geracoes convivem na grade:
 * varias disciplinas aparecem duas vezes, com o mesmo nome e codigos
 * diferentes. Quem entrou de 2022 em diante so cursa as novas; quem esta
 * terminando, as antigas.
 */
const OPCOES = [
  ["2022", "2022", "Disciplinas do currículo em vigor"],
  ["anterior", "Anterior", "Disciplinas do currículo anterior, ainda com turmas concluindo"],
  ["todos", "Todos", "As duas gerações juntas"],
];

const FiltroCurriculo = ({ valor, aoMudar }) => (
  <div className="filtro-curriculo" role="group" aria-label="Filtrar por currículo">
    <span className="filtro-rotulo">Currículo:</span>
    {OPCOES.map(([chave, rotulo, descricao]) => (
      <button
        key={chave}
        type="button"
        className={`filtro-opcao ${valor === chave ? "filtro-ativo" : ""}`}
        aria-pressed={valor === chave}
        title={descricao}
        onClick={() => aoMudar(chave)}
      >
        {rotulo}
      </button>
    ))}
  </div>
);

export default FiltroCurriculo;
