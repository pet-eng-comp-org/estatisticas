import { describe, expect, it } from "vitest";
import { ordenar } from "@/lib/ordenacao";

const d = (nome: string, periodo: number, dificuldade: number | null, aprovacao = 0.5) => ({
  nome,
  periodo,
  numeros: dificuldade === null ? null : { dificuldade, aprovacao },
});

const lista = [d("Cálculo I", 1, 4.9, 0.53), d("Sem dados", 2, null), d("Física I", 2, 3.2, 0.82), d("Álgebra", 1, 4.9, 0.55)];
const nomes = (l: { nome: string }[]) => l.map((x) => x.nome);

describe("ordenação das disciplinas", () => {
  it("mais difícil primeiro, empate pelo nome, sem dados no fim", () => {
    expect(nomes(ordenar(lista, "dificil"))).toEqual(["Álgebra", "Cálculo I", "Física I", "Sem dados"]);
  });
  it("mais fácil primeiro também deixa sem dados no fim", () => {
    expect(nomes(ordenar(lista, "facil"))).toEqual(["Física I", "Álgebra", "Cálculo I", "Sem dados"]);
  });
  it("por aprovação e por período", () => {
    expect(nomes(ordenar(lista, "menor-aprovacao"))).toEqual(["Cálculo I", "Álgebra", "Física I", "Sem dados"]);
    expect(nomes(ordenar(lista, "periodo"))).toEqual(["Álgebra", "Cálculo I", "Física I", "Sem dados"]);
  });
  it("não altera a lista recebida", () => {
    const copia = [...lista];
    ordenar(lista, "nome");
    expect(lista).toEqual(copia);
  });
});
