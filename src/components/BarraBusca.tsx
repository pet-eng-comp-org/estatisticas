"use client";

import type { ReactNode } from "react";
import { Lupa } from "./Icones";

/**
 * Campo de busca do mockup. O que vier em children (o botão Buscar da tela
 * inicial) fica dentro da caixa, à direita; com `soNoComputador`, some no
 * celular, onde o teclado já tem a tecla de buscar.
 */
export default function BarraBusca({
  id,
  valor,
  aoMudar,
  aoEnviar,
  className = "",
  soNoComputador = false,
  children,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  aoEnviar?: (v: string) => void;
  className?: string;
  soNoComputador?: boolean;
  children?: ReactNode;
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        aoEnviar?.(valor);
      }}
      className={`relative flex h-[58px] items-center rounded-[14px] border border-borda bg-white pr-[21px] focus-within:border-rosa max-celular:h-auto max-celular:min-h-[52px] max-celular:flex-wrap max-celular:pr-3 ${className}`}
    >
      <label className="sr-only" htmlFor={id}>
        Buscar disciplina por nome ou código
      </label>
      <span className="pointer-events-none absolute top-1/2 left-[25px] flex -translate-y-1/2 text-rosa max-celular:top-[26px] max-celular:left-[18px]">
        <Lupa />
      </span>
      <input
        id={id}
        type="search"
        placeholder="Buscar disciplina..."
        autoComplete="off"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="h-full min-w-0 flex-1 rounded-[14px] border-0 bg-transparent pr-4 pl-[63px] text-base text-vinho outline-none placeholder:text-cinza placeholder:opacity-100 max-celular:h-[52px] max-celular:pl-[52px]"
      />
      {children && (
        <div
          className={`flex shrink-0 gap-2.5 max-celular:w-full max-celular:flex-wrap max-celular:gap-2 max-celular:pb-3 max-celular:pl-3 ${soNoComputador ? "max-celular:hidden" : ""}`}
        >
          {children}
        </div>
      )}
    </form>
  );
}
