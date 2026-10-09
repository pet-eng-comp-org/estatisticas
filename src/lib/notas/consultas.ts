import "server-only";

import { and, eq, gte, isNotNull } from "drizzle-orm";
import { banco, schema, versaoDosDados } from "../db";
import { estatistica, porSemestre, resumir, type Estatistica, type Semestre } from "./agregacao";
import { calcularDificuldade } from "./dificuldade";

// O desempenho de 2012 não ajuda quem vai se matricular agora: os números
// dos cartões olham as turmas desde este ano.
export const DESDE = "2018";

// Com menos alunos que isso a taxa oscila demais para dizer alguma coisa.
export const MINIMO_ALUNOS = 10;

export const OPTATIVA = 99;

export type Curriculo = 2008 | 2022;

export type Disciplina = {
  codigo: string;
  nome: string;
  curriculo: Curriculo | null;
  periodo: number | null;
  obrigatoria: boolean;
  preRequisitos: string[];
  cargaHoraria: number | null;
};

export type NumerosDisciplina = Pick<
  Estatistica,
  "alunos" | "aprovados" | "aprovacao" | "reprovacao" | "media" | "desvio" | "semestres"
> & { dificuldade: number | null };

export type DisciplinaComNumeros = Disciplina & { numeros: NumerosDisciplina | null };

type Calculo = {
  versao: number;
  disciplinas: Map<string, Disciplina>;
  numeros: Map<string, NumerosDisciplina>;
};

let calculo: Calculo | null = null;

/**
 * Tudo que as páginas mostram sai daqui, calculado uma vez e guardado até a
 * próxima importação: o banco só muda uma vez por ano, e somar 30 mil notas a
 * cada visita seria trabalho jogado fora.
 */
function calcular(): Calculo {
  const versao = versaoDosDados();
  if (calculo && calculo.versao === versao) return calculo;

  const { db } = banco();
  const disciplinas = new Map<string, Disciplina>();
  for (const d of db.select().from(schema.disciplinas).all()) {
    disciplinas.set(d.codigo, {
      codigo: d.codigo,
      nome: d.nome,
      curriculo: d.curriculo === 2008 || d.curriculo === 2022 ? d.curriculo : null,
      periodo: d.periodo,
      obrigatoria: d.periodo !== null && d.periodo !== OPTATIVA,
      preRequisitos: d.preRequisitos.split(" ").filter(Boolean),
      cargaHoraria: d.cargaHoraria,
    });
  }

  const linhas = db
    .select({
      codigo: schema.notas.codigo,
      curso: schema.notas.curso,
      media: schema.notas.media,
      situacao: schema.notas.situacao,
      semestre: schema.notas.semestre,
    })
    .from(schema.notas)
    .where(gte(schema.notas.semestre, DESDE))
    .all();

  const resumos = Array.from(resumir(linhas).values()).filter(
    (r) => r.alunos >= MINIMO_ALUNOS && disciplinas.get(r.codigo)?.curriculo,
  );
  // As duas gerações entram na mesma régua: a dificuldade de uma disciplina
  // de 2008 e a de uma de 2022 podem ser comparadas.
  const dificuldades = calcularDificuldade(resumos);

  const numeros = new Map<string, NumerosDisciplina>();
  for (const r of resumos) {
    const e = estatistica(r);
    numeros.set(r.codigo, {
      alunos: e.alunos,
      aprovados: e.aprovados,
      aprovacao: e.aprovacao,
      reprovacao: e.reprovacao,
      media: e.media,
      desvio: e.desvio,
      semestres: e.semestres,
      dificuldade: dificuldades.get(r.codigo) ?? null,
    });
  }

  calculo = { versao, disciplinas, numeros };
  return calculo;
}

const comNumeros = (c: Calculo, d: Disciplina): DisciplinaComNumeros => ({
  ...d,
  numeros: c.numeros.get(d.codigo) ?? null,
});

/** Disciplinas de um currículo, em ordem de período e nome. */
export function disciplinasDoCurriculo(curriculo: Curriculo): DisciplinaComNumeros[] {
  const c = calcular();
  return Array.from(c.disciplinas.values())
    .filter((d) => d.curriculo === curriculo && d.periodo !== null)
    .sort((a, b) => a.periodo! - b.periodo! || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((d) => comNumeros(c, d));
}

export function disciplina(codigo: string): DisciplinaComNumeros | null {
  const c = calcular();
  const d = c.disciplinas.get(codigo);
  return d ? comNumeros(c, d) : null;
}

/** Nome de cada código, das duas gerações e de fora da grade. */
export function nomes(): Record<string, string> {
  const c = calcular();
  return Object.fromEntries(Array.from(c.disciplinas.values(), (d) => [d.codigo, d.nome]));
}

/** Quem tem esta disciplina como pré-requisito, na mesma geração. */
export function liberadasPor(codigo: string): string[] {
  const c = calcular();
  const d = c.disciplinas.get(codigo);
  return Array.from(c.disciplinas.values())
    .filter((x) => x.curriculo === d?.curriculo && x.preRequisitos.includes(codigo))
    .map((x) => x.codigo);
}

export type ResumoGeral = { disciplinas: number; alunos: number; aprovacao: number | null; media: number | null };

/** Os quatro números do topo da tela inicial. */
export function resumoGeral(curriculo: Curriculo): ResumoGeral {
  const lista = disciplinasDoCurriculo(curriculo).filter((d) => d.numeros);
  let alunos = 0;
  let aprovados = 0;
  let somaMedias = 0;
  for (const { numeros: n } of lista) {
    alunos += n!.alunos;
    aprovados += n!.aprovados;
    // Pondera pelos alunos: uma disciplina de 15 alunos não pesa tanto quanto
    // Cálculo I.
    somaMedias += (n!.media ?? 0) * n!.alunos;
  }
  return {
    disciplinas: lista.length,
    alunos,
    aprovacao: alunos ? aprovados / alunos : null,
    media: alunos ? somaMedias / alunos : null,
  };
}

/** Semestre a semestre, desde a primeira turma, para o gráfico. */
export function historico(codigo: string): Semestre[] {
  const linhas = banco()
    .db
    .select({
      codigo: schema.notas.codigo,
      curso: schema.notas.curso,
      media: schema.notas.media,
      situacao: schema.notas.situacao,
      semestre: schema.notas.semestre,
    })
    .from(schema.notas)
    .where(and(eq(schema.notas.codigo, codigo), isNotNull(schema.notas.semestre)))
    .all();
  return porSemestre(linhas);
}
