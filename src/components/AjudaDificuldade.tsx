"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

import { DESDE } from "@/lib/formato";
import { PESOS } from "@/lib/notas/dificuldade";

const LARGURA = 320;
const MARGEM = 16;

const porcento = (peso: number) => `${Math.round(peso * 100)}%`;

/**
 * Interrogação ao lado de "Dificuldade" que explica o número (sugestão do
 * Rodrigo). É a única explicação da conta no site: a seção que ficava no fim
 * da página da disciplina saiu. Abre ao passar o mouse e ao clicar; no celular, que não tem
 * "passar o mouse", só o toque abre. Esc, clique fora ou outro clique fecham.
 *
 * O balão fica em posição fixa, calculada a partir do botão e presa dentro
 * da tela: no celular o botão pode estar perto da borda e um balão de 280 px
 * alinhado a ele sairia pelo lado.
 */
export default function AjudaDificuldade() {
  const id = useId();
  const botao = useRef<HTMLButtonElement>(null);
  const caixa = useRef<HTMLSpanElement>(null);
  const [mouse, setMouse] = useState(false);
  const [fixado, setFixado] = useState(false);
  const [posicao, setPosicao] = useState<{ top: number; left: number; largura: number } | null>(null);
  const aberto = mouse || fixado;

  // Antes da pintura, para o balão não aparecer um instante fora do lugar.
  useLayoutEffect(() => {
    if (!aberto) return;
    const posiciona = () => {
      const r = botao.current!.getBoundingClientRect();
      const largura = Math.min(LARGURA, window.innerWidth - 2 * MARGEM);
      const left = Math.max(MARGEM, Math.min(r.left - 12, window.innerWidth - largura - MARGEM));
      setPosicao({ top: r.bottom + 8, left, largura });
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
    document.addEventListener("pointerdown", fora);
    return () => {
      window.removeEventListener("resize", posiciona);
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", rolou, true);
      document.removeEventListener("keydown", tecla);
      document.removeEventListener("pointerdown", fora);
    };
  }, [aberto]);

  return (
    <span
      ref={caixa}
      className="relative inline-flex align-middle"
      onPointerEnter={(e) => e.pointerType === "mouse" && setMouse(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setMouse(false)}
      // Preso pelo teclado, fecha quando o foco sai (Tab adiante).
      onBlur={(e) => !caixa.current?.contains(e.relatedTarget as Node | null) && setFixado(false)}
    >
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls={id}
        aria-describedby={id}
        aria-label="O que é a dificuldade?"
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
        style={posicao ? { top: posicao.top, left: posicao.left, width: posicao.largura } : undefined}
        // O before cobre o vão até o botão: o mouse passa por ele sem fechar.
        className="fixed z-50 rounded-xl border border-borda bg-white px-4 py-3 text-left text-[13px] leading-[19px] font-normal text-cinza shadow-[0_4px_14px_rgba(128,12,51,0.12)] before:absolute before:inset-x-0 before:-top-2 before:h-2 before:content-['']"
      >
        <span className="block">
          Vai de 1 a 5 e compara as disciplinas do curso entre si: quanto mais perto de 5, mais difícil em relação às
          outras.
        </span>
        <span className="mt-1.5 block">
          A conta usa as turmas desde {DESDE} e três medidas: a reprovação (peso {porcento(PESOS.reprovacao)}), o
          quanto a média das notas fica abaixo de 10 ({porcento(PESOS.notaBaixa)}) e o desvio padrão das notas
          ({porcento(PESOS.desvio)}), que mostra se a turma se divide entre quem vai muito bem e quem vai muito mal.
          Disciplinas com poucos alunos ficam perto do meio da escala até terem dados suficientes.
        </span>
      </span>
    </span>
  );
}
