import type { Metadata } from "next";
import { previa } from "@/lib/site";
import { Suspense } from "react";

import AjudaDificuldade from "@/components/AjudaDificuldade";
import ListaDisciplinas from "@/components/ListaDisciplinas";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo } from "@/lib/notas/consultas";

const DESCRICAO =
  "Todas as disciplinas de Engenharia de Computação da Ufes com aprovação, média das notas e dificuldade. Busque, filtre por período e ordene da mais difícil para a mais fácil.";

export const metadata: Metadata = {
  title: "Disciplinas",
  description: DESCRICAO,
  openGraph: previa("Disciplinas", DESCRICAO),
};

export default async function Disciplinas() {
  const curriculo = await curriculoEscolhido();
  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Disciplinas</h1>
      <p className="subtitulo-pagina">
        Busque uma disciplina e veja a aprovação, a média das notas e a dificuldade <AjudaDificuldade />.
      </p>
      <Suspense>
        <ListaDisciplinas disciplinas={disciplinasDoCurriculo(curriculo)} />
      </Suspense>
    </main>
  );
}
