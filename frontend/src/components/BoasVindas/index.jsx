import React from "react";

import "./style.css";

/**
 * A coluna do grafico ocupa a maior parte da tela e ficava vazia ate alguem
 * clicar numa disciplina -- sem dizer o que o site responde nem o que fazer.
 */
const BoasVindas = () => (
  <div className="coluna-grafico">
    <div className="boas-vindas">
      <h2>Quanta gente passa em cada disciplina</h2>
      <p>
        Escolha uma disciplina na lista para ver, semestre a semestre, quantos
        alunos foram aprovados, quantos reprovaram por nota e quantos por
        falta, além da média das turmas.
      </p>
      <p className="boas-vindas-dica">
        Os dados vêm dos relatórios da coordenação e cobrem de 2010 a 2025.
        Para comparar várias disciplinas de uma vez, veja{" "}
        <a href="/reprovacoes">as que mais reprovam</a>.
      </p>
    </div>
  </div>
);

export default BoasVindas;
