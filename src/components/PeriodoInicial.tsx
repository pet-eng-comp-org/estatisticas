"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { chaveBusca, OPTATIVA, rotuloPeriodo } from "@/lib/formato";
import BarraBusca from "./BarraBusca";
import { CartaoInicio } from "./Cartoes";

/**
 * Parte de baixo da tela inicial: busca e os cartões. Sem filtro, mostra
 * todos os períodos, um bloco por período e as optativas no fim (pedido da
 * Bia: a pessoa filtra se quiser). Com texto na busca, uma lista só com os
 * resultados. Enter leva a busca para a tela Disciplinas.
 */
export default function PeriodoInicial({ disciplinas }: { disciplinas: DisciplinaComNumeros[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState<number | null>(null);
  const [soObrigatorias, setSoObrigatorias] = useState(false);

  const periodos = Array.from(new Set(disciplinas.map((d) => d.periodo!))).sort((a, b) => a - b);
  const termo = chaveBusca(busca).trim();
  const filtradas = disciplinas
    .filter((d) => !termo || chaveBusca(d.nome).includes(termo) || chaveBusca(d.codigo).includes(termo))
    .filter((d) => termo || periodo === null || d.periodo === periodo)
    .filter((d) => !soObrigatorias || d.obrigatoria);

  // Com busca, um bloco só; sem busca, um por período, na ordem da grade.
  const blocos = termo
    ? [{ titulo: "Resultados da busca", lista: filtradas }]
    : periodos
        .map((p) => ({
          titulo: p === OPTATIVA ? "Optativas" : rotuloPeriodo(p),
          lista: filtradas.filter((d) => d.periodo === p),
        }))
        .filter((b) => b.lista.length > 0);

  return (
    <>
      <BarraBusca
        id="busca-inicio"
        className="mt-[50px] max-celular:mt-8"
        valor={busca}
        aoMudar={setBusca}
        aoEnviar={(t) => t.trim() && router.push(`/disciplinas?busca=${encodeURIComponent(t.trim())}`)}
      >
        <label className="pilula pilula-seletor min-w-32 px-4">
          <span className="sr-only">Período mostrado</span>
          <span aria-hidden="true">
            {periodo === null ? "Todos os períodos" : periodo === OPTATIVA ? "Optativas" : rotuloPeriodo(periodo)}
          </span>
          <select
            value={periodo ?? ""}
            onChange={(e) => {
              setPeriodo(e.target.value === "" ? null : Number(e.target.value));
              setBusca("");
            }}
          >
            <option value="">Todos os períodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p === OPTATIVA ? "Optativas" : rotuloPeriodo(p)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          aria-pressed={soObrigatorias}
          title="Mostrar só disciplinas obrigatórias"
          onClick={() => setSoObrigatorias((v) => !v)}
          className="pilula min-w-[100px]"
        >
          Obrigatórias
        </button>
        <Link href="/disciplinas" className="pilula min-w-[100px]">
          Filtros
        </Link>
      </BarraBusca>

      <div aria-live="polite">
        {blocos.length === 0 && <p className="aviso mt-6">Nenhuma disciplina encontrada.</p>}
        {blocos.map((b, i) => (
          <section key={b.titulo} className={i === 0 ? "mt-6" : "mt-12"}>
            <h2 className="text-[28px] leading-[34px] font-bold text-vinho max-celular:text-2xl">{b.titulo}</h2>
            <div className="mt-6 grid grid-cols-[repeat(auto-fill,300px)] gap-[26px] max-celular:grid-cols-1 max-celular:gap-3.5">
              {b.lista.map((d) => (
                <CartaoInicio key={d.codigo} d={d} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
