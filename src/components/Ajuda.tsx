"use client";

import { type ReactNode, useId, useLayoutEffect, useRef, useState } from "react";

const LARGURA = 320;
const MARGEM = 16;
const VAO = 8;

/**
 * Interrogação que explica um número ao lado do rótulo dele. Começou na
 * dificuldade (sugestão do Rodrigo) e serve onde a regra do número não dá
 * para adivinhar. Abre ao passar o mouse e ao clicar; no celular, que não tem
 * "passar o mouse", só o toque abre. Esc, clique fora, outro clique ou o foco
 * saindo fecham.
 *
 * O balão fica em posição fixa, calculada a partir do botão e presa dentro
 * da tela: no celular o botão pode estar perto da borda e um balão de 320 px
 * alinhado a ele sairia pelo lado. Sem espaço embaixo, abre em cima; sem
 * espaço nos dois, fica do lado com mais espaço e rola por dentro. Fecha
 * com clique ou toque fora, mas não com o dedo que arrasta a página: senão,
 * no celular, rolar para ler o fim do balão o fecharia. Por isso pointerup:
 * quando o dedo arrasta, o navegador assume a rolagem e o pointerup não vem
 * (pointerdown fecharia já no começo do arraste; click não chega ao document
 * no Safari do iPhone quando o toque cai em área que não é clicável). Cada parágrafo do texto vai num <span
 * className="block">, porque o balão fica dentro de <p> e de rótulos.
 */
export default function Ajuda({ pergunta, children }: { pergunta: string; children: ReactNode }) {
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const caixa = useRef<HTMLSpanElement>(null);
  const [mouse, setMouse] = useState(false);
  const [fixado, setFixado] = useState(false);
  const balao = useRef<HTMLSpanElement>(null);
  const saida = useRef<ReturnType<typeof setTimeout>>(undefined);
  const aberto = mouse || fixado;

  // Antes da pintura, para o balão não aparecer um instante fora do lugar.
  useLayoutEffect(() => {
    if (!aberto) return;
    // Direto no estilo, sem estado: a altura só se mede depois de a largura
    // estar aplicada, e a rolagem não precisa renderizar o componente.
    const posiciona = () => {
      const r = botao.current!.getBoundingClientRect();
      const b = balao.current!;
      const largura = Math.min(LARGURA, window.innerWidth - 2 * MARGEM);
      b.style.width = `${largura}px`;
      b.style.left = `${Math.max(MARGEM, Math.min(r.left - 12, window.innerWidth - largura - MARGEM))}px`;
      b.style.maxHeight = "";
      const altura = b.offsetHeight;
      const embaixo = window.innerHeight - r.bottom - VAO - MARGEM;
      const emCima = r.top - VAO - MARGEM;
      const acima = altura > embaixo && emCima > embaixo;
      if (altura > Math.max(embaixo, emCima)) b.style.maxHeight = `${Math.max(embaixo, emCima)}px`;
      b.style.top = `${acima ? r.top - VAO - Math.min(altura, emCima) : r.bottom + VAO}px`;
    };
    // A rolagem dispara muitos eventos: um reposicionamento por quadro basta.
    let quadro = 0;
    const rolou = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(posiciona);
    };
    const fecha = () => {
      setMouse(false);
      setFixado(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fecha();
    const fora = (e: PointerEvent) => !caixa.current?.contains(e.target as Node) && fecha();
    posiciona();
    window.addEventListener("resize", posiciona);
    window.addEventListener("scroll", rolou, true);
    document.addEventListener("keydown", tecla);
    document.addEventListener("pointerup", fora);
    return () => {
      window.removeEventListener("resize", posiciona);
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", rolou, true);
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("pointerup", fora);
    };
  }, [aberto]);

  return (
    <span
      ref={caixa}
      className="relative inline-flex align-middle"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(saida.current);
        setMouse(true);
      }}
      // Um instante antes de fechar: o mouse atravessa o vão entre o botão e
      // o balão sem que ele suma.
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") saida.current = setTimeout(() => setMouse(false), 200);
      }}
      // Preso pelo teclado, fecha quando o foco sai (Tab adiante).
      onBlur={(e) => !caixa.current?.contains(e.relatedTarget as Node | null) && setFixado(false)}
    >
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        aria-describedby={id}
        aria-label={pergunta}
        // Aberto só pelo mouse, o clique prende o balão; preso, fecha.
        onClick={() => {
          if (fixado) {
            setFixado(false);
            setMouse(false);
          } else setFixado(true);
        }}
        className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0"
      >
        <span
          aria-hidden="true"
          className="flex size-[18px] items-center justify-center rounded-full bg-rosa-claro text-xs leading-none font-bold text-rosa"
        >
          ?
        </span>
      </button>
      <span
        id={id}
        role="note"
        hidden={!aberto}
        ref={balao}
        // whitespace-normal porque o rótulo do cartão em volta é nowrap.
        className="fixed z-50 overflow-y-auto overscroll-contain rounded-xl border border-borda bg-white px-4 py-3 text-left text-[13px] leading-[19px] font-normal whitespace-normal text-cinza shadow-[0_4px_14px_rgba(128,12,51,0.12)]"
      >
        {children}
      </span>
    </span>
  );
}
