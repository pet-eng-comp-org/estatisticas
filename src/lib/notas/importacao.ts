// Leitura do relatório de notas da coordenação (CSV) e gravação no banco.
// Fica fora do script para os testes poderem chamar com um banco de teste.

import { parse } from "csv-parse/sync";
import { and, inArray, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { z } from "zod";
import * as schema from "../db/schema";
import { mediaDe, semestreDe, situacaoCanonica } from "./normaliza";

type Banco = BetterSQLite3Database<typeof schema>;
export type NotaNova = typeof schema.notas.$inferInsert;

// O relatório mudou de cabeçalho em 2022. Aceita os dois.
function campo(linha: Record<string, string>, ...nomes: string[]): string {
  for (const n of nomes) {
    const v = linha[n];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

const Linha = z.object({
  codigo: z.string().regex(/^[A-Z]{3}\d{5}$/, "código de disciplina inválido"),
  nomeDisciplina: z.string().min(1),
  curso: z.string(),
  media: z.number().min(0).max(10).nullable(),
  situacao: z.string().min(1),
  semestre: z.string().regex(/^\d{4}\/[\dC]$/, "semestre inválido"),
  professor: z.string(),
  matricula: z.string(),
});

export type Problema = { linha: number; erro: string };

/**
 * Converte o CSV em linhas de nota. Linha sem código de disciplina é pulada
 * (o relatório traz rodapés e totais); linha com código e dado inválido vira
 * problema e interrompe a importação, para não gravar metade de um arquivo.
 */
export function lerRelatorio(texto: string): { notas: NotaNova[]; problemas: Problema[] } {
  const registros: Record<string, string>[] = parse(texto, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
  });

  const notas: NotaNova[] = [];
  const problemas: Problema[] = [];
  registros.forEach((r, i) => {
    const codigo = campo(r, "COD_DISCIPLINA");
    if (!codigo) return;
    const candidato = {
      codigo,
      nomeDisciplina: campo(r, "NOME_DISCIPLINA"),
      curso: campo(r, "NOME_CURSO_ALUNO", "NOME_CURSO"),
      media: mediaDe(campo(r, "MEDIA_FINAL")),
      situacao: situacaoCanonica(campo(r, "SITUACAO")),
      semestre: semestreDe(campo(r, "ANO"), campo(r, "PERIODO", "PERIODO_ITEM")),
      professor: campo(r, "NOME_DOCENTE"),
      matricula: campo(r, "MATR_ALUNO"),
    };
    const ok = Linha.safeParse(candidato);
    if (ok.success) notas.push(ok.data);
    // +2: a linha 1 é o cabeçalho e a contagem começa em 1.
    else problemas.push({ linha: i + 2, erro: ok.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ") });
  });
  return { notas, problemas };
}

export type Resultado =
  | { ok: true; lidos: number; inseridos: number; repetidos: number; removidos: number; semestres: string[] }
  | { ok: false; conflito: true; semestres: string[]; existentes: number };

/**
 * Relatórios até 2021 trazem a matrícula, que identifica a linha: dá para
 * reimportar o mesmo arquivo sem duplicar. Os de 2022 em diante não trazem, e
 * aí duas linhas iguais são dois alunos, não uma repetição. Sem matrícula e
 * com dado já gravado daquelas disciplinas e semestres, a importação para e
 * pede `substituir`: apaga e regrava só o que o arquivo cobre.
 */
export function gravar(db: Banco, notas: NotaNova[], substituir: boolean): Resultado {
  const semestres = Array.from(new Set(notas.map((n) => n.semestre)));
  const codigos = Array.from(new Set(notas.map((n) => n.codigo)));
  const semMatricula = notas.filter((n) => !n.matricula);

  if (semMatricula.length > 0 && !substituir) {
    const anos = Array.from(new Set(semMatricula.map((n) => n.semestre)));
    const disciplinas = Array.from(new Set(semMatricula.map((n) => n.codigo)));
    const [{ n }] = db
      .select({ n: sql<number>`count(*)` })
      .from(schema.notas)
      .where(and(inArray(schema.notas.semestre, anos), inArray(schema.notas.codigo, disciplinas)))
      .all();
    if (n > 0) return { ok: false, conflito: true, semestres, existentes: n };
  }

  return db.transaction((tx) => {
    let removidos = 0;
    if (substituir) {
      // Só o que o arquivo cobre: um relatório só das disciplinas do DI não
      // pode apagar as de Matemática daquele semestre.
      removidos = tx
        .delete(schema.notas)
        .where(and(inArray(schema.notas.semestre, semestres), inArray(schema.notas.codigo, codigos)))
        .run().changes;
    }

    // Matrículas já gravadas, para pular reimportação sem uma consulta por linha.
    const vistas = new Set<string>();
    if (!substituir) {
      const comMatricula = notas.filter((n) => n.matricula);
      if (comMatricula.length > 0) {
        tx.select({ c: schema.notas.codigo, m: schema.notas.matricula, s: schema.notas.semestre })
          .from(schema.notas)
          .where(inArray(schema.notas.semestre, Array.from(new Set(comMatricula.map((n) => n.semestre)))))
          .all()
          .forEach((x) => x.m && vistas.add(`${x.c}|${x.m}|${x.s}`));
      }
    }

    let inseridos = 0;
    let repetidos = 0;
    const novas: NotaNova[] = [];
    for (const n of notas) {
      const chave = `${n.codigo}|${n.matricula}|${n.semestre}`;
      if (n.matricula && vistas.has(chave)) {
        repetidos++;
        continue;
      }
      if (n.matricula) vistas.add(chave);
      novas.push(n);
      inseridos++;
    }
    // Em blocos: o SQLite limita o número de parâmetros por comando.
    for (let i = 0; i < novas.length; i += 500) tx.insert(schema.notas).values(novas.slice(i, i + 500)).run();

    // Disciplina que ainda não existe no banco (optativa nova, de outro
    // curso) entra só com o nome, fora da grade: a página dela precisa dele.
    const nomePorCodigo = new Map(notas.map((n) => [n.codigo, n.nomeDisciplina]));
    for (const [codigo, nome] of nomePorCodigo) {
      tx.insert(schema.disciplinas).values({ codigo, nome }).onConflictDoNothing().run();
    }

    return { ok: true as const, lidos: notas.length, inseridos, repetidos, removidos, semestres };
  });
}
