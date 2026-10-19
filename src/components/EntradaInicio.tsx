"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OPTATIVA, rotuloPeriodo } from "@/lib/formato";
import BarraBusca from "./BarraBusca";

/**
 * Parte de baixo da tela inicial: a busca e um atalho por período, os dois
 * levando à tela Disciplinas. A inicial listava todas as disciplinas, com
 * busca e filtros, e repetia a tela Disciplinas (que ainda mostra aprovação e
 * ordenação); agora ela só leva até lá.
 */
export default function EntradaInicio({ periodos }: { periodos: { periodo: number; quantidade: number }[] }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const buscar = (texto: string) => {
    const t = texto.trim();
    router.push(t ? `/disciplinas?busca=${encodeURIComponent(t)}` : "/disciplinas");
  };

  return (
    <>
      <BarraBusca
        id="busca-inicio"
        className="mt-[50px] max-celular:mt-8"
        valor={busca}
        aoMudar={setBusca}
        aoEnviar={buscar}
        soNoComputador
      >
        <button type="submit" className="pilula min-w-[100px]">
          Buscar
        </button>
      </BarraBusca>

      <section aria-labelledby="por-periodo" className="mt-12">
        <h2 id="por-periodo" className="text-[28px] leading-[34px] font-bold text-vinho max-celular:text-2xl">
          Disciplinas por período
        </h2>
        <ul className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 max-celular:grid-cols-2 max-celular:gap-3">
          {periodos.map(({ periodo, quantidade }) => (
            <li key={periodo}>
              <Link
                href={periodo === OPTATIVA ? "/disciplinas?tipo=OP" : `/disciplinas?periodo=${periodo}`}
                className="flex flex-col cartao px-5 py-4 text-vinho no-underline transition hover:border-rosa hover:shadow-[0_4px_14px_rgba(128,12,51,0.08)]"
              >
                <span className="text-lg leading-[22px] font-bold">
                  {periodo === OPTATIVA ? "Optativas" : rotuloPeriodo(periodo)}
                </span>
                <span className="mt-1 text-[13px] leading-4 text-cinza">
                  {quantidade} {quantidade === 1 ? "disciplina" : "disciplinas"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/disciplinas" className="mt-6 inline-block text-base font-bold text-rosa">
          Ver todas as disciplinas
        </Link>
      </section>
    </>
  );
}
