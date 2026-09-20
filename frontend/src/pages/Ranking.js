import React, { useEffect, useState } from "react";

import MenuBar from "../components/MenuBar";
import api from "../services/api";

import "./styles/App.style.css";
import "./styles/Ranking.style.css";

const PERIODOS = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Responde "quais disciplinas mais reprovam", que antes so dava para descobrir
 * abrindo uma por uma e comparando de cabeca.
 */
function Ranking() {
  const [dados, setDados] = useState([]);
  const [estado, setEstado] = useState("carregando");
  const [periodo, setPeriodo] = useState(null);
  const [desde, setDesde] = useState("2018");

  useEffect(() => {
    let ativo = true;
    setEstado("carregando");

    const busca = periodo ? `/ranking?desde=${desde}&periodo=${periodo}` : `/ranking?desde=${desde}`;
    api
      .get(busca)
      .then((resposta) => {
        if (!ativo) return;
        setDados(resposta.data.disciplinas);
        setEstado(resposta.data.disciplinas.length ? "pronto" : "sem-dados");
      })
      .catch(() => ativo && setEstado("erro"));

    return () => {
      ativo = false;
    };
  }, [periodo, desde]);

  return (
    <div className="main-container">
      <MenuBar />
      <div className="container-fluid ranking-container">
        <div className="ranking-cartao">
          <h2 className="ranking-titulo">Disciplinas que mais reprovam</h2>
          <p className="ranking-subtitulo">
            Percentual de reprovação por nota ou por falta, somando todas as
            turmas desde {desde}. Só entram disciplinas da grade com pelo menos
            20 alunos no período considerado.
          </p>

          <div className="ranking-filtros">
            <label>
              Período da grade:{" "}
              <select value={periodo || ""} onChange={(e) => setPeriodo(e.target.value ? Number(e.target.value) : null)}>
                {PERIODOS.map((p) => (
                  <option key={p || "todos"} value={p || ""}>
                    {p ? `${p}º` : "todos"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              A partir de:{" "}
              <select value={desde} onChange={(e) => setDesde(e.target.value)}>
                {["2010", "2015", "2018", "2022"].map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>

          {estado === "carregando" && <p className="ranking-aviso" aria-live="polite">Calculando…</p>}
          {estado === "erro" && (
            <p className="ranking-aviso ranking-erro" role="alert">
              Não foi possível carregar o ranking. Tente de novo em instantes.
            </p>
          )}
          {estado === "sem-dados" && (
            <p className="ranking-aviso" role="status">
              Nenhuma disciplina com dados suficientes para esse recorte.
            </p>
          )}

          {estado === "pronto" && (
            <div className="ranking-rolagem">
            <table className="ranking-tabela">
              <thead>
                <tr>
                  <th scope="col">Disciplina</th>
                  <th scope="col">Per.</th>
                  <th scope="col">Alunos</th>
                  <th scope="col">Reprovação</th>
                  <th scope="col">Média</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((d) => (
                  <tr key={d.codigo}>
                    <th scope="row">
                      {d.nome}
                      <span className="ranking-codigo">
                        {d.codigo}
                        {d.curriculo === 2022 && <span className="selo-curriculo">2022</span>}
                      </span>
                    </th>
                    <td>{d.periodo_ecomp === 99 ? "opt" : `${d.periodo_ecomp}º`}</td>
                    <td>{d.alunos}</td>
                    <td>
                      <div className="barra-reprovacao">
                        <div
                          className="barra-preenchida"
                          style={{ width: `${Math.round(d.reprovacao * 100)}%` }}
                        />
                        <span>{(d.reprovacao * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>{d.media.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ranking;
