"use client";

import { useRouter } from "next/navigation";
import { Seta } from "./Icones";

/** Volta para onde a pessoa estava (Grade, Disciplinas, Comparar). */
export default function Voltar() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/disciplinas"))}
      className="mt-6 inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent py-1 text-sm font-bold text-rosa hover:text-vinho"
    >
      <Seta esquerda />
      Voltar
    </button>
  );
}
