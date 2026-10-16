import { chaveBusca } from "../formato";

// Desenho da grade: área de cada disciplina, posição na coluna e quais
// pré-requisitos viram etiqueta em vez de seta.
//
// Para o currículo 2022 tudo vem da "Representação Gráfica da Matriz
// Curricular - 2022 (Revisão 2024)" do Departamento de Informática
// (https://informatica.ufes.br/pt-br/ppc-engcomp): o DI escolheu a linha de
// cada disciplina para as setas não se cruzarem, e os pré-requisitos distantes
// aparecem como etiqueta no cartão.
//
// O currículo 2008 não tem desenho oficial. A grade dele é a da última emissão
// ("Grade Curricular - 2017" na página do PPC), que é a das turmas que ainda
// estão nele. As posições e o que vira seta ou etiqueta foram escolhidos por
// nós, com o critério que se vê na matriz de 2022: setas curtas e sem cruzar,
// no máximo dois trilhos por corredor, áreas em faixas. Uma busca escolheu a
// linha de cada disciplina e quais pré-requisitos ficam como etiqueta (todos os
// que estão a três períodos ou mais, e os mais próximos que só embolariam os
// corredores), com até quatro etiquetas por cartão.

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

/** Currículo 2008 (versão de 2017), sem desenho oficial: posições escolhidas por nós (ver comentário acima). */
export const MATRIZ_2008: Record<string, Lugar> = {
  // 1º período
  ELE08557: { linha: 0, area: "eletrica", sigla: "PLab" }, // Práticas de Laboratório
  MAT09570: { linha: 1, area: "matematica", sigla: "Calc1" }, // Cálculo I
  MAT09592: { linha: 2, area: "matematica", sigla: "AlgLin" }, // Álgebra Linear
  QUI09677: { linha: 3, area: "fisica", sigla: "QuiA" }, // Química A
  INF09301: { linha: 5, area: "sistemas", sigla: "IEC" }, // Introdução à Engenharia de Computação
  INF09330: { linha: 6, area: "programacao", sigla: "Prog2" }, // Programação II
  // 2º
  ELE08475: { linha: 0, area: "eletrica", sigla: "CEle1" }, // Circuitos Elétricos I
  STA08874: { linha: 1, area: "matematica", sigla: "Est" }, // Estatística Básica
  MAT09574: { linha: 2, area: "matematica", sigla: "Calc2" }, // Cálculo II
  FIS09098: { linha: 3, area: "fisica", sigla: "IMC" }, // Introdução à Mecânica Clássica
  INF09292: { linha: 6, area: "programacao", sigla: "ED1" }, // Estrutura de Dados I
  // 3º
  ELE08476: { linha: 0, area: "eletrica", sigla: "CEle2" }, // Circuitos Elétricos II
  MAT09582: { linha: 1, area: "matematica", sigla: "Calc3A" }, // Cálculo III A
  ELE08501: { linha: 2, area: "eletrica", sigla: "EMag1" }, // Eletromagnetismo I
  MCA08765: { linha: 3, area: "fisica", sigla: "Termo" }, // Termodinâmica e Transmissão de Calor
  FIS09057: { linha: 4, area: "fisica", sigla: "FisEx" }, // Física Experimental
  INF09331: { linha: 6, area: "programacao", sigla: "Prog3" }, // Programação III
  // 4º
  ELE08500: { linha: 0, area: "eletrica", sigla: "EDig", etiquetas: ["INF09330"] }, // Eletrônica Digital
  ELE08568: { linha: 1, area: "eletrica", sigla: "SS" }, // Sinais e Sistemas
  ELE08502: { linha: 2, area: "eletrica", sigla: "EMag2" }, // Eletromagnetismo II
  INF09269: { linha: 3, area: "programacao", sigla: "AlgNum", etiquetas: ["INF09330", "MAT09592"] }, // Algoritmos Numéricos I
  DEA07780: { linha: 4, area: "fisica", sigla: "MecFlu", etiquetas: ["MAT09582"] }, // Introdução à Mecânica dos Fluidos
  MCA08709: { linha: 5, area: "fisica", sigla: "MecSol", etiquetas: ["MAT09582"] }, // Mecânica dos Sólidos
  // 5º
  ELE08512: { linha: 1, area: "eletrica", sigla: "InstEl" }, // Instalações Elétricas I
  ELE08497: { linha: 2, area: "eletrica", sigla: "EB1", etiquetas: ["ELE08476"] }, // Eletrônica Básica I
  INF09293: { linha: 3, area: "programacao", sigla: "ED2", etiquetas: ["INF09292"] }, // Estrutura de Dados II
  INF09289: { linha: 4, area: "informatica", sigla: "ES" }, // Engenharia de Software
  FIS09040: { linha: 5, area: "fisica", sigla: "EstMat" }, // Estrutura da Matéria
  INF09328: { linha: 6, area: "programacao", sigla: "Prog1" }, // Programação I
  // 6º
  INF09274: { linha: 0, area: "sistemas", sigla: "Arq1" }, // Arquitetura de Computadores I
  INF09344: { linha: 1, area: "sistemas", sigla: "SO", etiquetas: ["INF09331"] }, // Sistemas Operacionais
  ELE08498: { linha: 2, area: "eletrica", sigla: "EB2" }, // Eletrônica Básica II
  INF09309: { linha: 3, area: "informatica", sigla: "LFA", etiquetas: ["INF09331"] }, // Linguagens Formais e Autômatos
  INF09307: { linha: 4, area: "programacao", sigla: "LP", etiquetas: ["ELE08500", "INF09331"] }, // Linguagens de Programação
  ELE08472: { linha: 5, area: "eletrica", sigla: "AMSD", etiquetas: ["ELE08568", "INF09269"] }, // Análise e Modelagem de Sistemas Dinâmicos
  // 7º
  ELE08575: { linha: 0, area: "eletrica", sigla: "SEmb1" }, // Sistemas Embarcados I
  INF09346: { linha: 1, area: "sistemas", sigla: "Telep", etiquetas: ["ELE08500"] }, // Teleprocessamento
  INF09322: { linha: 2, area: "matematica", sigla: "ProcEst", etiquetas: ["MAT09582", "STA08874"] }, // Processos Estocásticos Aplicados à Computação
  INF09268: { linha: 3, area: "informatica", sigla: "AFTC" }, // Algoritmos e Fundamentos da Teoria de Computação
  ELE08577: { linha: 5, area: "eletrica", sigla: "SReal" }, // Sistemas Realimentados
  ELE08525: { linha: 6, area: "eletrica", sigla: "LabCtrl" }, // Laboratório de Controle Automático
  // 8º
  ELE08572: { linha: 0, area: "eletrica", sigla: "SDig" }, // Sistemas Digitais
  INF09341: { linha: 1, area: "sistemas", sigla: "Redes" }, // Redes de Computadores
  EPR07932: { linha: 2, area: "humanidades", sigla: "Econ1" }, // Economia da Engenharia I
  INF09282: { linha: 3, area: "informatica", sigla: "CRG", etiquetas: ["INF09269", "INF09331"] }, // Computação e Representação Gráfica
  INF09281: { linha: 4, area: "informatica", sigla: "Comp" }, // Compiladores
  INF09279: { linha: 5, area: "informatica", sigla: "BD", etiquetas: ["INF09289", "INF09293", "INF09344"] }, // Banco de Dados
  // 9º
  EPR07961: { linha: 0, area: "humanidades", sigla: "OrgInd" }, // Organização Industrial
  DEA07756: { linha: 1, area: "humanidades", sigla: "FEA" }, // Fundamentos da Engenharia Ambiental
  EPR07935: { linha: 2, area: "humanidades", sigla: "Econ2" }, // Economia da Engenharia II
  INF09277: { linha: 3, area: "informatica", sigla: "AvDes", etiquetas: ["INF09344", "INF09346"] }, // Avaliação de Desempenho de Sistemas Computacionais
  INF09290: { linha: 4, area: "estagio", sigla: "EstSup" }, // Estágio Supervisionado
  INF09335: { linha: 5, area: "estagio", sigla: "PG1" }, // Projeto de Graduação I
  // 10º
  EPR07923: { linha: 0, area: "humanidades", sigla: "ALeg" }, // Aspectos Legais e Éticos da Engenharia
  INF09295: { linha: 4, area: "informatica", sigla: "GerProj" }, // Gerência de Projetos
  INF09336: { linha: 5, area: "estagio", sigla: "PG2" }, // Projeto de Graduação II
};
