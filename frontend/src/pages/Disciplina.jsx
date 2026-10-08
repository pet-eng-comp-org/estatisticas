import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CartaoResumo from "../components/CartaoResumo";
import GraficoDisciplina from "../components/GraficoDisciplina";
import { Seta } from "../components/Icones";

import useGrade from "../hooks/useGrade";
import useEstatisticas, { DESDE } from "../hooks/useEstatisticas";
import useEquivalencias from "../hooks/useEquivalencias";
import useTitulo from "../hooks/useTitulo";
import {
  departamento,
  formata,
  indicePorCodigo,
  rotuloCarga,
  rotuloPeriodo,
} from "../utils/disciplinas";

import "./styles/Disciplina.css";

/** Lista de disciplinas como pilulas que levam a pagina de cada uma. */
const Ligacoes = ({ titulo, codigos, indice, vazio, nomes = {} }) => (
  <section className="cartao disciplina-ligacoes">
    <h2 className="disciplina-ligacoes-titulo">{titulo}</h2>
    {codigos.length === 0 ? (
      <p className="disciplina-ligacoes-vazio">{vazio}</p>
    ) : (
      <ul className="disciplina-ligacoes-lista">
        {codigos.map((c) => (
          <li key={c}>
            <Link to={`/disciplinas/${c}`} className="disciplina-ligacao">
              <span>{indice[c] ? indice[c].nome : nomes[c] || c}</span>
              <small>{c}</small>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </section>
);

/**
 * Pagina de uma disciplina. Nao ha mockup dela: segue o desenho das outras
 * telas (titulo, cartoes de resumo, quadro branco) e traz o grafico que o
 * site ja tinha.
 */
function Disciplina() {
  const { codigo } = useParams();
  const navegar = useNavigate();
  const { grade, carregando } = useGrade();
  const { estatisticas } = useEstatisticas();
  const { deNova, deAntiga, nomes2008 } = useEquivalencias();

  const indice = useMemo(() => indicePorCodigo(grade), [grade]);
  const disciplina = indice[codigo];
  const estatistica = estatisticas[codigo];

  useTitulo(disciplina ? disciplina.nome : codigo);

  // Quem tem esta como pre-requisito, na mesma geracao de curriculo.
  const liberadas = useMemo(
    () =>
      Object.values(indice)
        .filter((d) => d.pre_requisitos.includes(codigo))
        .filter((d) => !disciplina || (d.curriculo === 2022) === (disciplina.curriculo === 2022))
        .map((d) => d.codigo),
    [indice, codigo, disciplina]
  );

  const nova = disciplina && disciplina.curriculo === 2022;
  const equivalentes = (nova ? deNova[codigo] : deAntiga[codigo]) || [];
  const outroCurriculo = nova ? "2008" : "2022";

  const nome = disciplina ? disciplina.nome : codigo;

  return (
    <main className="pagina disciplina">
      <button type="button" className="disciplina-voltar" onClick={() => (window.history.length > 1 ? navegar(-1) : navegar("/disciplinas"))}>
        <Seta direcao="esquerda" />
        Voltar
      </button>

      <h1 className="titulo-pagina disciplina-titulo">{nome}</h1>
      <p className="subtitulo-pagina">
        {[
          codigo,
          disciplina ? rotuloPeriodo(disciplina.periodo) : null,
          disciplina ? rotuloCarga(disciplina) : null,
          disciplina ? `Currículo ${nova ? "2022" : "2008"}` : null,
          departamento(codigo) !== "Departamento" ? departamento(codigo) : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {!carregando && !disciplina && (
        <p className="aviso">
          Esta disciplina não está na grade de Engenharia de Computação, mas o
          histórico de turmas aparece abaixo se houver.
        </p>
      )}

      <section className="disciplina-resumo" aria-label="Resumo">
        <CartaoResumo
          tom="verde"
          valor={estatistica ? formata.porcento(estatistica.aprovacao) : "—"}
          rotulo="Aprovação"
          descricao={`Alunos aprovados nas turmas desde ${DESDE}`}
        />
        <CartaoResumo
          tom="rosa"
          valor={estatistica ? formata.porcento(estatistica.reprovacao) : "—"}
          rotulo="Reprovação"
          descricao={`Reprovados por nota ou por falta desde ${DESDE}`}
        />
        <CartaoResumo
          tom="verde"
          valor={estatistica ? formata.decimal(estatistica.media) : "—"}
          rotulo="Média das notas"
          descricao={`Média das notas finais (0 a 10) desde ${DESDE}`}
        />
        <CartaoResumo
          tom="escuro"
          valor={estatistica ? formata.inteiro(estatistica.alunos) : "—"}
          rotulo={`Alunos desde ${DESDE}`}
          descricao={estatistica ? `${estatistica.semestres} semestres com turma` : "Menos de 10 alunos no período"}
        />
      </section>

      {disciplina && (
        <div className="disciplina-ligacoes-grupo">
          <Ligacoes
            titulo="Pré-requisitos"
            codigos={disciplina.pre_requisitos}
            indice={indice}
            vazio="Não tem pré-requisito."
          />
          <Ligacoes
            titulo="É pré-requisito de"
            codigos={liberadas}
            indice={indice}
            vazio="Nenhuma disciplina depende desta."
          />
          <Ligacoes
            titulo={`Equivalente no currículo ${outroCurriculo}`}
            codigos={equivalentes}
            indice={indice}
            vazio="Sem equivalência no PPC."
            nomes={nomes2008}
          />
        </div>
      )}

      <section className="cartao disciplina-quadro">
        <GraficoDisciplina nome={nome} codigo={codigo} />
      </section>
    </main>
  );
}

export default Disciplina;
