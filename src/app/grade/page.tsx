import type { Metadata } from "next";

import QuadroGrade from "@/components/QuadroGrade";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo, OPTATIVA } from "@/lib/notas/consultas";

export const metadata: Metadata = { title: "Grade curricular" };

export default async function Grade() {
  const curriculo = await curriculoEscolhido();
  // A grade mostra só as obrigatórias; as optativas estão em Disciplinas.
  const disciplinas = disciplinasDoCurriculo(curriculo).filter((d) => d.periodo !== OPTATIVA);
  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Grade curricular</h1>
      <p className="subtitulo-pagina">Visualize os períodos e os principais pré-requisitos.</p>
      <QuadroGrade key={curriculo} curriculo={curriculo} disciplinas={disciplinas} />
    </main>
  );
}
