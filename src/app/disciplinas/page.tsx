import type { Metadata } from "next";
import { Suspense } from "react";

import ListaDisciplinas from "@/components/ListaDisciplinas";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo } from "@/lib/notas/consultas";

export const metadata: Metadata = { title: "Disciplinas" };

export default async function Disciplinas() {
  const curriculo = await curriculoEscolhido();
  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Disciplinas</h1>
      <p className="subtitulo-pagina">Busque uma matéria e veja avaliações feitas pelos alunos.</p>
      <Suspense>
        <ListaDisciplinas disciplinas={disciplinasDoCurriculo(curriculo)} />
      </Suspense>
    </main>
  );
}
