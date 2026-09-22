import React from "react";

import "./style.css";

/**
 * Lista da grade, usada pelas tres formas de navegar (periodo, departamento,
 * nome). Antes cada tela tinha a sua copia, e uma correcao precisava ser
 * feita tres vezes.
 */
/**
 * A pergunta que traz o aluno ate aqui e "essa reprova muita gente?". A barra
 * responde antes do clique; sem dado suficiente, nao inventa um numero.
 */
const Taxa = ({ dado }) => {
  if (!dado) return null;

  const porcento = Math.round(dado.reprovacao * 100);
  return (
    <span
      className="taxa"
      title={`${porcento}% de reprovação em ${dado.alunos} matrículas desde 2018`}
    >
      <span className="taxa-trilho" aria-hidden="true">
        <span className="taxa-preenchida" style={{ width: `${porcento}%` }} />
      </span>
      <span className="taxa-numero">{porcento}%</span>
    </span>
  );
};

const ListaDisciplinas = ({
  grupos,
  aoSelecionar,
  carregando,
  erro,
  marcarCurriculo,
  taxas = {},
}) => {
  if (carregando) {
    return (
      <p className="lista-aviso" aria-live="polite">Carregando disciplinas…</p>
    );
  }

  if (erro) {
    return (
      <p className="lista-aviso lista-erro" role="alert">
        A lista de disciplinas não carregou. Recarregue a página; se continuar
        assim, o servidor está fora do ar.
      </p>
    );
  }

  return (
    <div>
      {grupos.map((grupo, indice) => (
        <section className="grupo" key={indice}>
          <h2 className="grupo-titulo" id={`grupo-${indice}`}>{grupo.titulo}</h2>
          {/* Tabela, nao lista: cada linha tem as mesmas duas colunas, e o
              cabecalho diz ao leitor de tela do que e o percentual. */}
          <table className="lista" aria-labelledby={`grupo-${indice}`}>
            <thead className="sr-only">
              <tr>
                <th scope="col">Disciplina</th>
                <th scope="col">Reprovação</th>
              </tr>
            </thead>
            <tbody>
              {grupo.disciplinas.map((disciplina) => (
                <tr key={disciplina.codigo} className="lista-item">
                  <th scope="row" className="lista-disciplina">
                    {/* Botao, nao link: a acao troca o grafico ao lado e nao
                        navega para lugar nenhum. */}
                    <button
                      type="button"
                      className="disciplina-botao"
                      onClick={() => aoSelecionar(disciplina.nome, disciplina.codigo)}
                    >
                      <span className="disciplina-nome">{disciplina.nome}</span>
                      <span className="codigo-disciplina">
                        {disciplina.codigo}
                        {marcarCurriculo && disciplina.curriculo === 2022 && (
                          <span className="selo-curriculo">2022</span>
                        )}
                      </span>
                    </button>
                  </th>
                  <td className="lista-taxa">
                    <Taxa dado={taxas[disciplina.codigo]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
};

export default ListaDisciplinas;
