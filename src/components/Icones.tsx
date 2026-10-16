import type { ReactNode } from "react";
import type { TipoSimbolo } from "@/lib/formato";

// Os símbolos do mockup (⌕, ★, ●, setas) não existem no subset da Inter que o
// site serve; desenhados aqui, saem iguais em qualquer sistema.

/** Desenhada com a tinta centrada na caixa (de 0,9 a 15,1 nos dois eixos). */
export const Lupa = ({ tamanho = 16 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <circle cx="6.75" cy="6.75" r="4.75" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <path d="M10.3 10.3 14 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
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
export const Instagram = ({ tamanho = 22 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.3" />
    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const Email = ({ tamanho = 22 }: { tamanho?: number }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </svg>
);

/**
 * Logo do PET Engenharia de Computação, do sitepet (Logo-PET.svg), recortado
 * no desenho e com a cor do texto em volta (`currentColor`).
 */
export const LogoPet = ({ largura = 132, titulo = "PET Engenharia de Computação Ufes" }: { largura?: number; titulo?: string }) => (
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

/**
 * Selo da Ufes, tirado em vetor do resumo oficial de aplicações da marca
 * (Secom, 2024). O manual só permite a marca nas cores dela, toda branca em
 * fundo escuro ou toda preta em fundo claro: nunca em outra cor. Ao lado da
 * marca do PET, na mesma altura e à direita dela: é o padrão do manual para
 * unidades com marca própria (pág. 47), e a instituição de nível mais alto
 * fica à direita.
 */
export const LogoUfes = ({ altura = 58, branca = false }: { altura?: number; branca?: boolean }) => (
  <svg width={Math.round((altura * 103.04) / 53)} height={altura} viewBox="1626.37 105.19 103.04 53" role="img" aria-label="Ufes">
    <path fill={branca ? "#FFFFFF" : "#231F20"} d="M 1656.14 136.35 L 1656.14 153.6 L 1647.02 155.2 L 1647.02 154.82 C 1652.72 152.23 1655.54 146.84 1655.69 136.35 Z M 1711.02 119.93 C 1711.02 115.68 1721.43 113.78 1721.89 118.34 L 1729.03 117.2 L 1729.41 117.2 L 1729.41 126.7 L 1729.03 126.7 C 1724.77 120.09 1711.02 125.03 1711.02 119.93 M 1664.5 138.86 L 1674.38 137.26 L 1674.38 130.19 L 1664.5 131.79 L 1664.5 126.16 L 1679.93 123.58 L 1679.93 149.42 L 1664.5 152.16 Z M 1688.22 141.06 L 1688.22 134.83 L 1698.02 133.31 L 1698.02 126.24 L 1688.22 127.76 L 1688.22 122.14 L 1703.04 119.7 C 1702.89 120.62 1702.81 121.53 1702.81 122.44 C 1702.81 135.59 1721.96 127.68 1721.96 133.69 C 1721.96 138.48 1712.77 139.54 1710.71 137.34 Z M 1647.48 121.76 L 1647.48 136.8 C 1647.48 144.63 1646.34 148.82 1641.32 149.57 C 1636.31 150.33 1635.02 146.76 1635.02 138.78 L 1635.02 123.88 Z M 1647.48 121.76" />
    <path fill={branca ? "#FFFFFF" : "#00ADEF"} d="M 1704.79 143.42 C 1707.82 145.32 1712.54 145.7 1716.95 145.02 C 1722.19 144.18 1726.98 141.98 1729.11 137.64 L 1729.41 137.64 L 1729.41 158.19 L 1704.41 158.19 L 1704.41 143.42 Z M 1704.79 143.42" />
    <path fill={branca ? "#FFFFFF" : "#234379"} d="M 1626.37 105.19 L 1626.37 125.41 L 1704.25 112.26 L 1704.25 115.75 L 1704.63 115.75 C 1706.84 112.26 1711.02 110.05 1716.79 109.14 C 1722.64 108.15 1727.59 109.82 1729.11 114.46 L 1729.41 114.46 L 1729.41 105.19 Z M 1626.37 105.19" />
  </svg>
);
