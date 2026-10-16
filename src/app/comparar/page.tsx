import type { Metadata } from "next";
import { previa } from "@/lib/site";

import Ajuda from "@/components/Ajuda";
import ComparacaoCurriculos, { type LinhaComparacao } from "@/components/ComparacaoCurriculos";
import { EQUIVALENCIAS, NOMES_2008 } from "@/lib/curriculos/equivalencias";
import { DESDE, disciplina, disciplinasDoCurriculo } from "@/lib/notas/consultas";

// Os números mudam com a importação: a página é montada a cada visita.
export const dynamic = "force-dynamic";

const DESCRICAO =
  "Cada disciplina do currículo 2022 de Engenharia de Computação da Ufes ao lado da equivalente de 2008, segundo o PPC, com a mudança na aprovação.";

export const metadata: Metadata = {
  title: "Comparar currículos",
  description: DESCRICAO,
  openGraph: previa("Comparar currículos", DESCRICAO),
};

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
        Cada disciplina do currículo 2022 ao lado da equivalente de 2008, segundo o PPC do curso.{" "}
        <Ajuda pergunta="O que é o número entre as duas?">
          <span className="block">
            O número entre as duas é a diferença na aprovação desde {DESDE}, em pontos percentuais (p.p.). +12 p.p.
            quer dizer que a de 2022 aprova 12 pontos a mais que a de 2008: 72% contra 60%, por exemplo.
          </span>
          <span className="mt-1.5 block">
            Quando a de 2022 equivale a mais de uma de 2008, a aprovação de 2008 soma os alunos de todas.
          </span>
        </Ajuda>
      </p>
      <ComparacaoCurriculos linhas={linhas} />
    </main>
  );
}
