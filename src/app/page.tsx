import Link from "next/link";

import Ajuda from "@/components/Ajuda";
import AjudaDificuldade from "@/components/AjudaDificuldade";
import { CartaoResumo } from "@/components/Cartoes";
import EntradaInicio from "@/components/EntradaInicio";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import { disciplinasDoCurriculo, resumoGeral } from "@/lib/notas/consultas";
import { DESDE, formata, MINIMO_ALUNOS } from "@/lib/formato";
import { NOME_SITE, URL_SITE } from "@/lib/site";

export default async function Inicio() {
  const curriculo = await curriculoEscolhido();
  const resumo = resumoGeral(curriculo);
  // Quantas disciplinas cada período tem, para os atalhos (optativas no fim).
  const contagem = new Map<number, number>();
  for (const d of disciplinasDoCurriculo(curriculo)) contagem.set(d.periodo!, (contagem.get(d.periodo!) ?? 0) + 1);
  const periodos = [...contagem].sort(([a], [b]) => a - b).map(([periodo, quantidade]) => ({ periodo, quantidade }));

  return (
    <main className="pagina">
      {/* Nome que o Google mostra acima do resultado; sem ele, usa o do domínio (Ufes). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: NOME_SITE,
            alternateName: "Estatísticas de disciplinas da Engenharia de Computação Ufes",
            url: `${URL_SITE}/`,
          }),
        }}
      />
      <h1 className="mt-[38px] text-[42px] leading-[50px] font-bold text-vinho max-celular:mt-7 max-celular:text-[30px] max-celular:leading-9">
        Conheça as estatísticas <span className="block text-rosa">das disciplinas de Computação Ufes</span>
      </h1>
      <p className="mt-[21px] max-w-[640px] text-lg leading-[27px] text-cinza max-celular:text-base max-celular:leading-6">
        Compare dificuldade <AjudaDificuldade />, aprovação e organização das disciplinas entre os currículos de 2008 e
        2022.
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
        className="mt-[84px] grid grid-cols-[repeat(3,290px)] justify-center gap-5 max-[1100px]:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] max-celular:mt-10 max-celular:grid-cols-3 max-celular:gap-2.5"
      >
        <CartaoResumo
          cor="rosa"
          valor={formata.inteiro(resumo.disciplinas)}
          rotulo="Disciplinas avaliadas"
          // No celular não há title: sem o balão, o número não batia com o total da lista de disciplinas.
          ajuda={
            <Ajuda pergunta="Quais disciplinas contam?">
              <span className="block">
                Só as que tiveram pelo menos {MINIMO_ALUNOS} alunos desde {DESDE}. As outras também estão na lista de
                disciplinas, mas sem números.
              </span>
            </Ajuda>
          }
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
        {/* O cartão "Avaliações" do mockup volta quando as avaliações das
            disciplinas pelos alunos abrirem; até lá ele só mostraria 0. */}
      </section>

      <EntradaInicio periodos={periodos} />
    </main>
  );
}
