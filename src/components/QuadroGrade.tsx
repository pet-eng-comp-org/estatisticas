"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import type { DisciplinaComNumeros } from "@/lib/notas/consultas";
import { AREAS, HORAS_OPTATIVA, MATRIZ_2022, OPTATIVAS_2022, areaDe, type Area } from "@/lib/curriculos/matriz";
import { formata, rotuloCarga, rotuloPeriodo } from "@/lib/formato";
import { desenhar, rotasDeReferencia, rotear, type Ligacao } from "@/lib/grade/rotas";
import { SETAS_2022 } from "@/lib/curriculos/setas-2022";
import BarraRolagem from "./BarraRolagem";

type Cartao = { tipo: "disciplina"; d: DisciplinaComNumeros; area: Area } | { tipo: "optativa"; chave: string };
type Coluna = { periodo: number; linhas: (Cartao | null)[] };
type Posicao = { esquerda: number; direita: number; topo: number; meio: number; coluna: number; linha: number };


/** Posições da matriz oficial (2022), com os espaços de optativa. */
function montarOficial(disciplinas: DisciplinaComNumeros[]): Coluna[] {
  const colunas = new Map<number, (Cartao | null)[]>();
  const coloca = (periodo: number, linha: number, c: Cartao) => {
    if (!colunas.has(periodo)) colunas.set(periodo, []);
    colunas.get(periodo)![linha] = c;
  };
  // Disciplina que entrar numa revisão futura sem lugar no desenho vai para o
  // fim da coluna dela, em vez de sumir.
  const semLugar: DisciplinaComNumeros[] = [];
  for (const d of disciplinas) {
    const lugar = MATRIZ_2022[d.codigo];
    if (lugar) coloca(d.periodo!, lugar.linha, { tipo: "disciplina", d, area: lugar.area });
    else semLugar.push(d);
  }
  OPTATIVAS_2022.forEach((o, i) => coloca(o.periodo, o.linha, { tipo: "optativa", chave: `opt-${i}` }));
  for (const d of semLugar) {
    const col = colunas.get(d.periodo!) ?? [];
    colunas.set(d.periodo!, col);
    col[col.length] = { tipo: "disciplina", d, area: areaDe(d) };
  }
  return Array.from(colunas, ([periodo, linhas]) => ({ periodo, linhas: Array.from(linhas, (c) => c ?? null) })).sort(
    (a, b) => a.periodo - b.periodo,
  );
}

/** Grade do currículo 2022, no desenho da matriz oficial do DI. */
export default function QuadroGrade({ disciplinas }: { disciplinas: DisciplinaComNumeros[] }) {
  const colunas = useMemo(() => montarOficial(disciplinas), [disciplinas]);
  const siglas = (c: string) => MATRIZ_2022[c]?.sigla ?? c;

  // Posição de cada cartão dentro da área rolável, medida depois do layout:
  // as setas são desenhadas por cima, num SVG do mesmo tamanho.
  const areaRef = useRef<HTMLDivElement>(null);
  const [posicoes, setPosicoes] = useState<Record<string, Posicao>>({});
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });
  const [destaque, setDestaque] = useState<string | null>(null);

  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const mede = () => {
      const base = area.getBoundingClientRect();
      const novas: Record<string, Posicao> = {};
      area.querySelectorAll<HTMLElement>("[data-codigo]").forEach((el) => {
        const r = el.getBoundingClientRect();
        novas[el.dataset.codigo!] = {
          esquerda: r.left - base.left + area.scrollLeft,
          direita: r.right - base.left + area.scrollLeft,
          topo: r.top - base.top,
          meio: r.top - base.top + r.height / 2,
          coluna: Number(el.dataset.coluna),
          linha: Number(el.dataset.linha),
        };
      });
      setPosicoes(novas);
      setTamanho({ largura: area.scrollWidth, altura: area.scrollHeight });
    };
    mede();
    const observador = new ResizeObserver(mede);
    observador.observe(area);
    return () => observador.disconnect();
  }, [colunas]);

  // Todas as ligações entram no traçado, mesmo as escondidas: assim os
  // trilhos não mudam de lugar quando uma aparece com o mouse.
  const rotas = useMemo(() => {
    const livre = (c: number, l: number) => !colunas[c]?.linhas[l];
    const ligacoes: Ligacao[] = [];
    for (const coluna of colunas) {
      for (const cartao of coluna.linhas) {
        if (cartao?.tipo !== "disciplina") continue;
        const { d } = cartao;
        const etiquetas = MATRIZ_2022[d.codigo]?.etiquetas ?? [];
        for (const pre of d.preRequisitos) {
          if (etiquetas.includes(pre)) continue;
          const o = posicoes[pre];
          const p = posicoes[d.codigo];
          if (!o || !p || o.coluna >= p.coluna) continue;
          ligacoes.push({ de: pre, para: d.codigo });
        }
      }
    }
    // O percurso de cada seta é o da matriz oficial. O que ela
    // não tiver (seta nova de uma revisão da grade) usa o traçado próprio.
    const copiadas = rotasDeReferencia(SETAS_2022, ligacoes, posicoes);
    const feitas = new Set(copiadas.map((r) => `${r.de}>${r.para}`));
    const resto = rotear(
      ligacoes.filter((l) => !feitas.has(`${l.de}>${l.para}`)),
      posicoes,
      livre,
    );
    return [...copiadas, ...resto];
  }, [colunas, posicoes]);

  const ligada = (a: Ligacao) => destaque !== null && (a.de === destaque || a.para === destaque);
  const visiveis = rotas;
  // Os saltinhos dependem de quais linhas estão à mostra.
  const caminhos = desenhar(visiveis);

  // Co-requisitos: pré-requisito um do outro no mesmo período (os dois
  // Projetos Integrados II). A matriz oficial liga os dois com uma seta de
  // duas pontas, na vertical; o traçado do rotas.ts só cuida de colunas
  // diferentes.
  const corequisitos = useMemo(() => {
    const pares: { de: string; para: string; d: string }[] = [];
    const vistos = new Set<string>();
    for (const coluna of colunas)
      for (const c of coluna.linhas) {
        if (c?.tipo !== "disciplina") continue;
        for (const pre of c.d.preRequisitos) {
          const a = posicoes[pre];
          const b = posicoes[c.d.codigo];
          const chave = [pre, c.d.codigo].sort().join("~");
          if (!a || !b || a.coluna !== b.coluna || vistos.has(chave)) continue;
          vistos.add(chave);
          const [cima, baixo] = a.topo < b.topo ? [a, b] : [b, a];
          const x = (cima.esquerda + cima.direita) / 2;
          const fundo = cima.meio + (cima.meio - cima.topo);
          pares.push({ de: pre, para: c.d.codigo, d: `M${x} ${fundo + 3}V${baixo.topo - 3}` });
        }
      }
    return pares;
  }, [colunas, posicoes]);

  // Carga por área, para a legenda, como na matriz oficial.
  const horasPorArea = new Map<Area, number>();
  for (const col of colunas)
    for (const c of col.linhas) {
      if (!c) continue;
      const area = c.tipo === "optativa" ? "optativa" : c.area;
      const horas = c.tipo === "optativa" ? HORAS_OPTATIVA : (c.d.cargaHoraria ?? 0);
      horasPorArea.set(area, (horasPorArea.get(area) ?? 0) + horas);
    }

  return (
    <section
      aria-label="Grade do currículo 2022"
      className="mt-[25px] overflow-clip rounded-[18px] border border-borda bg-white"
    >
      <div
        ref={areaRef}
        className="relative flex gap-16 overflow-x-auto px-[29px] pt-[27px] pb-8 [scrollbar-color:var(--color-borda)_transparent] max-celular:px-4 max-celular:pt-5"
      >
        <svg
          aria-hidden="true"
          width={tamanho.largura}
          height={tamanho.altura}
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
        >
          <defs>
            {/* Uma ponta por cor: context-stroke ainda não funciona em todo navegador. */}
            {[
              ["ponta", "#C6C6C6"],
              ["ponta-ligada", "#BF2D5D"],
            ].map(([id, cor]) => (
              <marker key={id} id={id} viewBox="0 0 12 22" refX="11" refY="11" markerWidth="12" markerHeight="22" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
                <path d="M1.5 1.5 11 11l-9.5 9.5" fill="none" stroke={cor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            ))}
          </defs>
          {/* As ligadas por último, para ficarem por cima das outras. */}
          {[...visiveis.filter((a) => !ligada(a)), ...visiveis.filter(ligada)].map((a) => (
            <path
              key={`${a.de}-${a.para}`}
              d={caminhos.get(`${a.de}>${a.para}`)}
              fill="none"
              strokeWidth={2.5}
              className={ligada(a) ? "stroke-rosa" : destaque ? "stroke-seta opacity-40" : "stroke-seta"}
              markerEnd={ligada(a) ? "url(#ponta-ligada)" : "url(#ponta)"}
            />
          ))}
          {corequisitos.map((a) => (
            <path
              key={`co-${a.de}-${a.para}`}
              d={a.d}
              fill="none"
              strokeWidth={2.5}
              className={ligada(a) ? "stroke-rosa" : destaque ? "stroke-seta opacity-40" : "stroke-seta"}
              markerStart={ligada(a) ? "url(#ponta-ligada)" : "url(#ponta)"}
              markerEnd={ligada(a) ? "url(#ponta-ligada)" : "url(#ponta)"}
            >
              <title>Co-requisitos: cursados no mesmo período</title>
            </path>
          ))}
        </svg>

        {colunas.map((coluna, i) => {
          // Como na matriz oficial, o estágio (200h, fora do horário de aula)
          // não entra no total do período.
          const horas = coluna.linhas.reduce(
            (s, c) =>
              s +
              (!c || (c.tipo === "disciplina" && /^Estágio/.test(c.d.nome))
                ? 0
                : c.tipo === "optativa"
                  ? HORAS_OPTATIVA
                  : (c.d.cargaHoraria ?? 0)),
            0,
          );
          return (
            <div key={coluna.periodo} className="relative flex w-[270px] shrink-0 flex-col">
              <h2 className="text-lg leading-[22px] font-bold text-vinho">{rotuloPeriodo(coluna.periodo)}</h2>
              <span aria-hidden="true" className="mt-2.5 block h-2 rounded bg-rosa-claro" />
              <ul className="mt-[27px] flex flex-col gap-8">
                {coluna.linhas.map((cartao, linha) => (
                  <li key={cartao?.tipo === "disciplina" ? cartao.d.codigo : cartao ? cartao.chave : `vazio-${linha}`} className="h-[88px]">
                    {cartao?.tipo === "disciplina" && (
                      <CartaoGrade
                        d={cartao.d}
                        area={cartao.area}
                        coluna={i}
                        linha={linha}
                        etiquetas={MATRIZ_2022[cartao.d.codigo]?.etiquetas ?? []}
                        sigla={siglas}
                        aoDestacar={setDestaque}
                      />
                    )}
                    {cartao?.tipo === "optativa" && <CartaoOptativa />}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-8 text-[13px] leading-4 font-bold text-cinza">Total: {horas}h</p>
            </div>
          );
        })}
      </div>
      <BarraRolagem alvo={areaRef} />

      <ul aria-label="Áreas" className="flex flex-wrap gap-x-5 gap-y-2.5 border-t border-borda px-[29px] py-5 max-celular:px-4">
        {(Object.keys(AREAS) as Area[])
          .filter((a) => horasPorArea.has(a))
          .map((a) => (
            <li key={a} className="flex items-center gap-2 text-[13px] font-bold text-cinza">
              <span
                aria-hidden="true"
                className="inline-block h-4 w-6 rounded border"
                style={{ background: AREAS[a].faixa, borderColor: AREAS[a].borda }}
              />
              {AREAS[a].nome} <span className="font-normal">{horasPorArea.get(a)}h</span>
            </li>
          ))}
      </ul>
    </section>
  );
}

function CartaoGrade({
  d,
  area,
  coluna,
  linha,
  etiquetas,
  sigla,
  aoDestacar,
}: {
  d: DisciplinaComNumeros;
  area: Area;
  coluna: number;
  linha: number;
  etiquetas: string[];
  sigla: (codigo: string) => string;
  aoDestacar: (codigo: string | null) => void;
}) {
  const cor = AREAS[area];
  const estilo = { borderColor: cor.borda, background: cor.fundo } as CSSProperties;
  return (
    <Link
      href={`/disciplinas/${d.codigo}`}
      data-codigo={d.codigo}
      data-coluna={coluna}
      data-linha={linha}
      title={`${cor.nome}${d.numeros ? ` · dificuldade ${formata.decimal(d.numeros.dificuldade)}` : ""}`}
      onMouseEnter={() => aoDestacar(d.codigo)}
      onMouseLeave={() => aoDestacar(null)}
      onFocus={() => aoDestacar(d.codigo)}
      onBlur={() => aoDestacar(null)}
      style={estilo}
      className="relative block h-[88px] rounded-[14px] border text-vinho no-underline transition-shadow hover:shadow-[0_4px_14px_rgba(128,12,51,0.1)]"
    >
      <span aria-hidden="true" className="absolute top-[17px] left-[13px] h-[52px] w-3.5 rounded-[7px]" style={{ background: cor.faixa }} />
      <span className="absolute top-[29px] right-3 left-[41px] line-clamp-2 -translate-y-1/2 text-[15px] leading-[18px] font-bold">
        {d.nome}
      </span>
      <span className="absolute top-[47px] left-[41px] text-xs leading-[15px] text-cinza">{rotuloCarga(d)}</span>
      {etiquetas.length > 0 && (
        <span className="absolute -top-[9px] left-3 flex gap-1" title="Pré-requisitos de períodos distantes">
          {etiquetas.map((e) => {
            const a = AREAS[MATRIZ_2022[e]?.area ?? "informatica"];
            return (
              <span
                key={e}
                className="rounded-[5px] border px-1.5 text-[10px] leading-4 font-bold text-vinho"
                style={{ background: a.faixa, borderColor: a.borda }}
              >
                {sigla(e)}
              </span>
            );
          })}
        </span>
      )}
    </Link>
  );
}

function CartaoOptativa() {
  const cor = AREAS.optativa;
  return (
    <Link
      href="/disciplinas?tipo=OP"
      style={{ borderColor: cor.borda, background: cor.fundo }}
      className="relative block h-[88px] rounded-[14px] border border-dashed text-vinho no-underline transition-shadow hover:shadow-[0_4px_14px_rgba(128,12,51,0.1)]"
    >
      <span aria-hidden="true" className="absolute top-[17px] left-[13px] h-[52px] w-3.5 rounded-[7px]" style={{ background: cor.faixa }} />
      <span className="absolute top-[29px] left-[41px] -translate-y-1/2 text-[15px] leading-[18px] font-bold">Optativa</span>
      <span className="absolute top-[47px] left-[41px] text-xs leading-[15px] text-cinza">{HORAS_OPTATIVA}h · Ver as opções</span>
    </Link>
  );
}
