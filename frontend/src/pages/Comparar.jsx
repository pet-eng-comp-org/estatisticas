import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import BarraBusca from "../components/BarraBusca";
import { Seta } from "../components/Icones";

import useGrade from "../hooks/useGrade";
import useEstatisticas, { DESDE } from "../hooks/useEstatisticas";
import useEquivalencias from "../hooks/useEquivalencias";
import useTitulo from "../hooks/useTitulo";
import {
  chave,
  disciplinasDoCurriculo,
  formata,
  indicePorCodigo,
  rotuloPeriodo,
  semRepetir,
  OPTATIVA,
} from "../utils/disciplinas";

import "./styles/Comparar.css";

/** Uma das pontas da comparacao: nome, codigo e aprovacao. */
const Lado = ({ disciplina, codigo, estatistica, ano }) => (
  <Link to={`/disciplinas/${codigo}`} className="comparar-lado">
    <span className="comparar-ano">{ano}</span>
    <span className="comparar-nome">{disciplina ? disciplina.nome : codigo}</span>
    <span className="comparar-meta">
      {codigo}
      {disciplina && disciplina.periodo ? ` · ${rotuloPeriodo(disciplina.periodo)}` : ""}
      {disciplina && disciplina.carga_horaria ? ` · ${disciplina.carga_horaria}h` : ""}
    </span>
    <span className="comparar-medida">
      <span>Aprovação</span>
      <b>{estatistica ? formata.porcento(estatistica.aprovacao) : "—"}</b>
    </span>
    <span className="barra barra-verde" aria-hidden="true">
      <span style={{ width: `${estatistica ? Math.round(estatistica.aprovacao * 100) : 0}%` }} />
    </span>
    <span className="comparar-rodape">
      {estatistica
        ? `Média ${formata.decimal(estatistica.media)} · ${formata.inteiro(estatistica.alunos)} alunos`
        : `Sem turmas suficientes desde ${DESDE}`}
    </span>
  </Link>
);

/** Aprovacao media dos varios lados antigos, ponderada pelos alunos. */
function somaDe(codigos, estatisticas) {
  let alunos = 0;
  let aprovados = 0;
  codigos.forEach((c) => {
    const e = estatisticas[c];
    if (!e) return;
    alunos += e.alunos;
    aprovados += e.aprovados;
  });
  return alunos ? aprovados / alunos : null;
}

/**
 * Nao ha mockup desta tela. Mostra cada disciplina do curriculo 2022 ao lado
 * da equivalente de 2008, segundo o PPC, e quanto a aprovacao mudou.
 */
function Comparar() {
  useTitulo("Comparar currículos");
  const { grade, erro, carregando } = useGrade();
  const { estatisticas } = useEstatisticas();
  const { deNova, nomes2008, carregando: carregandoPares } = useEquivalencias();

  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState(null);

  const indice = useMemo(() => indicePorCodigo(grade), [grade]);
  const novas = useMemo(
    () =>
      semRepetir(disciplinasDoCurriculo(grade, "2022")).sort(
        (a, b) => a.periodo - b.periodo || a.nome.localeCompare(b.nome, "pt-BR")
      ),
    [grade]
  );

  const periodos = Array.from(new Set(novas.map((d) => d.periodo))).sort((a, b) => a - b);

  // A busca vale para os dois lados: procurar "Estrutura de Dados I" acha
  // Estruturas de Dados, a nova que a substituiu.
  const termo = chave(busca).trim();
  const casa = (d, antigas) =>
    !termo ||
    [d, ...antigas.map((c) => indice[c] || { nome: nomes2008[c] || c, codigo: c })].some(
      (x) => chave(x.nome).includes(termo) || chave(x.codigo).includes(termo)
    );

  const linhas = novas
    .filter((d) => periodo === null || d.periodo === periodo)
    .map((d) => ({ nova: d, antigas: deNova[d.codigo] || [] }))
    .filter(({ nova, antigas }) => casa(nova, antigas));

  const comPar = linhas.filter((l) => l.antigas.length > 0);
  const semPar = linhas.filter((l) => l.antigas.length === 0);

  const grupos = [];
  comPar.forEach((l) => {
    const ultimo = grupos[grupos.length - 1];
    if (!ultimo || ultimo.periodo !== l.nova.periodo) grupos.push({ periodo: l.nova.periodo, linhas: [l] });
    else ultimo.linhas.push(l);
  });

  return (
    <main className="pagina comparar">
      <h1 className="titulo-pagina">Comparar currículos</h1>
      <p className="subtitulo-pagina">
        Cada disciplina do currículo 2022 ao lado da equivalente de 2008, segundo o PPC do curso.
      </p>

      <div className="comparar-filtros">
        <BarraBusca id="busca-comparar" className="comparar-busca" valor={busca} aoMudar={setBusca} />
        <label className="pilula pilula-seletor comparar-pilula">
          <span className="sr-only">Período no currículo 2022</span>
          <span aria-hidden="true">{periodo === null ? "Todos os períodos" : rotuloPeriodo(periodo)}</span>
          <select
            value={periodo === null ? "" : periodo}
            onChange={(e) => setPeriodo(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">Todos os períodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p === OPTATIVA ? "Optativas" : rotuloPeriodo(p)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(carregando || carregandoPares) && <p className="aviso">Carregando os currículos…</p>}
      {erro && (
        <p className="aviso aviso-erro" role="alert">
          Os currículos não carregaram. Recarregue a página; se continuar assim,
          o servidor está fora do ar.
        </p>
      )}
      {!carregando && !carregandoPares && linhas.length === 0 && (
        <p className="aviso">Nenhuma disciplina encontrada.</p>
      )}

      {grupos.map((g) => (
        <section key={g.periodo} className="comparar-grupo">
          <h2 className="comparar-periodo">
            {g.periodo === OPTATIVA ? "Optativas" : rotuloPeriodo(g.periodo)}
            <small> no currículo 2022</small>
          </h2>
          <span className="comparar-periodo-barra" aria-hidden="true" />
          <ul className="comparar-lista">
            {g.linhas.map(({ nova, antigas }) => {
              const antes = somaDe(antigas, estatisticas);
              const e = estatisticas[nova.codigo];
              const depois = e ? e.aprovacao : null;
              const diferenca = antes !== null && depois !== null ? Math.round((depois - antes) * 100) : null;
              return (
                <li key={nova.codigo} className="cartao comparar-linha">
                  <div className="comparar-antigas">
                    {antigas.map((c) => (
                      <Lado
                        key={c}
                        codigo={c}
                        disciplina={indice[c] || (nomes2008[c] ? { nome: nomes2008[c], codigo: c } : null)}
                        estatistica={estatisticas[c]}
                        ano="2008"
                      />
                    ))}
                  </div>
                  <div className="comparar-meio">
                    <Seta tamanho={22} />
                    {diferenca !== null && (
                      <span
                        className={`comparar-diferenca ${diferenca >= 0 ? "sobe" : "desce"}`}
                        title="Diferença na aprovação, em pontos percentuais"
                      >
                        {diferenca > 0 ? "+" : diferenca < 0 ? "−" : "±"}
                        {Math.abs(diferenca)} p.p.
                      </span>
                    )}
                  </div>
                  <Lado codigo={nova.codigo} disciplina={nova} estatistica={e} ano="2022" />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {semPar.length > 0 && (
        <section className="comparar-grupo">
          <h2 className="comparar-periodo">Sem equivalente em 2008</h2>
          <span className="comparar-periodo-barra" aria-hidden="true" />
          <p className="comparar-explica">
            Disciplinas novas do currículo 2022, que o PPC não liga a nenhuma de 2008.
          </p>
          <ul className="comparar-soltas">
            {semPar.map(({ nova }) => (
              <li key={nova.codigo}>
                <Link to={`/disciplinas/${nova.codigo}`} className="disciplina-ligacao">
                  <span>{nova.nome}</span>
                  <small>{nova.codigo}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default Comparar;
