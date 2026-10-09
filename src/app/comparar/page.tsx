import type { Metadata } from "next";

import ComparacaoCurriculos, { type LinhaComparacao } from "@/components/ComparacaoCurriculos";
import { EQUIVALENCIAS, NOMES_2008 } from "@/lib/curriculos/equivalencias";
import { disciplina, disciplinasDoCurriculo } from "@/lib/notas/consultas";

// Os números mudam com a importação: a página é montada a cada visita.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Comparar currículos" };

/**
 * Não há mockup desta tela. Cada disciplina do currículo 2022 ao lado da
 * equivalente de 2008, segundo o PPC, e quanto a aprovação mudou.
 */
export default function Comparar() {
  const linhas: LinhaComparacao[] = disciplinasDoCurriculo(2022).map((nova) => ({
    nova,
    antigas: EQUIVALENCIAS.filter(([n]) => n === nova.codigo).map(([, codigo]) => {
      const d = disciplina(codigo);
      return d ?? { codigo, nome: NOMES_2008[codigo] ?? codigo, numeros: null, periodo: null, cargaHoraria: null };
    }),
  }));

  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Comparar currículos</h1>
      <p className="subtitulo-pagina">
        Cada disciplina do currículo 2022 ao lado da equivalente de 2008, segundo o PPC do curso.
      </p>
      <ComparacaoCurriculos linhas={linhas} />
    </main>
  );
}
