import type { Metadata } from "next";
import { previa } from "@/lib/site";
import Link from "next/link";

import Ajuda from "@/components/Ajuda";
import QuadroGrade from "@/components/QuadroGrade";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo, OPTATIVA } from "@/lib/notas/consultas";

const DESCRICAO =
  "Grade curricular de Engenharia de Computação da Ufes, currículos 2022 e 2008: os dez períodos, os pré-requisitos e a carga horária.";

export const metadata: Metadata = {
  title: "Grade curricular",
  description: DESCRICAO,
  openGraph: previa("Grade curricular", DESCRICAO),
};

/**
 * A grade de 2022 segue a representação gráfica oficial do DI. A de 2008 não
 * tem desenho oficial e mudou no caminho (por volta da turma de 2015,
 * Programação II passou para o 1º período, Estrutura de Dados I para o 2º...):
 * mostramos a última emissão, de 2017, que é a das turmas que ainda estão
 * nesse currículo, com as posições escolhidas por nós (matriz.ts).
 */
export default async function Grade() {
  const curriculo = await curriculoEscolhido();
  // A grade mostra só as obrigatórias; as optativas estão em Disciplinas.
  const disciplinas = disciplinasDoCurriculo(curriculo).filter((d) => d.periodo !== OPTATIVA);
  return (
    // O quadro usa a largura da tela inteira (em monitor grande cabem mais
    // períodos sem rolar); título e subtítulo ficam alinhados com ele. Se a tela
    // for maior que a grade, o conjunto fica centrado.
    <main className="flex w-full flex-auto flex-col px-14 pb-[72px] max-[1100px]:px-8 max-celular:px-4">
      <div className="mx-auto w-fit max-w-full">
        <h1 className="titulo-pagina">Grade curricular</h1>
        <p className="subtitulo-pagina">
          Visualize os períodos e os principais pré-requisitos do currículo {curriculo}
          {curriculo === 2022 ? (
            "."
          ) : (
            <>
              , na versão de 2017{" "}
              <Ajuda pergunta="De onde vem esta grade?">
                <span className="block">
                  É a última emissão do currículo 2008, de 2017, que é a das turmas que ainda estão nele. Turmas que
                  entraram antes de 2015, mais ou menos, tiveram algumas disciplinas em outros períodos.
                </span>
                <span className="mt-1.5 block">
                  O currículo não tem representação gráfica oficial, então o desenho é nosso. As optativas estão em{" "}
                  <Link href="/disciplinas" className="font-bold text-rosa">
                    Disciplinas
                  </Link>
                  .
                </span>
              </Ajuda>
            </>
          )}
        </p>
        <QuadroGrade curriculo={curriculo} disciplinas={disciplinas} />
      </div>
    </main>
  );
}
