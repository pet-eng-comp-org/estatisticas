import React from "react";

// Os simbolos do mockup (⌕, ★, ●, setas) nao existem no subset da Inter que
// o site serve; desenhados aqui, saem iguais em qualquer sistema.

export const Lupa = ({ tamanho = 14 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 14 14" aria-hidden="true" focusable="false">
    <circle cx="8.3" cy="5.7" r="4.3" fill="none" stroke="currentColor" strokeWidth="2.4" />
    <path d="M5.1 8.9 1.6 12.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const Estrela = ({ tamanho = 13 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path
      d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L1.3 7.8l6.1-.7z"
      fill="currentColor"
    />
  </svg>
);

export const Ponto = ({ tamanho = 13 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <circle cx="6" cy="6" r="6" fill="currentColor" />
  </svg>
);

export const Seta = ({ direcao = "direita", tamanho = 16 }) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
    style={direcao === "esquerda" ? { transform: "scaleX(-1)" } : undefined}
  >
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Chevron = ({ tamanho = 12 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** O logo do mockup: quadrado vinho com tres barras. */
export const Logo = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
    <rect width="42" height="42" rx="10" fill="#800C33" />
    <rect x="8" y="23" width="6" height="12" rx="3" fill="#fff" />
    <rect x="18" y="15" width="6" height="20" rx="3" fill="#fff" />
    <rect x="28" y="7" width="6" height="28" rx="3" fill="#fff" />
  </svg>
);
