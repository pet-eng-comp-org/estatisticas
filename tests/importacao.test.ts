import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/lib/db/schema";
import { gravar, lerRelatorio } from "@/lib/notas/importacao";
import { listaDeCodigos, montarDisciplinas, sincronizarGrade } from "@/lib/curriculos/montagem";
import { eq } from "drizzle-orm";

let db: ReturnType<typeof drizzle<typeof schema>>;
beforeEach(() => {
  const conexao = new Database(":memory:");
  db = drizzle(conexao, { schema, casing: "snake_case" });
  migrate(db, { migrationsFolder: "./drizzle" });
});

const CABECALHO = "COD_DISCIPLINA,NOME_DISCIPLINA,NOME_CURSO_ALUNO,MEDIA_FINAL,SITUACAO,ANO,PERIODO,NOME_DOCENTE,MATR_ALUNO";
const csv = (...linhas: string[]) => [CABECALHO, ...linhas].join("\n");
const contar = () => db.select().from(schema.notas).all().length;

describe("importação do relatório", () => {
  it("lê o formato de 2022 em diante (período 201, sem matrícula, média vazia)", () => {
    const { notas, problemas } = lerRelatorio(
      csv(
        "INF15927,PROGRAMAÇÃO I,Engenharia de Computação,\"7,5\",Aprovado,2023,201,Fulano,",
        "INF15927,PROGRAMAÇÃO I,Engenharia de Computação,,Reprovado por Frequencia,2023,201,Fulano,",
        ",Total,,,,,,,",
      ),
    );
    expect(problemas).toEqual([]);
    expect(notas).toHaveLength(2);
    expect(notas[0]).toMatchObject({ codigo: "INF15927", media: 7.5, semestre: "2023/1", matricula: "" });
    expect(notas[1]).toMatchObject({ media: null, situacao: "Reprovado por Frequência" });
  });

  it("recusa o arquivo inteiro se uma linha tiver dado inválido", () => {
    const { problemas } = lerRelatorio(csv("INF15927,X,Curso,11,Aprovado,2023,1,F,1", "inf1,X,Curso,5,Aprovado,2023,1,F,2"));
    expect(problemas.map((p) => p.linha)).toEqual([2, 3]);
  });

  it("com matrícula, reimportar o mesmo arquivo não duplica", () => {
    const { notas } = lerRelatorio(csv("INF09330,PROG II,Eng,8,Aprovado,2019,1,F,2017100001", "INF09330,PROG II,Eng,4,Reprovado por Nota,2019,1,F,2017100002"));
    expect(gravar(db, notas, false)).toMatchObject({ ok: true, inseridos: 2 });
    expect(gravar(db, notas, false)).toMatchObject({ ok: true, inseridos: 0, repetidos: 2 });
    expect(contar()).toBe(2);
  });

  it("sem matrícula e com dado já gravado, pede para substituir e substitui só o que o arquivo cobre", () => {
    const { notas } = lerRelatorio(csv("INF15927,PROG I,Eng,8,Aprovado,2023,201,F,", "INF15927,PROG I,Eng,6,Aprovado,2023,201,F,"));
    const outra = lerRelatorio(csv("MAT15925,CALC I,Eng,5,Aprovado,2023,201,F,")).notas;
    gravar(db, notas, false);
    gravar(db, outra, false);
    expect(gravar(db, notas, false)).toMatchObject({ ok: false, conflito: true, existentes: 2 });
    expect(gravar(db, notas, true)).toMatchObject({ ok: true, removidos: 2, inseridos: 2 });
    // Cálculo I, que não estava no arquivo, continua lá.
    expect(contar()).toBe(3);
  });

  it("substituir apaga só os pares (disciplina, semestre) do arquivo, não o cruzamento", () => {
    gravar(
      db,
      lerRelatorio(
        csv(
          "INF15927,PROG I,Eng,8,Aprovado,2022,201,F,",
          "MAT15925,CALC I,Eng,5,Aprovado,2022,201,F,",
          "INF15927,PROG I,Eng,7,Aprovado,2023,201,F,",
          "MAT15925,CALC I,Eng,6,Aprovado,2023,201,F,",
        ),
      ).notas,
      false,
    );
    const arquivo = lerRelatorio(
      csv("INF15927,PROG I,Eng,9,Aprovado,2022,201,F,", "MAT15925,CALC I,Eng,9,Aprovado,2023,201,F,"),
    ).notas;
    expect(gravar(db, arquivo, true)).toMatchObject({ ok: true, removidos: 2, inseridos: 2 });
    expect(contar()).toBe(4);
  });

  it("dá nome a disciplina que ainda não existe no banco", () => {
    gravar(db, lerRelatorio(csv("INF99999,DISCIPLINA NOVA,Eng,8,Aprovado,2025,201,F,")).notas, false);
    expect(db.select().from(schema.disciplinas).all()).toEqual([
      expect.objectContaining({ codigo: "INF99999", nome: "DISCIPLINA NOVA", curriculo: null }),
    ]);
  });
});

describe("montagem das disciplinas", () => {
  it("normaliza pré-requisitos separados por vírgula ou espaço", () => {
    expect(listaDeCodigos("ELE08557,MAT09570")).toBe("ELE08557 MAT09570");
    expect(listaDeCodigos("INF15973 INF15927")).toBe("INF15973 INF15927");
    expect(listaDeCodigos("nao especificado")).toBe("");
  });

  it("marca 2008, 2022 e fora da grade, com a carga horária dos documentos", () => {
    const linhas = montarDisciplinas([
      { codigo_disciplina: "MAT09570", nome: "Cálculo I", periodo_ecomp: 1, pre_requisitos_ecomp: null },
      { codigo_disciplina: "INF09999", nome: "De outro curso", periodo_ecomp: null, pre_requisitos_ecomp: null },
      // Uma de 2022 que o banco antigo também tinha: vale a grade do código.
      { codigo_disciplina: "MAT15925", nome: "CALCULO I", periodo_ecomp: 3, pre_requisitos_ecomp: "X" },
      // Optativa de 2022 que trocou de código na revisão de 2025.
      { codigo_disciplina: "INF16168", nome: "Desenvolvimento Orientado a Modelos", periodo_ecomp: 99, pre_requisitos_ecomp: null, curriculo: 2022 },
    ]);
    const por = Object.fromEntries(linhas.map((l) => [l.codigo, l]));
    expect(por.MAT09570).toMatchObject({ curriculo: 2008, periodo: 1, cargaHoraria: 90 });
    expect(por.INF09999).toMatchObject({ curriculo: null, periodo: null });
    expect(por.INF16168).toMatchObject({ curriculo: null, periodo: null });
    expect(por.MAT15925).toMatchObject({ curriculo: 2022, periodo: 1, nome: "Cálculo I", cargaHoraria: 90 });
    expect(linhas.filter((l) => l.curriculo === 2022)).toHaveLength(132);
  });
});

describe("sincronização da grade", () => {
  it("corrige a grade 2022 do banco pelo código e tira da grade o que saiu dela", () => {
    db.insert(schema.disciplinas)
      .values([
        { codigo: "INF16198", nome: "TCC I", curriculo: 2022, periodo: 9, preRequisitos: "" },
        { codigo: "INF16168", nome: "Desenvolvimento Orientado a Modelos", curriculo: 2022, periodo: 99 },
        { codigo: "MAT09570", nome: "Cálculo I", curriculo: 2008, periodo: 1 },
      ])
      .run();
    sincronizarGrade(db);
    const por = (c: string) => db.select().from(schema.disciplinas).where(eq(schema.disciplinas.codigo, c)).get();
    expect(por("INF16198")).toMatchObject({ nome: "Trabalho de Conclusão de Curso I", preRequisitos: "INF16165", cargaHoraria: 60 });
    expect(por("INF16168")).toMatchObject({ curriculo: null, periodo: null });
    expect(por("MAT09570")).toMatchObject({ curriculo: 2008, cargaHoraria: 90 });
    expect(db.select().from(schema.disciplinas).where(eq(schema.disciplinas.curriculo, 2022)).all()).toHaveLength(132);
  });
});
