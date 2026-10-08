import React from "react";
import { Link } from "react-router-dom";

import { Estrela } from "../Icones";
import { DESDE } from "../../hooks/useEstatisticas";
import { formata, rotuloPeriodo } from "../../utils/disciplinas";

import "./style.css";

/**
 * Cartao da tela Disciplinas. O mockup traz "Dificuldade" e "★ 4,1 · 128
 * avaliações", que dependem de avaliacao feita pelos alunos e ainda nao
 * existem; ate la, a primeira linha mostra a media das notas (0 a 10) e o
 * rodape, quantos alunos entraram na conta.
 */
const CartaoDisciplina = ({ disciplina, estatistica }) => {
  const media = estatistica ? estatistica.media : null;
  const aprovacao = estatistica ? estatistica.aprovacao : null;

  return (
    <Link to={`/disciplinas/${disciplina.codigo}`} className="cartao cartao-disciplina">
      <span className="cartao-disciplina-nome">{disciplina.nome}</span>
      <span className="cartao-disciplina-meta">
        {disciplina.codigo} · {rotuloPeriodo(disciplina.periodo)}
      </span>

      <span className="cartao-disciplina-linha cartao-disciplina-linha-1">
        <span className="cartao-disciplina-rotulo">Média das notas</span>
        <span className="cartao-disciplina-valor">{formata.decimal(media)}</span>
      </span>
      <span className="barra cartao-disciplina-barra cartao-disciplina-barra-1" aria-hidden="true">
        <span style={{ width: `${media === null ? 0 : media * 10}%` }} />
      </span>

      <span className="cartao-disciplina-linha cartao-disciplina-linha-2">
        <span className="cartao-disciplina-rotulo">Aprovação</span>
        <span className="cartao-disciplina-valor cartao-disciplina-valor-verde">
          {formata.porcento(aprovacao)}
        </span>
      </span>
      <span className="barra barra-verde cartao-disciplina-barra cartao-disciplina-barra-2" aria-hidden="true">
        <span style={{ width: `${Math.round((aprovacao || 0) * 100)}%` }} />
      </span>

      <span className="cartao-disciplina-rodape">
        <Estrela />
        {estatistica
          ? `${formata.inteiro(estatistica.alunos)} alunos desde ${DESDE}`
          : "Sem turmas suficientes desde " + DESDE}
      </span>
    </Link>
  );
};

export default CartaoDisciplina;
