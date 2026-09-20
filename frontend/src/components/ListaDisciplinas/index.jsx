import React from "react";

import "./style.css";

/**
 * Lista da grade, usada pelas tres formas de navegar (periodo, departamento,
 * nome). Antes cada tela tinha a sua copia, e uma correcao precisava ser
 * feita tres vezes.
 */
const ListaDisciplinas = ({ grupos, aoSelecionar, carregando, erro }) => {
  if (carregando) {
    return (
      <div className="cartao">
        <p className="lista-aviso" aria-live="polite">Carregando disciplinas…</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="cartao">
        <p className="lista-aviso lista-erro" role="alert">
          Não foi possível carregar a lista de disciplinas. Recarregue a página;
          se continuar assim, o servidor pode estar fora do ar.
        </p>
      </div>
    );
  }

  return (
    <div>
      {grupos.map((grupo, indice) => (
        <section className="cartao" key={indice}>
          <h2 className="cartao-titulo">{grupo.titulo}</h2>
          <ul className="lista">
              {grupo.disciplinas.map((disciplina) => (
                <li key={disciplina.codigo} className="lista-item">
                  <div>
                    {/* Botao, nao link: a acao troca o grafico ao lado e nao
                        navega para lugar nenhum. */}
                    <button
                      type="button"
                      className="disciplina-botao"
                      onClick={() => aoSelecionar(disciplina.nome, disciplina.codigo)}
                    >
                      {disciplina.nome}
                    </button>
                    <span className="codigo-disciplina">
                      {disciplina.codigo}
                      {disciplina.curriculo === 2022 && (
                        <span className="selo-curriculo">2022</span>
                      )}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default ListaDisciplinas;
