import { describe, expect, it } from "vitest";
import { GRADE_ECOMP_2022 } from "@/lib/curriculos/grade-2022";
import { MATRIZ_2008, MATRIZ_2022 } from "@/lib/curriculos/matriz";

// As 44 setas da "Representação Gráfica da Matriz Curricular - 2022 (Revisão
// 2024)" do DI, tiradas do PDF (cada seta é um traço; as pontas foram ligadas
// às caixas das disciplinas). A seta de duas pontas PIC2HW-PIC2SW é a de
// co-requisito. Se uma revisão da grade mudar pré-requisito, este teste mostra
// onde o site deixou de bater com a matriz oficial.
const OFICIAIS = [
  "AMSD>SReal",
  "AOC>SEmb1",
  "AOC>SO",
  "AlgLin>CEle1",
  "CEle1>CEle2",
  "CEle2>EB1",
  "CEle2>SS",
  "CLog>AOC",
  "Calc1>AlgLin",
  "Calc1>Calc2",
  "Calc1>Fis1",
  "Calc1>Prob",
  "Calc2>Calc3",
  "Calc2>Calc4",
  "Calc3>EMag1",
  "Calc4>CEle2",
  "ED>POO",
  "ED>SO",
  "ED>TBO",
  "EMag1>EMag2",
  "Econ>Gestão",
  "Fis1>Fis2",
  "HST>ALeg",
  "Log1>CLog",
  "MP>TCC1",
  "PIC2HW>PIC2SW",
  "PLab>CEle1",
  "PLab>PIC1",
  "POO>ES1",
  "POO>MP",
  "POO>PaP",
  "Prob>Econ",
  "Prob>SS",
  "Prog1>CLog",
  "Prog1>PIC1",
  "Prog1>Prog2",
  "Prog2>ED",
  "SEmb1>PIC2HW",
  "SEmb1>PIC2SW",
  "SO>Redes",
  "SS>AMSD",
  "TBO>BD1",
  "TBO>ComCom",
  "TCC1>TCC2",
];

describe("setas da grade 2022", () => {
  it("são as mesmas da matriz oficial: pré-requisitos menos as etiquetas", () => {
    const sigla = (c: string) => MATRIZ_2022[c].sigla;
    const periodo = new Map(GRADE_ECOMP_2022.map((d) => [d.codigo_disciplina, d.periodo_ecomp]));
    const doSite = new Set<string>();
    for (const d of GRADE_ECOMP_2022) {
      const lugar = MATRIZ_2022[d.codigo_disciplina];
      if (!lugar) continue;
      for (const pre of (d.pre_requisitos_ecomp ?? "").split(" ").filter(Boolean)) {
        if (!MATRIZ_2022[pre] || lugar.etiquetas?.includes(pre)) continue;
        // Co-requisito (mesmo período) vira uma seta só, de duas pontas.
        const par = periodo.get(pre) === d.periodo_ecomp ? [sigla(pre), lugar.sigla].sort() : [sigla(pre), lugar.sigla];
        doSite.add(par.join(">"));
      }
    }
    const oficiais = OFICIAIS.map((p) => (p === "PIC2HW>PIC2SW" ? ["PIC2HW", "PIC2SW"].sort().join(">") : p));
    expect([...doSite].sort()).toEqual(oficiais.sort());
  });

  it("toda etiqueta é pré-requisito de verdade", () => {
    for (const d of GRADE_ECOMP_2022) {
      const pre = (d.pre_requisitos_ecomp ?? "").split(" ");
      for (const e of MATRIZ_2022[d.codigo_disciplina]?.etiquetas ?? []) expect(pre).toContain(e);
    }
  });
});

describe("desenho da grade 2008", () => {
  it("tem siglas únicas e etiquetas que apontam para disciplinas do próprio desenho", () => {
    const siglas = Object.values(MATRIZ_2008).map((l) => l.sigla);
    expect(new Set(siglas).size).toBe(siglas.length);
    for (const lugar of Object.values(MATRIZ_2008))
      for (const e of lugar.etiquetas ?? []) expect(MATRIZ_2008[e], e).toBeDefined();
  });
});

