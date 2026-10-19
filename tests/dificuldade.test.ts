import { describe, expect, it } from "vitest";
import { calcularDificuldade, normal, type Entrada } from "@/lib/notas/dificuldade";

// Disciplina com `alunos` alunos, `aprovacao` deles aprovados e todas as notas
// iguais a `nota` (desvio zero), a não ser que `notas` seja dada.
function disciplina(codigo: string, alunos: number, aprovacao: number, nota: number, notas?: number[]): Entrada {
  const lista = notas ?? Array(alunos).fill(nota);
  return {
    codigo,
    alunos,
    aprovados: Math.round(alunos * aprovacao),
    comNota: lista.length,
    somaNotas: lista.reduce((s, x) => s + x, 0),
    somaQuadrados: lista.reduce((s, x) => s + x * x, 0),
  };
}

describe("dificuldade", () => {
  it("a curva normal acerta os pontos conhecidos", () => {
    expect(normal(0)).toBeCloseTo(0.5, 6);
    expect(normal(1.96)).toBeCloseTo(0.975, 3);
    expect(normal(-1.96)).toBeCloseTo(0.025, 3);
  });

  it("fica entre 1 e 5 e ordena pela reprovação e pela nota", () => {
    const d = calcularDificuldade([
      disciplina("FACIL", 200, 0.98, 9),
      disciplina("MEDIA", 200, 0.8, 7),
      disciplina("DIFICIL", 200, 0.5, 4),
    ]);
    const [f, m, x] = ["FACIL", "MEDIA", "DIFICIL"].map((c) => d.get(c)!);
    expect(f).toBeLessThan(m);
    expect(m).toBeLessThan(x);
    for (const v of [f, m, x]) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  it("turma polarizada sai mais difícil que turma uniforme com a mesma média", () => {
    const uniforme = disciplina("UNIFORME", 100, 0.8, 6);
    const polarizada = disciplina("POLARIZADA", 100, 0.8, 6, [...Array(50).fill(2), ...Array(50).fill(10)]);
    const outras = [disciplina("A", 100, 0.9, 8), disciplina("B", 100, 0.6, 5)];
    const d = calcularDificuldade([uniforme, polarizada, ...outras]);
    expect(d.get("POLARIZADA")!).toBeGreaterThan(d.get("UNIFORME")!);
  });

  it("puxa para o meio a disciplina com poucos alunos", () => {
    const base = [disciplina("A", 300, 0.95, 8.5), disciplina("B", 300, 0.7, 6), disciplina("C", 300, 0.55, 4.5)];
    const pequena = calcularDificuldade([...base, disciplina("P", 10, 0.3, 3)]).get("P")!;
    const grande = calcularDificuldade([...base, disciplina("P", 400, 0.3, 3)]).get("P")!;
    expect(pequena).toBeLessThan(grande);
  });

  it("não calcula com menos de duas disciplinas nem sem notas", () => {
    expect(calcularDificuldade([disciplina("SO", 50, 0.5, 5)]).size).toBe(0);
    const semNota = { ...disciplina("X", 50, 0.5, 5), comNota: 0, somaNotas: 0, somaQuadrados: 0 };
    expect(calcularDificuldade([semNota, disciplina("A", 50, 0.9, 8), disciplina("B", 50, 0.6, 5)]).has("X")).toBe(
      false,
    );
  });
});
