import React from "react";

import { Ponto } from "../Icones";

import "./style.css";

/** Numero grande da tela inicial, com o ponto colorido ao lado. */
const CartaoResumo = ({ valor, rotulo, tom = "rosa", descricao }) => (
  <div className={`cartao cartao-resumo cartao-resumo-${tom}`} title={descricao}>
    <span className="cartao-resumo-icone">
      <Ponto />
    </span>
    <span className="cartao-resumo-textos">
      <span className="cartao-resumo-valor">{valor}</span>
      <span className="cartao-resumo-rotulo">{rotulo}</span>
    </span>
  </div>
);

export default CartaoResumo;
