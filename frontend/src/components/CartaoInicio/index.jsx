import React from "react";
import { Link } from "react-router-dom";

import { formata, simbolo, rotuloTipo, tom } from "../../utils/disciplinas";

import "./style.css";

/**
 * Cartao pequeno da tela inicial. A linha de baixo e a "Dificuldade" do
 * mockup; ate a Bia definir de onde ela vem, mostra a reprovacao das turmas,
 * que e o dado que existe.
 */
const CartaoInicio = ({ disciplina, estatistica }) => {
  const reprovacao = estatistica ? estatistica.reprovacao : null;

  return (
    <Link to={`/disciplinas/${disciplina.codigo}`} className={`cartao cartao-inicio cartao-inicio-${tom(estatistica)}`}>
      <span className="cartao-inicio-simbolo" aria-hidden="true">
        {simbolo(disciplina)}
      </span>
      <span className="cartao-inicio-nome">{disciplina.nome}</span>
      <span className="cartao-inicio-meta">
        {disciplina.codigo} · {rotuloTipo(disciplina)}
      </span>
      <span className="cartao-inicio-medida">
        Reprovação {reprovacao === null ? "—" : formata.porcento(reprovacao)}
      </span>
      <span className="barra cartao-inicio-barra" aria-hidden="true">
        <span style={{ width: `${Math.round((reprovacao || 0) * 100)}%` }} />
      </span>
    </Link>
  );
};

export default CartaoInicio;
