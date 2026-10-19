"use client";

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

/**
 * Barra de rolagem lateral que acompanha a tela (sugestão da Bia). A grade é
 * mais larga e mais alta que a tela, e a barra do navegador fica no pé do
 * quadro: sem descer até lá, não dava para ir para o lado. Esta fica presa no
 * pé da janela enquanto a barra do navegador está fora de vista, e some
 * quando ela aparece. Roda do mouse em cima dela também vai para o lado.
 *
 * É desenhada, e não uma segunda área rolável espelhada, porque a barra
 * sobreposta (macOS, celular) tem altura zero e não daria para pegar.
 * Fica fora da árvore de acessibilidade: o teclado e o leitor de tela usam
 * a rolagem da própria área.
 */
export default function BarraRolagem({ alvo }: { alvo: RefObject<HTMLElement | null> }) {
  const barra = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const fim = useRef<HTMLDivElement>(null);
  const arraste = useRef<{ x: number; inicio: number } | null>(null);
  const [medida, setMedida] = useState({ visivel: 0, total: 0, posicao: 0 });
  const [foraDeVista, setForaDeVista] = useState(false);

  useEffect(() => {
    const area = alvo.current;
    if (!area) return;
    const mede = () => setMedida({ visivel: area.clientWidth, total: area.scrollWidth, posicao: area.scrollLeft });
    mede();
    area.addEventListener("scroll", mede, { passive: true });
    const tamanho = new ResizeObserver(mede);
    tamanho.observe(area);

    // O marcador fica logo abaixo da área: se ele não está na tela, a barra
    // do navegador também não está.
    const vista = new IntersectionObserver(([e]) => setForaDeVista(!e.isIntersecting));
    if (fim.current) vista.observe(fim.current);

    // Roda do mouse sobre a barra rola para o lado. Precisa de listener não
    // passivo para impedir que a página desça junto.
    const roda = (e: WheelEvent) => {
      e.preventDefault();
      area.scrollLeft += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    };
    const b = barra.current;
    b?.addEventListener("wheel", roda, { passive: false });

    return () => {
      area.removeEventListener("scroll", mede);
      tamanho.disconnect();
      vista.disconnect();
      b?.removeEventListener("wheel", roda);
    };
  }, [alvo]);

  const { visivel, total, posicao } = medida;
  const mostra = foraDeVista && total > visivel + 1;
  // Em fração da largura do conteúdo: o trilho representa o conteúdo todo.
  const largura = total ? (visivel / total) * 100 : 100;
  const esquerda = total ? (posicao / total) * 100 : 0;

  const pegar = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    arraste.current = { x: e.clientX, inicio: alvo.current?.scrollLeft ?? 0 };
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arraste.current;
    const area = alvo.current;
    const t = trilho.current;
    if (!a || !area || !t) return;
    area.scrollTo({ left: a.inicio + ((e.clientX - a.x) * area.scrollWidth) / t.clientWidth });
  };
  const soltar = () => {
    arraste.current = null;
  };
  // Clique na faixa, fora do polegar: anda quase uma tela para aquele lado.
  const pular = (e: PointerEvent<HTMLDivElement>) => {
    const area = alvo.current;
    const t = trilho.current;
    if (!area || !t) return;
    const clique = ((e.clientX - t.getBoundingClientRect().left) / t.clientWidth) * area.scrollWidth;
    const lado = clique < area.scrollLeft ? -1 : 1;
    area.scrollBy({ left: lado * area.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={barra}
        aria-hidden="true"
        onPointerDown={pular}
        className={`sticky bottom-0 z-10 -mt-7 h-7 cursor-pointer border-t border-borda bg-white/90 px-[29px] py-[9px] backdrop-blur-sm transition-opacity max-celular:px-4 ${mostra ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div ref={trilho} className="relative h-2.5 rounded-full bg-trilho">
          <div
            onPointerDown={pegar}
            onPointerMove={mover}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            style={{ width: `${largura}%`, left: `${esquerda}%` }}
            className="absolute inset-y-0 cursor-grab touch-none rounded-full bg-[#d9c4cc] hover:bg-cinza active:cursor-grabbing active:bg-cinza"
          />
        </div>
      </div>
      <div ref={fim} aria-hidden="true" />
    </>
  );
}
