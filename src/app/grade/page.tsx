import type { Metadata } from "next";
import Link from "next/link";

import QuadroGrade from "@/components/QuadroGrade";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo, OPTATIVA } from "@/lib/notas/consultas";

export const metadata: Metadata = { title: "Grade curricular" };

/**
 * Só o currículo 2022 tem grade: ele tem a representação gráfica oficial do
 * DI, que o quadro segue. O de 2008 não tem desenho oficial e mudou no
 * caminho (por volta da turma de 2015, Programação II passou para o 1º
 * período, Estrutura de Dados I para o 2º...), então não há uma grade 2008
 * que valha para todo mundo. Decisão da Bia.
 */
export default async function Grade() {
  const curriculo = await curriculoEscolhido();
  // A grade mostra só as obrigatórias; as optativas estão em Disciplinas.
  const disciplinas = disciplinasDoCurriculo(2022).filter((d) => d.periodo !== OPTATIVA);
  return (
    // O quadro usa a largura da tela inteira (em monitor grande cabem mais
    // períodos sem rolar); título e aviso ficam alinhados com ele. Se a tela
    // for maior que a grade, o conjunto fica centrado.
    <main className="flex w-full flex-auto flex-col px-14 pb-[72px] max-[1100px]:px-8 max-celular:px-4">
      <div className="mx-auto w-fit max-w-full">
        <h1 className="titulo-pagina">Grade curricular</h1>
        <p className="subtitulo-pagina">Visualize os períodos e os principais pré-requisitos do currículo 2022.</p>
        {curriculo === 2008 && (
          <p className="cartao mt-5 max-w-[1328px] px-5 py-4 text-sm leading-[21px] text-cinza">
            <b className="text-vinho">O currículo 2008 não tem grade desenhada.</b> Ele não tem representação gráfica
            oficial e mudou ao longo dos anos, então esta página mostra a grade de 2022. As disciplinas de 2008 estão
            em{" "}
            <Link href="/disciplinas" className="font-bold text-rosa">
              Disciplinas
            </Link>
            , e a correspondência com as de 2022 em{" "}
            <Link href="/comparar" className="font-bold text-rosa">
              Comparar currículos
            </Link>
            .
          </p>
        )}
        <QuadroGrade disciplinas={disciplinas} />
      </div>
    </main>
  );
}
