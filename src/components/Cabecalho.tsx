"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { escolherCurriculo } from "@/app/acoes";
import { Logo } from "./Icones";

const SECOES = [
  { caminho: "/", rotulo: "Início", espaco: "" },
  { caminho: "/grade", rotulo: "Grade", espaco: "ml-[39px]" },
  { caminho: "/disciplinas", rotulo: "Disciplinas", espaco: "ml-[23px]" },
  { caminho: "/comparar", rotulo: "Comparar currículos", espaco: "ml-[15px]" },
];

const ativa = (atual: string, caminho: string) =>
  caminho === "/" ? atual === "/" : atual === caminho || atual.startsWith(`${caminho}/`);

/**
 * Cabeçalho do mockup. O espaçamento entre os itens do menu não é uniforme
 * no desenho; foi copiado da tela inicial. O botão 2008/2022 vale para o site
 * inteiro e fica num cookie.
 */
export default function Cabecalho({ curriculo }: { curriculo: 2008 | 2022 }) {
  const atual = usePathname();
  const [, iniciar] = useTransition();
  const [escolhido, setEscolhido] = useOptimistic(String(curriculo));

  return (
    <header className="border-b border-borda bg-white">
      <div className="mx-auto flex h-[85px] max-w-[1440px] items-center pr-9 pl-[34px] max-[1180px]:h-auto max-[1180px]:flex-wrap max-[1180px]:gap-y-2.5 max-[1180px]:px-8 max-[1180px]:pt-4 max-celular:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-4 no-underline max-celular:min-w-0 max-celular:gap-2.5">
          <Logo />
          <span className="flex flex-col pt-2 max-celular:pt-0">
            <span className="text-2xl leading-[29px] font-bold text-vinho uppercase max-celular:text-base max-celular:leading-5">
              Estatísticas de disciplinas
            </span>
            <span className="mt-[3px] text-sm leading-[17px] font-bold text-rosa max-celular:mt-0 max-celular:text-xs">
              Engenharia de Computação UFES
            </span>
          </span>
        </Link>

        <nav
          aria-label="Seções do site"
          className="ml-auto flex items-center pt-[7px] max-[1180px]:order-3 max-[1180px]:-mx-8 max-[1180px]:w-[calc(100%+4rem)] max-[1180px]:overflow-x-auto max-[1180px]:px-8 max-[1180px]:pb-2.5 max-celular:-mx-4 max-celular:w-[calc(100%+2rem)] max-celular:px-4"
        >
          {SECOES.map((s) => (
            <Link
              key={s.caminho}
              href={s.caminho}
              aria-current={ativa(atual, s.caminho) ? "page" : undefined}
              className={`${s.espaco} rounded py-1.5 text-[15px] leading-[18px] font-bold whitespace-nowrap text-cinza no-underline hover:text-vinho aria-[current=page]:text-vinho`}
            >
              {s.rotulo}
            </Link>
          ))}
        </nav>

        <div role="group" aria-label="Currículo" className="ml-[59px] flex shrink-0 gap-2 max-[1180px]:ml-auto">
          {(["2008", "2022"] as const).map((ano) => (
            <button
              key={ano}
              type="button"
              aria-pressed={escolhido === ano}
              title={ano === "2022" ? "Currículo em vigor desde 2022" : "Currículo anterior, de 2008"}
              onClick={() =>
                iniciar(async () => {
                  setEscolhido(ano);
                  await escolherCurriculo(ano);
                })
              }
              className="h-[38px] min-w-[88px] cursor-pointer rounded-full bg-rosa-claro px-[25px] text-sm font-bold text-rosa aria-pressed:min-w-[98px] aria-pressed:bg-vinho aria-pressed:text-white max-celular:h-[34px] max-celular:min-w-0 max-celular:px-3 max-celular:aria-pressed:min-w-0"
            >
              {ano}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
