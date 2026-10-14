import Link from "next/link";

import { CartaoResumo } from "@/components/Cartoes";
import PeriodoInicial from "@/components/PeriodoInicial";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo, resumoGeral } from "@/lib/notas/consultas";
import { DESDE, formata, MINIMO_ALUNOS } from "@/lib/formato";

export default async function Inicio() {
  const curriculo = await curriculoEscolhido();
  const resumo = resumoGeral(curriculo);
  const disciplinas = disciplinasDoCurriculo(curriculo).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <main className="pagina">
      <h1 className="mt-[38px] text-[42px] leading-[50px] font-bold text-vinho max-celular:mt-7 max-celular:text-[30px] max-celular:leading-9">
        Conheça as estatísticas
        <span className="block text-rosa">das disciplinas de Computação UFES</span>
      </h1>
      <p className="mt-[21px] max-w-[640px] text-lg leading-[27px] text-cinza max-celular:text-base max-celular:leading-6">
        Compare dificuldade, aprovação e organização das disciplinas entre os currículos de
        2008 e 2022.
      </p>
      <div className="mt-[27px] flex flex-wrap gap-3.5">
        <Link
          href="/disciplinas"
          className="inline-flex h-[50px] items-center rounded-xl bg-rosa px-[21px] text-base font-bold whitespace-nowrap text-white no-underline transition hover:bg-vinho"
        >
          Explorar disciplinas
        </Link>
        <Link
          href="/comparar"
          className="inline-flex h-[50px] items-center rounded-xl border border-rosa bg-white px-4 text-base font-bold whitespace-nowrap text-rosa no-underline transition hover:bg-rosa-claro"
        >
          Comparar currículos
        </Link>
      </div>

      <section
        aria-label={`Resumo do currículo ${curriculo}`}
        className="mt-[84px] grid grid-cols-[repeat(4,290px)] justify-center gap-5 max-[1360px]:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] max-celular:mt-10 max-celular:grid-cols-2 max-celular:gap-3"
      >
        <CartaoResumo
          cor="rosa"
          valor={formata.inteiro(resumo.disciplinas)}
          rotulo="Disciplinas avaliadas"
          descricao={`Disciplinas com pelo menos ${MINIMO_ALUNOS} alunos desde ${DESDE}`}
        />
        <CartaoResumo
          cor="verde"
          valor={formata.decimal(resumo.media)}
          rotulo="Média geral"
          descricao={`Média das notas finais (0 a 10) desde ${DESDE}, ponderada pelo número de alunos com nota`}
        />
        <CartaoResumo
          cor="verde"
          valor={formata.porcento(resumo.aprovacao)}
          rotulo="Aprovação média"
          descricao={`Alunos aprovados sobre o total das turmas desde ${DESDE}`}
        />
        <CartaoResumo
          cor="escuro"
          valor="0"
          rotulo="Avaliações"
          descricao="As avaliações das disciplinas pelos alunos ainda vão abrir"
        />
      </section>

      <PeriodoInicial disciplinas={disciplinas} />
    </main>
  );
}
