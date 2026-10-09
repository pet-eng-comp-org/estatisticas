"use client";

import Link from "next/link";
import { useState } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { chaveBusca, formata, OPTATIVA, rotuloPeriodo } from "@/lib/formato";
import BarraBusca from "./BarraBusca";
import { Seta } from "./Icones";

type Lado = Pick<DisciplinaComNumeros, "codigo" | "nome" | "numeros" | "periodo" | "cargaHoraria">;
export type LinhaComparacao = { nova: DisciplinaComNumeros; antigas: Lado[] };

function Ponta({ d, ano }: { d: Lado; ano: string }) {
  const n = d.numeros;
  return (
    <Link
      href={`/disciplinas/${d.codigo}`}
      className="flex flex-col rounded-xl px-3.5 pt-3.5 pb-4 text-vinho no-underline transition hover:bg-rosa-fundo"
    >
      <span className="self-start rounded-[10px] bg-rosa-claro px-2.5 py-0.5 text-xs leading-4 font-bold text-rosa">{ano}</span>
      <span className="mt-2 text-base leading-5 font-bold">{d.nome}</span>
      <span className="mt-1 text-xs leading-[15px] text-cinza">
        {[d.codigo, d.periodo ? rotuloPeriodo(d.periodo) : null, d.cargaHoraria ? `${d.cargaHoraria}h` : null]
          .filter(Boolean)
          .join(" · ")}
      </span>
      <span className="mt-3.5 mb-1.5 flex items-baseline justify-between text-[13px] font-bold text-cinza">
        <span>Aprovação</span>
        <b className="text-base text-verde">{formata.porcento(n?.aprovacao)}</b>
      </span>
      <span aria-hidden="true" className="barra barra-verde">
        <span style={{ width: `${Math.round((n?.aprovacao ?? 0) * 100)}%` }} />
      </span>
      <span className="mt-2.5 text-xs font-bold text-cinza">
        {n
          ? `Dificuldade ${formata.decimal(n.dificuldade)} · média ${formata.decimal(n.media)} · ${formata.inteiro(n.alunos)} alunos`
          : "Sem turmas suficientes desde 2018"}
      </span>
    </Link>
  );
}

/** Aprovação somada das antigas, ponderada pelos alunos. */
function aprovacaoDe(lados: Lado[]) {
  let alunos = 0;
  let aprovados = 0;
  for (const l of lados) {
    if (!l.numeros) continue;
    alunos += l.numeros.alunos;
    aprovados += l.numeros.aprovados;
  }
  return alunos ? aprovados / alunos : null;
}

export default function ComparacaoCurriculos({ linhas }: { linhas: LinhaComparacao[] }) {
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<number | null>(null);

  const periodos = Array.from(new Set(linhas.map((l) => l.nova.periodo!))).sort((a, b) => a - b);
  const termo = chaveBusca(busca).trim();
  // A busca vale para os dois lados: procurar "Estrutura de Dados I" acha
  // Estruturas de Dados, a nova que a substituiu.
  const casa = (l: LinhaComparacao) =>
    !termo || [l.nova, ...l.antigas].some((x) => chaveBusca(x.nome).includes(termo) || chaveBusca(x.codigo).includes(termo));
  const filtradas = linhas.filter((l) => (periodo === null || l.nova.periodo === periodo) && casa(l));

  const grupos: { periodo: number; linhas: LinhaComparacao[] }[] = [];
  for (const l of filtradas.filter((x) => x.antigas.length > 0)) {
    const ultimo = grupos.at(-1);
    if (ultimo?.periodo === l.nova.periodo) ultimo.linhas.push(l);
    else grupos.push({ periodo: l.nova.periodo!, linhas: [l] });
  }
  const semPar = filtradas.filter((l) => l.antigas.length === 0);

  const titulo = (p: number) => (p === OPTATIVA ? "Optativas" : rotuloPeriodo(p));

  return (
    <>
      <div className="mt-[25px] flex items-center gap-3.5 max-celular:flex-col max-celular:items-stretch">
        <BarraBusca id="busca-comparar" className="h-14! min-w-0 flex-1" valor={busca} aoMudar={setBusca} />
        <label className="pilula pilula-seletor w-[145px] px-0 max-celular:w-auto">
          <span className="sr-only">Período no currículo 2022</span>
          <span aria-hidden="true">{periodo === null ? "Todos os períodos" : titulo(periodo)}</span>
          <select value={periodo ?? ""} onChange={(e) => setPeriodo(e.target.value === "" ? null : Number(e.target.value))}>
            <option value="">Todos os períodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {titulo(p)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtradas.length === 0 && <p className="aviso">Nenhuma disciplina encontrada.</p>}

      {grupos.map((g) => (
        <section key={g.periodo} className="mt-10">
          <h2 className="text-lg leading-[22px] font-bold text-vinho">
            {titulo(g.periodo)} <small className="text-sm font-normal text-cinza">no currículo 2022</small>
          </h2>
          <span aria-hidden="true" className="mt-2.5 block h-2 rounded bg-rosa-claro" />
          <ul className="mt-5 grid grid-cols-2 gap-5 max-[1100px]:grid-cols-1">
            {g.linhas.map(({ nova, antigas }) => {
              const antes = aprovacaoDe(antigas);
              const depois = nova.numeros?.aprovacao ?? null;
              const diferenca = antes !== null && depois !== null ? Math.round((depois - antes) * 100) : null;
              return (
                <li
                  key={nova.codigo}
                  className="cartao grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center p-2 max-celular:grid-cols-1"
                >
                  <div className="flex flex-col gap-2">
                    {antigas.map((a) => (
                      <Ponta key={a.codigo} d={a} ano="2008" />
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-2 text-seta max-celular:flex-row max-celular:justify-center">
                    <span className="max-celular:rotate-90">
                      <Seta tamanho={22} />
                    </span>
                    {diferenca !== null && (
                      <span
                        title="Diferença na aprovação, em pontos percentuais"
                        className={`rounded-[10px] px-2 py-[3px] text-xs leading-4 font-bold whitespace-nowrap ${diferenca >= 0 ? "bg-verde-claro text-verde-escuro" : "bg-rosa-claro text-rosa"}`}
                      >
                        {diferenca > 0 ? "+" : diferenca < 0 ? "−" : "±"}
                        {Math.abs(diferenca)} p.p.
                      </span>
                    )}
                  </div>
                  <Ponta d={nova} ano="2022" />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {semPar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg leading-[22px] font-bold text-vinho">Sem equivalente em 2008</h2>
          <span aria-hidden="true" className="mt-2.5 block h-2 rounded bg-rosa-claro" />
          <p className="mt-4 text-[15px] text-cinza">
            Disciplinas novas do currículo 2022, que o PPC não liga a nenhuma de 2008.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {semPar.map(({ nova }) => (
              <li key={nova.codigo}>
                <Link
                  href={`/disciplinas/${nova.codigo}`}
                  className="inline-flex items-baseline gap-1.5 rounded-full border border-borda bg-white px-3.5 py-2 text-sm font-bold text-vinho no-underline hover:border-rosa"
                >
                  <span>{nova.nome}</span>
                  <small className="text-[11px] font-normal text-cinza">{nova.codigo}</small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
