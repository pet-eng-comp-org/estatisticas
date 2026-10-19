// Monta a tabela de disciplinas a partir das duas fontes: a grade 2022, que
// está no código, e o que o banco antigo trazia (grade 2008 e disciplinas de
// outros cursos). Usado pela importação do banco antigo e pelos testes.

import { CARGA_HORARIA_2008, CARGA_HORARIA_2022 } from "./carga-horaria";
import { GRADE_ECOMP_2022 } from "./grade-2022";
import { and, eq, notInArray } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../db/schema";

export type DisciplinaAntiga = {
  codigo_disciplina: string;
  nome: string;
  periodo_ecomp: number | null;
  pre_requisitos_ecomp: string | null;
  // 2022 nas disciplinas que o banco antigo marcou como da grade nova.
  curriculo?: number | null;
};

type Linha = typeof schema.disciplinas.$inferInsert;

/** Códigos separados por espaço: a grade 2022 usava espaço, a de 2008 vírgula. */
export function listaDeCodigos(texto: string | null | undefined): string {
  if (!texto) return "";
  return String(texto)
    .split(/[\s,;]+/)
    .filter((c) => /^[A-Z]{3}\d{5}$/.test(c))
    .join(" ");
}

export function montarDisciplinas(antigas: DisciplinaAntiga[]): Linha[] {
  const codigos2022 = new Set(GRADE_ECOMP_2022.map((d) => d.codigo_disciplina));
  const linhas = new Map<string, Linha>();

  for (const d of antigas) {
    const codigo = d.codigo_disciplina.trim();
    if (codigos2022.has(codigo)) continue;
    // Marcada como 2022 no banco antigo e fora da grade atual: optativa que
    // trocou de código numa revisão. Fica fora da grade, só com o nome.
    const naGrade = d.curriculo !== 2022 && d.periodo_ecomp !== null && d.periodo_ecomp !== undefined;
    linhas.set(codigo, {
      codigo,
      nome: d.nome.trim(),
      curriculo: naGrade ? 2008 : null,
      periodo: naGrade ? Number(d.periodo_ecomp) : null,
      preRequisitos: naGrade ? listaDeCodigos(d.pre_requisitos_ecomp) : "",
      cargaHoraria: CARGA_HORARIA_2008[codigo] ?? null,
    });
  }

  for (const l of linhasDe2022()) linhas.set(l.codigo, l);
  return Array.from(linhas.values());
}

function linhasDe2022(): Linha[] {
  return GRADE_ECOMP_2022.map((d) => ({
    codigo: d.codigo_disciplina,
    nome: d.nome,
    curriculo: 2022,
    periodo: d.periodo_ecomp,
    preRequisitos: listaDeCodigos(d.pre_requisitos_ecomp),
    cargaHoraria: CARGA_HORARIA_2022[d.codigo_disciplina] ?? null,
  }));
}

/**
 * Leva para o banco o que da grade mora no código: a grade 2022 inteira e a
 * carga horária de 2008. Roda a cada subida do container, então uma revisão
 * da grade chega a produção com um deploy, sem mexer nas notas. Disciplina
 * que saiu da grade 2022 (optativa que trocou de código) fica no banco só com
 * o nome, fora da grade.
 */
export function sincronizarGrade(db: BetterSQLite3Database<typeof schema>) {
  const linhas = linhasDe2022();
  db.transaction((tx) => {
    for (const l of linhas) {
      const { codigo, ...resto } = l;
      tx.insert(schema.disciplinas)
        .values(l)
        .onConflictDoUpdate({ target: schema.disciplinas.codigo, set: resto })
        .run();
    }
    tx.update(schema.disciplinas)
      .set({ curriculo: null, periodo: null, preRequisitos: "" })
      .where(
        and(
          eq(schema.disciplinas.curriculo, 2022),
          notInArray(
            schema.disciplinas.codigo,
            linhas.map((l) => l.codigo),
          ),
        ),
      )
      .run();
    for (const [codigo, horas] of Object.entries(CARGA_HORARIA_2008)) {
      tx.update(schema.disciplinas).set({ cargaHoraria: horas }).where(eq(schema.disciplinas.codigo, codigo)).run();
    }
  });
}
