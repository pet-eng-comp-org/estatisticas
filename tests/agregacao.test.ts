import { describe, expect, it } from "vitest";
import { estatistica, porSemestre, resumir } from "@/lib/notas/agregacao";
import { semestreDe } from "@/lib/notas/normaliza";

const nota = (semestre: string, situacao: string, media: number | null, curso = "Engenharia de Computação") => ({
  codigo: "INF15927",
  curso,
  media,
  situacao,
  semestre,
});

describe("agregação das notas", () => {
  it("conta só quem cursou e não deixa falta sem nota puxar a média", () => {
    const r = resumir([
      nota("2024/1", "Aprovado", 8),
      nota("2024/1", "Reprovado por Nota", 3),
      nota("2024/1", "Reprovado por Frequência", null),
      nota("2024/1", "Trancamento de Curso", null),
      nota("2024/2", "Aprovado", 7),
    ]).get("INF15927")!;
    expect(r.alunos).toBe(4);
    expect(r.semestres).toBe(2);
    const e = estatistica(r);
    expect(e.aprovacao).toBe(0.5);
    expect(e.media).toBeCloseTo(6, 6);
    expect(e.desvio).toBeCloseTo(Math.sqrt(((8 - 6) ** 2 + (3 - 6) ** 2 + (7 - 6) ** 2) / 3), 6);
  });

  it("aceita a grafia antiga das situações, com e sem acento", () => {
    const r = resumir([nota("2019/1", "REPROVADO POR FREQUENCIA", null), nota("2019/1", "aprovado", 9)]).get("INF15927")!;
    expect(r.reprovadosFalta).toBe(1);
    expect(r.aprovados).toBe(1);
  });

  it("separa a média dos alunos de computação por semestre", () => {
    const [s] = porSemestre([nota("2020/1", "Aprovado", 9), nota("2020/1", "Aprovado", 5, "Engenharia Elétrica")]);
    expect(s.media).toBe(7);
    expect(s.mediaComputacao).toBe(9);
  });

  it("lê os dois formatos de período do relatório", () => {
    expect(semestreDe("2019", "2")).toBe("2019/2");
    expect(semestreDe("2023", "201")).toBe("2023/1");
    expect(semestreDe("2023", "202")).toBe("2023/2");
    expect(semestreDe("2023", "301")).toBe("2023/C");
  });
});
