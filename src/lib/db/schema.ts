import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Disciplinas das grades de Engenharia de Computação. As duas gerações de
 * currículo convivem: a de 2008, que ainda tem série histórica, e a de 2022,
 * em vigor. Disciplina que não é de nenhuma das duas grades (de Ciência da
 * Computação, por exemplo) fica com `curriculo` nulo: só serve para dar nome
 * às notas dela.
 */
export const disciplinas = sqliteTable("disciplinas", {
  codigo: text().primaryKey(),
  nome: text().notNull(),
  curriculo: integer(), // 2008 | 2022 | null
  // 1 a 10; 99 é optativa. Nulo quando não está na grade de Engenharia.
  periodo: integer(),
  // Códigos separados por espaço, na ordem do documento do currículo.
  preRequisitos: text().notNull().default(""),
  cargaHoraria: integer(),
});

/**
 * Uma linha por aluno por disciplina por semestre, como vem do relatório da
 * coordenação. A matrícula só existe nos relatórios até 2021 e serve só para
 * reimportar sem duplicar: nada no site a mostra.
 */
export const notas = sqliteTable(
  "notas",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    codigo: text().notNull(),
    nomeDisciplina: text().notNull(),
    curso: text().notNull(),
    media: real(),
    situacao: text().notNull(),
    semestre: text().notNull(), // "2024/1"
    professor: text().notNull(),
    matricula: text().notNull().default(""),
  },
  (t) => [
    index("notas_codigo").on(t.codigo),
    index("notas_codigo_semestre").on(t.codigo, t.semestre),
    index("notas_semestre").on(t.semestre),
  ],
);
