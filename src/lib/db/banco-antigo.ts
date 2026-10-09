// Copia o banco do site antigo (SQLite do knex, tabelas `items` e
// `disciplines`) para o banco novo. O arquivo antigo só é lido, nunca
// alterado: voltar para a versão anterior continua sendo só trocar a imagem.

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { montarDisciplinas, type DisciplinaAntiga } from "../curriculos/montagem";
import { mediaDe } from "../notas/normaliza";

export function copiarBancoAntigo(origem: string, destino: Database.Database) {
  const antigo = new Database(origem, { readonly: true, fileMustExist: true });
  // A coluna curriculo só existe a partir da migration 04 do site antigo.
  const temCurriculo = (antigo.prepare("pragma table_info(disciplines)").all() as { name: string }[]).some(
    (c) => c.name === "curriculo",
  );
  const disciplinasAntigas = antigo
    .prepare(
      `select codigo_disciplina, nome, periodo_ecomp, pre_requisitos_ecomp${temCurriculo ? ", curriculo" : ""} from disciplines`,
    )
    .all() as DisciplinaAntiga[];
  const itens = antigo
    .prepare("select codigo_disciplina, nome_disciplina, curso, media, situacao, ano, professor, matricula from items")
    .all() as Array<Record<string, string | number | null>>;
  antigo.close();

  const db = drizzle(destino, { schema, casing: "snake_case" });
  const disciplinas = montarDisciplinas(disciplinasAntigas);
  const notas = itens.map((i) => ({
    codigo: String(i.codigo_disciplina).trim(),
    nomeDisciplina: String(i.nome_disciplina ?? "").trim(),
    curso: String(i.curso ?? "").trim(),
    media: mediaDe(i.media),
    situacao: String(i.situacao ?? "").trim(),
    semestre: String(i.ano ?? "").trim(),
    professor: String(i.professor ?? "").trim(),
    matricula: String(i.matricula ?? "").trim(),
  }));

  // Tudo ou nada: cada execução apaga e recria as duas tabelas.
  db.transaction((tx) => {
    tx.delete(schema.notas).run();
    tx.delete(schema.disciplinas).run();
    for (let i = 0; i < disciplinas.length; i += 200) tx.insert(schema.disciplinas).values(disciplinas.slice(i, i + 200)).run();
    for (let i = 0; i < notas.length; i += 500) tx.insert(schema.notas).values(notas.slice(i, i + 500)).run();
    // Disciplina que só aparece nas notas ganha linha com o nome dela.
    const conhecidas = new Set(disciplinas.map((d) => d.codigo));
    const soNasNotas = new Map(notas.filter((n) => !conhecidas.has(n.codigo)).map((n) => [n.codigo, n.nomeDisciplina]));
    for (const [codigo, nome] of soNasNotas) tx.insert(schema.disciplinas).values({ codigo, nome }).run();
  });
  return { disciplinas: disciplinas.length, notas: notas.length };
}
