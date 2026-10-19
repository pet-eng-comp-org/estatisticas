import type { Metadata } from "next";
import { previa } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";

import Ajuda from "@/components/Ajuda";
import AjudaDificuldade from "@/components/AjudaDificuldade";
import { CartaoResumo } from "@/components/Cartoes";
import GraficoDisciplina from "@/components/GraficoDisciplina";
import Voltar from "@/components/Voltar";
import { EQUIVALENCIAS, NOMES_2008 } from "@/lib/curriculos/equivalencias";
import { DESDE, MINIMO_ALUNOS, disciplina, historico, liberadasPor, nomes } from "@/lib/notas/consultas";
import { departamento, formata, MINIMO_POR_SEMESTRE, rotuloCarga, rotuloPeriodo } from "@/lib/formato";

// Os números mudam com a importação: a página é montada a cada visita.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ codigo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const d = disciplina(codigo);
  const nome = d?.nome ?? NOMES_2008[codigo] ?? codigo;
  const n = d?.numeros;
  // A descrição é o que aparece no resultado da busca e na prévia do link:
  // os números da disciplina, não um texto genérico do site.
  const partes = [
    `${nome} (${codigo})`,
    d?.curriculo
      ? `${rotuloPeriodo(d.periodo)} do currículo ${d.curriculo} de Engenharia de Computação da Ufes`
      : "Ufes",
  ];
  const numeros = n
    ? `Aprovação de ${formata.porcento(n.aprovacao)}, média ${formata.decimal(n.media)}, mediana ${formata.decimal(n.mediana)} e dificuldade ${formata.decimal(n.dificuldade)} de 5, com ${formata.inteiro(n.alunos)} alunos desde ${DESDE}.`
    : "Histórico de aprovação e notas por semestre.";
  const descricao = `${partes.join(", ")}. ${numeros}`;
  return { title: nome, description: descricao, openGraph: previa(nome, descricao) };
}

/** Disciplinas como pílulas que levam à página de cada uma. */
function Ligacoes({
  titulo,
  codigos,
  nome,
  vazio,
}: {
  titulo: string;
  codigos: string[];
  nome: (c: string) => string;
  vazio: string;
}) {
  return (
    <section className="cartao px-[22px] pt-5 pb-[22px]">
      <h2 className="text-[15px] leading-[18px] font-bold text-cinza">{titulo}</h2>
      {codigos.length === 0 ? (
        <p className="mt-3 text-sm text-cinza">{vazio}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {codigos.map((c) => (
            <li key={c}>
              <Link
                href={`/disciplinas/${c}`}
                className="inline-flex items-baseline gap-1.5 rounded-full bg-rosa-claro px-3.5 py-2 text-sm font-bold text-vinho no-underline hover:bg-rosa-hover"
              >
                <span>{nome(c)}</span>
                <small className="text-[11px] font-normal text-cinza">{c}</small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Página de uma disciplina. Não há mockup dela: segue o desenho das outras
 * telas (título, cartões de resumo, quadro branco) e traz o gráfico por
 * semestre que o site já tinha.
 */
export default async function PaginaDisciplina({ params }: Props) {
  const { codigo } = await params;
  const d = disciplina(codigo);
  // Código que não está no banco nem entre as disciplinas de 2008 do PPC:
  // erro de digitação ou link velho, não uma página vazia.
  if (!d && !NOMES_2008[codigo]) notFound();
  const semestres = historico(codigo);
  const todosOsNomes = nomes();
  const nome = (c: string) => todosOsNomes[c] ?? NOMES_2008[c] ?? c;

  const nova = d?.curriculo === 2022;
  const equivalentes = nova
    ? EQUIVALENCIAS.filter(([n]) => n === codigo).map(([, a]) => a)
    : EQUIVALENCIAS.filter(([, a]) => a === codigo).map(([n]) => n);
  const n = d?.numeros;

  const detalhes = [
    codigo,
    d?.periodo !== undefined && d?.periodo !== null ? rotuloPeriodo(d.periodo) : null,
    d?.curriculo ? rotuloCarga(d) : null,
    d?.curriculo ? `Currículo ${d.curriculo}` : null,
    departamento(codigo),
  ].filter(Boolean);

  return (
    <main className="pagina">
      <Voltar />
      <h1 className="titulo-pagina mt-2">{d?.nome ?? NOMES_2008[codigo] ?? codigo}</h1>
      <p className="subtitulo-pagina">{detalhes.join(" · ")}</p>

      {!d?.curriculo && (
        <p className="aviso">
          Esta disciplina não está na grade de Engenharia de Computação; o histórico de turmas aparece abaixo se houver.
        </p>
      )}

      <section
        aria-label="Resumo"
        className="mt-7 grid grid-cols-5 gap-5 max-[1240px]:grid-cols-3 max-[760px]:grid-cols-2 max-celular:gap-3"
      >
        <CartaoResumo
          cor="rosa"
          valor={formata.decimal(n?.dificuldade)}
          rotulo="Dificuldade"
          ajuda={d?.curriculo ? <AjudaDificuldade /> : undefined}
          descricao={d?.curriculo ? undefined : "Só para disciplinas da grade de Engenharia de Computação"}
        />
        <CartaoResumo
          cor="verde"
          valor={formata.porcento(n?.aprovacao)}
          rotulo="Aprovação"
          descricao={`Alunos aprovados nas turmas desde ${DESDE}`}
        />
        <CartaoResumo
          cor="verde"
          valor={formata.decimal(n?.media)}
          rotulo="Média das notas"
          ajuda={
            <Ajuda pergunta="Como a média é calculada?">
              <span className="block">
                Média das notas finais (0 a 10) nas turmas desde {DESDE}, só de quem teve nota lançada.
              </span>
              <span className="mt-1.5 block">
                Quem reprova por falta costuma ficar sem nota: conta na reprovação, mas fica fora da média.
              </span>
            </Ajuda>
          }
        />
        <CartaoResumo
          cor="verde"
          valor={formata.decimal(n?.mediana)}
          rotulo="Mediana das notas"
          ajuda={
            // Pedido da Bia: nas disciplinas difíceis muita nota extrema (zero
            // de quem desistiu) puxa a média para baixo; a mediana mostra a
            // nota do aluno do meio.
            <Ajuda pergunta="O que é a mediana?">
              <span className="block">
                Metade dos alunos tirou essa nota ou mais, e a outra metade essa nota ou menos. Diferente da média, ela
                não é puxada por notas muito baixas ou muito altas, comuns nas disciplinas difíceis.
              </span>
            </Ajuda>
          }
        />
        <CartaoResumo
          cor="escuro"
          valor={formata.inteiro(n?.alunos)}
          rotulo={`Alunos desde ${DESDE}`}
          descricao={n ? `${n.semestres} semestres com turma` : `Menos de ${MINIMO_ALUNOS} alunos desde ${DESDE}`}
        />
      </section>

      {d?.curriculo && (
        <div className="mt-5 grid grid-cols-3 gap-5 max-[1100px]:grid-cols-1">
          <Ligacoes titulo="Pré-requisitos" codigos={d.preRequisitos} nome={nome} vazio="Não tem pré-requisito." />
          <Ligacoes
            titulo="É pré-requisito de"
            codigos={liberadasPor(codigo)}
            nome={nome}
            vazio="Nenhuma disciplina depende desta."
          />
          <Ligacoes
            titulo={`Equivalente no currículo ${nova ? 2008 : 2022}`}
            codigos={equivalentes}
            nome={nome}
            vazio="Sem equivalência no PPC."
          />
        </div>
      )}

      <section className="mt-5 cartao rounded-[18px] px-[30px] pt-7 pb-[30px] max-celular:px-3.5 max-celular:py-5">
        <GraficoDisciplina nome={d?.nome ?? codigo} semestres={semestres} minimo={MINIMO_POR_SEMESTRE} />
      </section>
    </main>
  );
}
