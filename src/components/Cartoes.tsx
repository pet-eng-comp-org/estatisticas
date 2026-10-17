import Link from "next/link";
import type { ReactNode } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { AREAS, areaDe } from "@/lib/curriculos/matriz";
import { formata, rotuloPeriodo } from "@/lib/formato";
import { Ponto, Simbolo } from "./Icones";

/*
 * Cartões do mockup. As posições são absolutas e em pixels porque foram
 * medidas no Figma: o nome fica centrado numa faixa fixa (uma ou duas
 * linhas) e o resto do cartão não se mexe com o tamanho dele.
 */

// A escala da dificuldade vai de 1 a 5: a barra vazia é 1, não 0.
const fracaoDificuldade = (d: number | null) => (d === null ? 0 : (d - 1) / 4);

const largura = (fracao: number | null | undefined) => `${Math.round(Math.max(0, Math.min(1, fracao ?? 0)) * 100)}%`;

/**
 * Rótulo com a interrogação no fim. A última palavra e o botão não se
 * separam: se o rótulo quebrar, a interrogação desce junto em vez de ficar
 * sozinha na linha de baixo (o espaço inquebrável não basta, o navegador
 * quebra antes do botão mesmo assim).
 */
function ComAjuda({ rotulo, ajuda }: { rotulo: string; ajuda: ReactNode }) {
  const corte = rotulo.lastIndexOf(" ") + 1;
  return (
    <>
      {rotulo.slice(0, corte)}
      <span className="whitespace-nowrap">
        {rotulo.slice(corte)} {ajuda}
      </span>
    </>
  );
}

/** Número grande da tela inicial e da página da disciplina. */
export function CartaoResumo({
  valor,
  rotulo,
  cor,
  descricao,
  ajuda,
}: {
  valor: string;
  rotulo: string;
  cor: "rosa" | "verde" | "escuro";
  descricao?: string;
  ajuda?: ReactNode;
}) {
  const icone = {
    rosa: "bg-rosa-claro text-rosa-vivo",
    verde: "bg-verde-claro text-verde",
    escuro: "bg-rosa-claro text-rosa",
  }[cor];
  return (
    <div
      // Com a ajuda ao lado do rótulo, o title repetiria o balão dela.
      title={ajuda ? undefined : descricao}
      className="cartao flex h-[111px] items-center gap-[18px] px-[17px] max-celular:h-auto max-celular:flex-col max-celular:items-start max-celular:gap-2.5 max-celular:px-3 max-celular:py-3.5"
    >
      <span className={`mt-[33px] flex h-[38px] w-12 shrink-0 items-center justify-center self-start rounded-xl max-celular:mt-0 ${icone}`}>
        <Ponto />
      </span>
      <span className="mt-[30px] flex min-w-0 flex-col self-start max-celular:mt-0">
        <span className="mb-0.5 text-3xl leading-8 font-bold text-vinho max-celular:text-[26px]">{valor}</span>{" "}
        <span className="text-[15px] leading-[18px] font-bold text-cinza max-celular:text-[13px] max-celular:leading-4">
          {ajuda ? <ComAjuda rotulo={rotulo} ajuda={ajuda} /> : rotulo}
        </span>
      </span>
    </div>
  );
}

/** Quadrado com o símbolo da área, nas cores dela na legenda da Grade. */
function IconeDisciplina({ d }: { d: DisciplinaComNumeros }) {
  const area = areaDe(d);
  const cor = AREAS[area];
  return (
    <span
      aria-hidden="true"
      title={cor.nome}
      className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border"
      style={{ background: cor.fundo, borderColor: cor.faixa, color: cor.borda }}
    >
      <Simbolo area={area} />
    </span>
  );
}

/** Cartão da tela Disciplinas, com o símbolo da área ao lado do nome. */
export function CartaoDisciplina({ d }: { d: DisciplinaComNumeros }) {
  const n = d.numeros;
  const dificuldade = n?.dificuldade ?? null;
  return (
    <Link
      href={`/disciplinas/${d.codigo}`}
      className="cartao flex min-h-[180px] w-[300px] flex-col pt-[17px] pr-3.5 pb-[18px] pl-[21px] text-vinho no-underline transition hover:border-rosa hover:shadow-[0_4px_14px_rgba(128,12,51,0.08)] max-celular:w-full"
    >
      {/* O nome quebra de linha em vez de ser cortado (pedido da Bia); com
          duas linhas, o cartão cresce e o resto desce junto. */}
      <span className="flex items-center gap-3">
        <IconeDisciplina d={d} />
        <span className="flex min-w-0 flex-col">
          <span className="text-[17px] leading-[21px] font-bold">{d.nome}</span>
          <span className="mt-[5px] text-xs leading-[15px] text-cinza">
            {d.codigo} · {rotuloPeriodo(d.periodo)}
          </span>
        </span>
      </span>

      <span className="mt-5 mr-[35px] flex items-baseline justify-between max-celular:mr-[7px]">
        <span className="text-[13px] leading-4 font-bold text-cinza">Dificuldade</span>
        <span className="text-base leading-[19px] font-bold text-rosa">{formata.decimal(dificuldade)}</span>
      </span>
      <span aria-hidden="true" className="barra mt-2 w-64 max-celular:mr-[7px] max-celular:w-auto">
        <span style={{ width: largura(fracaoDificuldade(dificuldade)) }} />
      </span>

      <span className="mt-4 mr-[35px] flex items-baseline justify-between max-celular:mr-[7px]">
        <span className="text-[13px] leading-4 font-bold text-cinza">Aprovação</span>
        <span className="text-base leading-[19px] font-bold text-verde">{formata.porcento(n?.aprovacao)}</span>
      </span>
      <span aria-hidden="true" className="barra barra-verde mt-2 w-64 max-celular:mr-[7px] max-celular:w-auto">
        <span style={{ width: largura(n?.aprovacao) }} />
      </span>
      {/* A linha "Sem avaliações ainda" do mockup (com a Estrela) volta
          quando as avaliações das disciplinas abrirem. */}
    </Link>
  );
}
