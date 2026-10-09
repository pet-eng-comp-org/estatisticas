import { chaveBusca } from "../formato";

// Desenho da grade: área de cada disciplina, posição na coluna e quais
// pré-requisitos viram etiqueta em vez de seta.
//
// Para o currículo 2022 tudo vem da "Representação Gráfica da Matriz
// Curricular - 2022 (Revisão 2024)" do Departamento de Informática
// (https://informatica.ufes.br/pt-br/ppc-engcomp): o DI escolheu a linha de
// cada disciplina para as setas não se cruzarem, e os pré-requisitos distantes
// aparecem como etiqueta no cartão. O currículo 2008 não tem desenho oficial:
// a área sai do departamento e do nome, e a posição é calculada (QuadroGrade).

export type Area =
  | "matematica"
  | "fisica"
  | "eletrica"
  | "programacao"
  | "sistemas"
  | "informatica"
  | "humanidades"
  | "estagio"
  | "optativa";

export const AREAS: Record<Area, { nome: string; borda: string; fundo: string; faixa: string }> = {
  // Cores das áreas da matriz oficial, nos tons pastel do mockup da Bia:
  // borda na cor da área, fundo quase branco e faixa lateral clara. Outras de
  // Informática e Humanidades ficam com o rosa e o verde do próprio mockup.
  matematica: { nome: "Matemática", borda: "#E8913A", fundo: "#FFF8F1", faixa: "#FFC48A" },
  fisica: { nome: "Física", borda: "#1BA8D6", fundo: "#F2FBFE", faixa: "#8EDDF5" },
  eletrica: { nome: "Elétrica", borda: "#C9A800", fundo: "#FFFDEB", faixa: "#FFE873" },
  programacao: { nome: "Programação", borda: "#4A8FD9", fundo: "#F3F8FE", faixa: "#A8CCF5" },
  sistemas: { nome: "Sistemas", borda: "#9B5FD6", fundo: "#F9F4FE", faixa: "#D2B3F5" },
  informatica: { nome: "Outras de Informática", borda: "#BF2D5D", fundo: "#FFF8FB", faixa: "#FF6B9D" },
  humanidades: { nome: "Humanidades", borda: "#43AB4D", fundo: "#F6FFF7", faixa: "#A6FFAE" },
  estagio: { nome: "Estágio e TCC", borda: "#6E9A0A", fundo: "#F7FBEC", faixa: "#B9DB5C" },
  optativa: { nome: "Optativas", borda: "#A8A0A4", fundo: "#FAFAFA", faixa: "#DADADA" },
};

type Lugar = { linha: number; area: Area; sigla: string; etiquetas?: string[] };

/** Currículo 2022, coluna a coluna como na matriz oficial (linha 0 é a de cima). */
export const MATRIZ_2022: Record<string, Lugar> = {
  // 1º período
  MAT15925: { linha: 0, area: "matematica", sigla: "Calc1" },
  ELE15924: { linha: 3, area: "eletrica", sigla: "PLab" },
  INF16189: { linha: 4, area: "sistemas", sigla: "IEC" },
  INF15973: { linha: 5, area: "informatica", sigla: "Log1" },
  INF15927: { linha: 6, area: "programacao", sigla: "Prog1" },
  // 2º
  MAT15931: { linha: 0, area: "matematica", sigla: "Calc2" },
  MAT15932: { linha: 1, area: "matematica", sigla: "AlgLin" },
  FIS13696: { linha: 2, area: "fisica", sigla: "Fis1" },
  ELE15929: { linha: 3, area: "eletrica", sigla: "DAC" },
  HID15930: { linha: 4, area: "humanidades", sigla: "FEA" },
  INF16190: { linha: 5, area: "programacao", sigla: "PIC1" },
  INF16153: { linha: 6, area: "programacao", sigla: "Prog2" },
  // 3º
  MAT15936: { linha: 0, area: "matematica", sigla: "Calc3" },
  MAT15937: { linha: 1, area: "matematica", sigla: "Calc4" },
  FIS13735: { linha: 2, area: "fisica", sigla: "Fis2" },
  ELE15934: { linha: 3, area: "eletrica", sigla: "CEle1" },
  ELE15935: { linha: 4, area: "eletrica", sigla: "CLog" },
  INF15974: { linha: 6, area: "programacao", sigla: "ED" },
  // 4º
  STA15932: { linha: 0, area: "matematica", sigla: "Prob" },
  ELE15941: { linha: 1, area: "eletrica", sigla: "EMag1", etiquetas: ["ELE15934"] },
  FIS13737: { linha: 2, area: "fisica", sigla: "FisEx", etiquetas: ["FIS13696"] },
  ELE15940: { linha: 3, area: "eletrica", sigla: "CEle2" },
  INF16154: { linha: 4, area: "sistemas", sigla: "AOC" },
  INF15933: { linha: 6, area: "programacao", sigla: "POO" },
  // 5º
  ELE15944: { linha: 1, area: "eletrica", sigla: "EMag2" },
  ELE16191: { linha: 2, area: "eletrica", sigla: "SS" },
  ELE15943: { linha: 3, area: "eletrica", sigla: "EB1" },
  INF15980: { linha: 4, area: "sistemas", sigla: "SO" },
  INF15975: { linha: 6, area: "programacao", sigla: "TBO" },
  // 6º
  ELE15951: { linha: 2, area: "eletrica", sigla: "AMSD" },
  ELE15942: { linha: 3, area: "eletrica", sigla: "SEmb1" },
  INF16158: { linha: 4, area: "sistemas", sigla: "Redes" },
  INF15978: { linha: 5, area: "informatica", sigla: "ES1" },
  INF16192: { linha: 6, area: "informatica", sigla: "ComCom", etiquetas: ["INF15973"] },
  // 7º
  EPR12990: { linha: 0, area: "humanidades", sigla: "Econ" },
  ELE15956: { linha: 2, area: "eletrica", sigla: "SReal" },
  ELE16194: { linha: 3, area: "programacao", sigla: "PIC2HW", etiquetas: ["INF16190"] },
  INF16193: { linha: 4, area: "programacao", sigla: "PIC2SW", etiquetas: ["INF16190"] },
  INF16165: { linha: 5, area: "informatica", sigla: "MP", etiquetas: ["STA15932"] },
  INF16161: { linha: 6, area: "programacao", sigla: "PaP" },
  // 8º
  EPR15963: { linha: 0, area: "humanidades", sigla: "Gestão" },
  HID16196: { linha: 1, area: "humanidades", sigla: "HST" },
  ELE16195: { linha: 2, area: "eletrica", sigla: "InstEl", etiquetas: ["ELE15929", "ELE15934"] },
  INF15979: { linha: 5, area: "informatica", sigla: "BD1" },
  // 9º
  EPR15969: { linha: 0, area: "humanidades", sigla: "ALeg" },
  INF16197: { linha: 1, area: "estagio", sigla: "EstSup" },
  INF16198: { linha: 6, area: "estagio", sigla: "TCC1" },
  // 10º
  INF16159: { linha: 0, area: "humanidades", sigla: "CompSoc", etiquetas: ["INF15933"] },
  INF16199: { linha: 6, area: "estagio", sigla: "TCC2" },
};

/** Espaços de optativa da matriz oficial: período e linha de cada um. */
export const OPTATIVAS_2022: Array<{ periodo: number; linha: number }> = [
  { periodo: 8, linha: 3 },
  { periodo: 8, linha: 4 },
  { periodo: 9, linha: 2 },
  { periodo: 9, linha: 3 },
  { periodo: 9, linha: 4 },
];

// Carga de cada espaço de optativa na matriz oficial.
export const HORAS_OPTATIVA = 60;


/** Área de uma disciplina fora do desenho oficial (2008 e optativas). */
export function areaDe(d: { codigo: string; nome: string; obrigatoria: boolean }): Area {
  const lugar = MATRIZ_2022[d.codigo];
  if (lugar) return lugar.area;
  if (!d.obrigatoria) return "optativa";
  const nome = chaveBusca(d.nome);
  const prefixo = d.codigo.slice(0, 3);
  if (/projeto de graduacao|trabalho de conclusao|estagio/.test(nome)) return "estagio";
  if (prefixo === "MAT" || prefixo === "STA") return "matematica";
  if (prefixo === "FIS" || prefixo === "QUI") return "fisica";
  if (prefixo === "ELE") return "eletrica";
  if (prefixo === "INF") {
    if (/sistemas operacionais|redes|arquitetura|organizacao de computadores|introducao a engenharia/.test(nome))
      return "sistemas";
    if (/program|estrutura de dados|algoritm|projeto integrado|paradigma/.test(nome)) return "programacao";
    return "informatica";
  }
  return "humanidades";
}
