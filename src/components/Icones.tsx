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
/**
 * Logo do PET Engenharia de Computação, do sitepet (Logo-PET.svg), recortado
 * no desenho e com a cor do texto em volta (`currentColor`).
 */
export const LogoPet = ({ largura = 132, titulo = "PET Engenharia de Computação UFES" }: { largura?: number; titulo?: string }) => (
  <svg width={largura} height={Math.round((largura * 358) / 818)} viewBox="41 271 818 358" role="img" aria-label={titulo} fill="currentColor">
    <path d="M242.1,378.2h30c2.7,10.4,12.2,18.1,23.4,18.1c13.4,0,24.3-10.9,24.3-24.3 c0-11.3-7.7-20.7-18.1-23.4v-29.8c10.4-2.7,18.1-12.2,18.1-23.4c0-13.4-10.9-24.3-24.3-24.3s-24.3,10.9-24.3,24.3 c0,11.3,7.7,20.7,18.1,23.4v29.8c-8.4,2.2-15,8.8-17.2,17.2h-30c-2.7-10.4-12.2-18.1-23.4-18.1c-13.4,0-24.3,10.9-24.3,24.3 c0,11.3,7.7,20.7,18.1,23.4v29.8c-10.4,2.7-18.1,12.2-18.1,23.4c0,11.3,7.7,20.7,18.1,23.4v29.8c-8.4,2.2-15,8.8-17.2,17.2h-29.8 c-2.2-8.4-8.8-15-17.2-17.2V472c10.4-2.7,18.1-12.2,18.1-23.4c0-13.4-10.9-24.3-24.3-24.3c-11.3,0-20.7,7.7-23.4,18.1h-30 C86,432,76.5,424.3,65.3,424.3c-13.4,0-24.3,10.9-24.3,24.3s10.9,24.3,24.3,24.3c11.3,0,20.7-7.7,23.4-18.1h30 c2.2,8.4,8.8,15,17.2,17.2v29.8c-10.4,2.7-18.1,12.2-18.1,23.4c0,11.3,7.7,20.7,18.1,23.4v29.8c-10.4,2.7-18.1,12.2-18.1,23.4 c0,13.4,10.9,24.3,24.3,24.3s24.3-10.9,24.3-24.3c0-11.3-7.7-20.7-18.1-23.4v-29.8c8.4-2.2,15-8.8,17.2-17.2h29.8 c2.7,10.4,12.2,18.1,23.4,18.1c13.4,0,24.3-10.9,24.3-24.3c0-11.3-7.7-20.7-18.1-23.4V472c8.4-2.2,15-8.8,17.2-17.2h30 c2.7,10.4,12.2,18.1,23.4,18.1c13.4,0,24.3-10.9,24.3-24.3s-10.9-24.3-24.3-24.3c-11.3,0-20.7,7.7-23.4,18.1h-30 c-2.2-8.4-8.8-15-17.2-17.2v-29.8C233.3,393.2,239.9,386.6,242.1,378.2z" />
    <path d="M361.2,275.8h78.2c22.5,0,41,5.7,55.5,17.2c15.9,12.6,23.9,29.8,23.9,51.7V366 c0,21.9-7.9,39.4-23.6,52.6c-14.5,12.3-33.1,18.5-55.8,18.5h-15.6v81.3h-62.5V275.8H361.2z M423.7,334.5v44.3h15 c14.5,0,21.7-7.4,21.7-22.3c0-14.7-7.2-22-21.7-22H423.7z" />
    <path d="M685.6,275.8v58.7h-90.3v30.9h49.4v58.1h-49.4v35.1h90.3v60H532.8V275.8H685.6z" />
    <path d="M859.1,275.8v58.7h-47.8v184.1H749V334.5h-47.8v-58.7H859.1z" />
    <path d="M397.6,557.3v-12h-23.9v23.9h23.9v12h-23.9v23.9h23.9v-12h12V617h-47.8v-83.7h47.8v23.9 L397.6,557.3L397.6,557.3z" />
    <path d="M457.4,617.1v-47.8h-23.9v47.8h-12v-59.8h47.8v59.8H457.4z" />
    <path d="M481.3,605.1v-47.8h47.8V629h-47.8v-11.8h35.9v-12h-35.9V605.1z M493.3,569.2v23.9h23.9 v-23.9H493.3z" />
    <path d="M577,557.3v-12h-23.9v59.8H577v-12h12V617h-47.8v-83.7H589v23.9L577,557.3L577,557.3z" />
    <path d="M600.9,617.1v-59.8h47.8v59.8H600.9z M612.9,605.1h23.9v-35.9h-23.9V605.1z" />
    <path d="M696.6,617.1v-47.8h-23.9v47.8h-12v-59.8h83.7v59.8h-12v-47.8h-23.9v47.8H696.6z" />
    <path d="M768.4,617.1v11.8h-12v-71.7h47.8V617h-35.8V617.1z M768.4,605.1h23.9v-35.9h-23.9V605.1z" />
    <path d="M852.2,517.7h-33.5v-4.8h28.7v-9.6h-28.7v-4.8h33.5V517.7z" />
    <path d="M828.2,479.4h-4.8v9.6h9.6v-9.6h4.8v9.6h14.4v4.8h-33.5v-19.1h9.6L828.2,479.4L828.2,479.4z" />
    <path d="M828.2,455.5h-4.8v9.6h9.6v-9.6h4.8v9.6h9.6v-9.6h-4.8v-4.8h9.6v19.1h-33.5v-19.1h9.6 L828.2,455.5L828.2,455.5z" />
    <path d="M837.8,445.9h-19.1v-19.1h9.6v4.8h-4.8v9.6h9.6v-14.4h19.1v19.1h-9.6v-4.8h4.8v-9.6h-9.6 V445.9z" />
  </svg>
);
