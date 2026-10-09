import type { ReactNode } from "react";
import type { TipoSimbolo } from "@/lib/formato";

// Os símbolos do mockup (⌕, ★, ●, setas) não existem no subset da Inter que o
// site serve; desenhados aqui, saem iguais em qualquer sistema.

export const Lupa = ({ tamanho = 14 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <circle cx="8.3" cy="5.7" r="4.3" fill="none" stroke="currentColor" strokeWidth="2.4" />
    <path d="M5.1 8.9 1.6 12.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const Estrela = ({ tamanho = 13 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z" fill="currentColor" />
  </svg>
);

export const Ponto = ({ tamanho = 13 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <circle cx="6" cy="6" r="6" fill="currentColor" />
  </svg>
);

export const Seta = ({ esquerda = false, tamanho = 16 }: { esquerda?: boolean; tamanho?: number }) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    className={esquerda ? "-scale-x-100" : undefined}
  >
    <path
      d="M2 8h11M9 3.5 13.5 8 9 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** O logo do mockup: quadrado vinho com três barras. */
export const Logo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true" focusable="false" className="shrink-0">
    <rect width="42" height="42" rx="10" fill="#800C33" />
    <rect x="8" y="23" width="6" height="12" rx="3" fill="#fff" />
    <rect x="18" y="15" width="6" height="20" rx="3" fill="#fff" />
    <rect x="28" y="7" width="6" height="28" rx="3" fill="#fff" />
  </svg>
);

/**
 * Símbolos dos cartões da tela inicial (∑, </>, ⊢, ●, F, Ω no mockup). Eram
 * texto, mas a Inter servida não tem ∑, ⊢, Ω nem ●: o navegador pegava cada
 * um de outra fonte do sistema, que os põe em alturas diferentes, e eles
 * saíam de 2 a 3,5 px fora do centro, diferente em cada computador.
 * Desenhados aqui, ficam no centro geométrico da caixa em qualquer sistema.
 */
const DESENHOS: Record<TipoSimbolo, ReactNode> = {
  somatorio: <path d="M13.25 3h-8.5l5 6-5 6h8.5" />,
  codigo: <path d="M5.5 4.5 1.5 9l4 4.5M12.5 4.5l4 4.5-4 4.5M10.5 3 7.5 15" />,
  logica: <path d="M4.5 3v12M4.5 9h9" />,
  ponto: <circle cx="9" cy="9" r="4.5" fill="currentColor" stroke="none" />,
  fisica: <path d="M5.5 3v12M5.5 3H13M5.5 9H11.5" />,
  eletrica: <path d="M3 15h3.5v-1.8A5.6 5.6 0 1 1 11.5 13.2V15H15" />,
};

export const Simbolo = ({ tipo, tamanho = 18 }: { tipo: TipoSimbolo; tamanho?: number }) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 18 18"
    aria-hidden="true"
    focusable="false"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {DESENHOS[tipo]}
  </svg>
);
