"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { chaveBusca, OPTATIVA, rotuloPeriodo } from "@/lib/formato";
import BarraBusca from "./BarraBusca";
import { CartaoDisciplina } from "./Cartoes";

/**
 * Filtros da tela Disciplinas. Período e tipo ficam no endereço: dá para
 * mandar o link de "todas as optativas" para alguém, e o voltar do navegador
 * desfaz o filtro. A busca filtra enquanto se digita e só entra no endereço
 * sem criar uma entrada nova no histórico a cada letra.
 */
export default function ListaDisciplinas({ disciplinas }: { disciplinas: DisciplinaComNumeros[] }) {
  const router = useRouter();
  const caminho = usePathname();
  const parametros = useSearchParams();
  const [busca, setBusca] = useState(parametros.get("busca") ?? "");
  const periodo = parametros.get("periodo") ? Number(parametros.get("periodo")) : null;
  const tipo = parametros.get("tipo");

  const muda = (nome: string, valor: string | null, substituir = false) => {
    const novos = new URLSearchParams(parametros.toString());
    if (valor) novos.set(nome, valor);
    else novos.delete(nome);
    const destino = novos.size ? `${caminho}?${novos}` : caminho;
    if (substituir) router.replace(destino, { scroll: false });
    else router.push(destino, { scroll: false });
  };

  const periodos = Array.from(new Set(disciplinas.map((d) => d.periodo!)))
    .filter((p) => p !== OPTATIVA)
    .sort((a, b) => a - b);

  const termo = chaveBusca(busca).trim();
  const visiveis = disciplinas
    .filter((d) => !termo || chaveBusca(d.nome).includes(termo) || chaveBusca(d.codigo).includes(termo))
    .filter((d) => periodo === null || d.periodo === periodo)
    .filter((d) => tipo !== "OB" || d.obrigatoria)
    .filter((d) => tipo !== "OP" || !d.obrigatoria);

  return (
    <>
      <div className="mt-[25px] flex items-center gap-3.5 max-[900px]:flex-col max-[900px]:items-stretch">
        <BarraBusca
          id="busca-disciplinas"
          className="h-14! min-w-0 flex-1"
          valor={busca}
          aoMudar={(v) => {
            setBusca(v);
            muda("busca", v.trim() || null, true);
          }}
        />
        <div className="flex shrink-0 gap-[11px]">
          <label className="pilula pilula-seletor w-[145px] px-0">
            <span className="sr-only">Período</span>
            <span aria-hidden="true">{periodo === null ? "Todos os períodos" : rotuloPeriodo(periodo)}</span>
            <select value={periodo ?? ""} onChange={(e) => muda("periodo", e.target.value || null)}>
              <option value="">Todos os períodos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>
                  {rotuloPeriodo(p)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-pressed={tipo === "OB"}
            title="Só disciplinas obrigatórias"
            onClick={() => muda("tipo", tipo === "OB" ? null : "OB")}
            className="pilula w-[100px] px-0"
          >
            OB
          </button>
          <button
            type="button"
            aria-pressed={tipo === "OP"}
            title="Só disciplinas optativas"
            onClick={() => muda("tipo", tipo === "OP" ? null : "OP")}
            className="pilula w-[67px] px-0"
          >
            OP
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visiveis.length} disciplinas encontradas
      </p>
      {visiveis.length === 0 && <p className="aviso">Nenhuma disciplina encontrada com esses filtros.</p>}

      <div className="mt-[39px] grid grid-cols-[repeat(auto-fill,300px)] gap-x-[30px] gap-y-[35px] max-celular:mt-6 max-celular:grid-cols-1 max-celular:gap-y-3.5">
        {visiveis.map((d) => (
          <CartaoDisciplina key={d.codigo} d={d} />
        ))}
      </div>
    </>
  );
}
