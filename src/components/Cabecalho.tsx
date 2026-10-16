"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { escolherCurriculo } from "@/app/acoes";
import { EQUIVALENCIAS } from "@/lib/curriculos/equivalencias";
import { Logo } from "./Icones";

const SECOES = [
  { caminho: "/", rotulo: "Início", espaco: "" },
  { caminho: "/grade", rotulo: "Grade", espaco: "ml-[39px]" },
  { caminho: "/disciplinas", rotulo: "Disciplinas", espaco: "ml-[23px]" },
  { caminho: "/comparar", rotulo: "Comparar currículos", curto: "Comparar", espaco: "ml-[15px]" },
];

/**
 * Na página de uma disciplina, trocar o currículo leva à equivalente do outro
 * (pelo PPC): quem está em Cálculo I de 2008 e clica em 2022 quer ver o
 * Cálculo I de 2022. Sem equivalente, ou se a disciplina já é do currículo
 * escolhido, fica onde está.
 */
function equivalente(caminho: string, ano: "2008" | "2022"): string | null {
  const codigo = /^\/disciplinas\/([A-Z]{3}\d{5})$/.exec(caminho)?.[1];
  if (!codigo) return null;
  const par = EQUIVALENCIAS.find(([nova, antiga]) => (ano === "2022" ? antiga : nova) === codigo);
  if (!par) return null;
  return `/disciplinas/${ano === "2022" ? par[0] : par[1]}`;
}

/** Currículo da disciplina aberta, quando dá para saber pelas equivalências. */
function curriculoDaPagina(caminho: string): "2008" | "2022" | null {
  const codigo = /^\/disciplinas\/([A-Z]{3}\d{5})$/.exec(caminho)?.[1];
  if (!codigo) return null;
  if (EQUIVALENCIAS.some(([nova]) => nova === codigo)) return "2022";
  if (EQUIVALENCIAS.some(([, antiga]) => antiga === codigo)) return "2008";
  return null;
}

const ativa = (atual: string, caminho: string) =>
  caminho === "/" ? atual === "/" : atual === caminho || atual.startsWith(`${caminho}/`);

/**
 * Cabeçalho do mockup. O espaçamento entre os itens do menu não é uniforme
 * no desenho; foi copiado da tela inicial. No celular os itens se espalham
 * pela largura e "Comparar currículos" vira "Comparar", para os quatro caberem
 * em 320px sem precisar rolar. O botão 2008/2022 vale para o site inteiro e
 * fica num cookie; é um controle segmentado (um só trilho, com o destaque
 * deslizando para o ano marcado) para deixar claro que vale um ou outro. No
 * celular o título quebra em duas linhas para os anos caberem ao lado do logo.
 */
export default function Cabecalho({ curriculo }: { curriculo: 2008 | 2022 }) {
  const atual = usePathname();
  const router = useRouter();
  const [, iniciar] = useTransition();
  const [escolhido, setEscolhido] = useOptimistic(String(curriculo));
  // Na página de uma disciplina, o botão marca o currículo dela, não a
  // preferência guardada: senão uma disciplina de 2008 aparecia com 2022
  // marcado, e clicar em 2022 parecia não fazer nada.
  const marcado = curriculoDaPagina(atual) ?? escolhido;

  return (
    <header className="border-b border-borda bg-white">
      <div className="mx-auto flex h-[85px] max-w-[1440px] items-center pr-9 pl-[34px] max-[1180px]:h-auto max-[1180px]:flex-wrap max-[1180px]:gap-y-2.5 max-[1180px]:px-8 max-[1180px]:pt-4 max-celular:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-4 no-underline max-celular:min-w-0 max-celular:gap-2.5">
          <Logo />
          <span className="flex flex-col">
            <span className="text-2xl leading-[29px] font-bold text-vinho uppercase max-celular:text-base max-celular:leading-5">
              Estatísticas de <span className="max-celular:block">disciplinas</span>
            </span>
            <span className="mt-[3px] text-sm leading-[17px] font-bold text-rosa max-celular:mt-0.5 max-celular:text-xs">
              <span className="max-celular:hidden">Engenharia</span>
              <abbr title="Engenharia" className="no-underline celular:hidden">
                Eng.
              </abbr>{" "}
              de Computação Ufes
            </span>
          </span>
        </Link>

        <nav
          aria-label="Seções do site"
          className="ml-auto flex items-center pt-[7px] max-[1180px]:order-3 max-[1180px]:-mx-8 max-[1180px]:w-[calc(100%+4rem)] max-[1180px]:overflow-x-auto max-[1180px]:px-8 max-[1180px]:pb-2.5 max-celular:-mx-4 max-celular:w-[calc(100%+2rem)] max-celular:justify-between max-celular:gap-3 max-celular:px-4"
        >
          {SECOES.map((s) => (
            <Link
              key={s.caminho}
              href={s.caminho}
              aria-current={ativa(atual, s.caminho) ? "page" : undefined}
              className={`${s.espaco} rounded py-1.5 max-celular:ml-0 text-[15px] leading-[18px] font-bold whitespace-nowrap text-cinza no-underline hover:text-vinho aria-[current=page]:text-vinho`}
            >
              {s.curto ? (
                <>
                  <span className="max-celular:hidden">{s.rotulo}</span>
                  <span className="celular:hidden">{s.curto}</span>
                </>
              ) : (
                s.rotulo
              )}
            </Link>
          ))}
        </nav>

        <div
          role="group"
          aria-label="Currículo"
          className="relative ml-[59px] grid shrink-0 grid-cols-2 rounded-full bg-rosa-claro p-1 max-[1180px]:ml-auto"
        >
          <span
            aria-hidden
            className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-vinho transition-transform duration-200 motion-reduce:transition-none ${marcado === "2022" ? "translate-x-full" : ""}`}
          />
          {(["2008", "2022"] as const).map((ano) => (
            <button
              key={ano}
              type="button"
              aria-pressed={marcado === ano}
              title={ano === "2022" ? "Currículo em vigor desde 2022" : "Currículo anterior, de 2008"}
              onClick={() =>
                iniciar(async () => {
                  setEscolhido(ano);
                  await escolherCurriculo(ano);
                  const destino = equivalente(atual, ano);
                  if (destino) router.push(destino);
                })
              }
              className="relative h-[34px] w-[84px] cursor-pointer rounded-full text-sm font-bold text-rosa transition-colors duration-200 not-aria-pressed:hover:text-vinho focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vinho aria-pressed:text-white motion-reduce:transition-none max-celular:h-[30px] max-celular:w-[52px] max-celular:text-[13px]"
            >
              {ano}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
