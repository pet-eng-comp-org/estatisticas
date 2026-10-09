import { describe, expect, it } from "vitest";
import { desenhar, rotear, type Caixa } from "@/lib/grade/rotas";

// Grade de mentira: colunas de 270 px a cada 334, linhas de 88 px a cada 120.
const caixa = (coluna: number, linha: number): Caixa => ({
  esquerda: coluna * 334,
  direita: coluna * 334 + 270,
  topo: linha * 120,
  meio: linha * 120 + 44,
  coluna,
  linha,
});

describe("traçado das setas da grade", () => {
  const caixas = { A: caixa(0, 0), B: caixa(0, 3), X: caixa(1, 1), Y: caixa(1, 2), Z: caixa(2, 3), W: caixa(1, 3) };
  const ocupado = new Set(Object.values(caixas).map((c) => `${c.coluna},${c.linha}`));
  const livre = (c: number, l: number) => !ocupado.has(`${c},${l}`);

  it("disciplinas de origem diferentes descem por trilhos diferentes", () => {
    const rotas = rotear([{ de: "A", para: "Y" }, { de: "B", para: "X" }], caixas, livre);
    const trilho = (de: string) => rotas.find((r) => r.de === de)!.segmentos[1].x1;
    expect(trilho("A")).not.toBe(trilho("B"));
  });

  it("dá um saltinho onde a horizontal cruza a vertical de outra seta", () => {
    // A desce até Y (linha 2); B sobe até X (linha 1). A horizontal final de
    // uma cruza a vertical da outra.
    const rotas = rotear([{ de: "A", para: "Y" }, { de: "B", para: "X" }], caixas, livre);
    const caminhos = [...desenhar(rotas).values()];
    expect(caminhos.some((d) => d.includes("A5 5"))).toBe(true);
  });

  it("não salta onde setas para o mesmo destino se juntam", () => {
    const rotas = rotear([{ de: "A", para: "X" }, { de: "B", para: "X" }], caixas, livre);
    for (const d of desenhar(rotas).values()) expect(d).not.toContain("A");
  });

  it("setas que pulam colunas para o mesmo destino dividem trilho e altura", () => {
    const rotas = rotear([{ de: "A", para: "Z" }, { de: "B", para: "Z" }], caixas, livre);
    const [r1, r2] = rotas;
    // Segmento horizontal no vão e trilho de chegada são os mesmos.
    expect(r1.segmentos.at(-3)!.y1).toBe(r2.segmentos.at(-3)!.y1);
    expect(r1.segmentos.at(-2)!.x1).toBe(r2.segmentos.at(-2)!.x1);
  });

  it("na mesma linha, com o caminho livre, é uma reta", () => {
    const [r] = rotear([{ de: "A", para: "W" }], { A: caixa(0, 3), W: caixa(1, 3) }, () => true);
    expect(r.segmentos).toHaveLength(1);
  });
});

import { rotasDeReferencia } from "@/lib/grade/rotas";
import { SETAS_2022 } from "@/lib/curriculos/setas-2022";
import { MATRIZ_2022 } from "@/lib/curriculos/matriz";
import { GRADE_ECOMP_2022 } from "@/lib/curriculos/grade-2022";

describe("percursos da matriz oficial", () => {
  it("as 43 setas entre colunas viram linhas retas que encostam nos cartões", () => {
    const periodo = new Map(GRADE_ECOMP_2022.map((d) => [d.codigo_disciplina, d.periodo_ecomp]));
    const caixas: Record<string, Caixa> = {};
    for (const [codigo, lugar] of Object.entries(MATRIZ_2022)) caixas[codigo] = caixa(periodo.get(codigo)! - 1, lugar.linha);
    const ligacoes = SETAS_2022.map(([de, para]) => ({ de, para })).filter((l) => caixas[l.de].coluna !== caixas[l.para].coluna);
    const rotas = rotasDeReferencia(SETAS_2022, ligacoes, caixas);
    expect(rotas).toHaveLength(43);
    for (const r of rotas) {
      for (const s of r.segmentos) expect(s.x1 === s.x2 || s.y1 === s.y2).toBe(true);
      const ultimo = r.segmentos.at(-1)!;
      const d = caixas[r.para];
      const encosta = ultimo.x2 === d.esquerda - 2 || ultimo.y2 === d.topo - 2 || ultimo.y2 === d.topo + 88 + 2;
      expect(encosta, `${r.de}>${r.para}`).toBe(true);
    }
  });
});
