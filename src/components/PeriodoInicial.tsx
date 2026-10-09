"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { chaveBusca, OPTATIVA, rotuloPeriodo } from "@/lib/formato";
import BarraBusca from "./BarraBusca";
import { CartaoInicio } from "./Cartoes";

/**
 * Parte de baixo da tela inicial: busca e os cartões de um período. Com texto
 * na busca, procura no currículo inteiro; sem texto, mostra o período da
 * pílula. Enter leva a busca para a tela Disciplinas.
 */
export default function PeriodoInicial({ disciplinas }: { disciplinas: DisciplinaComNumeros[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState(1);
  const [soObrigatorias, setSoObrigatorias] = useState(false);

  const periodos = Array.from(new Set(disciplinas.map((d) => d.periodo!))).sort((a, b) => a - b);
  const termo = chaveBusca(busca).trim();
  const visiveis = disciplinas
    .filter((d) =>
      termo ? chaveBusca(d.nome).includes(termo) || chaveBusca(d.codigo).includes(termo) : d.periodo === periodo,
    )
    .filter((d) => !soObrigatorias || d.obrigatoria);

  return (
    <>
      <BarraBusca
        id="busca-inicio"
        className="mt-[50px] max-celular:mt-8"
        valor={busca}
        aoMudar={setBusca}
        aoEnviar={(t) => t.trim() && router.push(`/disciplinas?busca=${encodeURIComponent(t.trim())}`)}
      >
        <label className="pilula pilula-seletor min-w-32">
          <span className="sr-only">Período mostrado</span>
          <span aria-hidden="true">{rotuloPeriodo(periodo)}</span>
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(Number(e.target.value));
              setBusca("");
            }}
          >
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
          OB
        </button>
        <Link href="/disciplinas" className="pilula min-w-[100px]">
          Filtros
        </Link>
      </BarraBusca>

      <section aria-live="polite">
        <h2 className="mt-6 text-[28px] leading-[34px] font-bold text-vinho max-celular:text-2xl">
          {termo ? "Resultados da busca" : rotuloPeriodo(periodo)}
        </h2>
        {visiveis.length === 0 && <p className="aviso">Nenhuma disciplina encontrada.</p>}
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,300px)] gap-[26px] max-celular:grid-cols-1 max-celular:gap-3.5">
          {visiveis.map((d) => (
            <CartaoInicio key={d.codigo} d={d} />
          ))}
        </div>
      </section>
    </>
  );
}
