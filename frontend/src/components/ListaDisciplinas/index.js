import React from "react";
import { Card } from "react-bootstrap";

import "./style.css";

/**
 * Lista da grade, usada pelas tres formas de navegar (periodo, departamento,
 * nome). Antes cada tela tinha a sua copia, e uma correcao precisava ser
 * feita tres vezes.
 */
const ListaDisciplinas = ({ grupos, aoSelecionar, carregando, erro }) => {
  if (carregando) {
    return (
      <Card>
        <Card.Body className="lista-aviso" aria-live="polite">
          Carregando disciplinas…
        </Card.Body>
      </Card>
    );
  }

  if (erro) {
    return (
      <Card>
        <Card.Body className="lista-aviso lista-erro" role="alert">
          Não foi possível carregar a lista de disciplinas.
          <br />
          Recarregue a página; se continuar assim, o servidor pode estar fora do ar.
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {grupos.map((grupo, indice) => (
        <Card key={indice}>
          <div>
            <Card.Header>{grupo.titulo}</Card.Header>
            <ul className="list-group">
              {grupo.disciplinas.map((disciplina) => (
                <li
                  key={disciplina.codigo}
                  className="list-group-item py-1 border-0"
                >
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
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ListaDisciplinas;
