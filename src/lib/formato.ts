// Formatação, rótulos e constantes usados no servidor e no navegador.

// Na grade, período 99 é a convenção para optativa.
export const OPTATIVA = 99;

// O desempenho de 2012 não ajuda quem vai se matricular agora: os números dos
// cartões olham as turmas desde este ano.
export const DESDE = "2018";

// Com menos alunos que isso desde DESDE, a taxa oscila demais para dizer
// alguma coisa e a disciplina fica sem números.
export const MINIMO_ALUNOS = 10;

// Semestre com menos alunos que isso não aparece no gráfico: a média de uma
// turma de dois é praticamente a nota de cada um.
export const MINIMO_POR_SEMESTRE = 5;

const decimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat("pt-BR");

const vazio = (n: number | null | undefined): n is null | undefined => n === null || n === undefined || Number.isNaN(n);

export const formata = {
  decimal: (n: number | null | undefined) => (vazio(n) ? "—" : decimal.format(n)),
  porcento: (n: number | null | undefined) => (vazio(n) ? "—" : `${Math.round(n * 100)}%`),
  inteiro: (n: number | null | undefined) => (vazio(n) ? "—" : inteiro.format(n)),
};

export const rotuloPeriodo = (periodo: number | null) =>
  periodo === null ? "Fora da grade" : periodo === OPTATIVA ? "Optativa" : `${periodo}º período`;

export const rotuloTipo = (obrigatoria: boolean) => (obrigatoria ? "Obrigatória" : "Optativa");

/** "60h · Obrigatória", sem a carga quando ela não é conhecida. */
export function rotuloCarga(d: { cargaHoraria: number | null; obrigatoria: boolean }) {
  return [d.cargaHoraria ? `${d.cargaHoraria}h` : null, rotuloTipo(d.obrigatoria)].filter(Boolean).join(" · ");
}

/** Sem acento e em minúsculas: "calculo" encontra "Cálculo". */
export function chaveBusca(texto: string) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const DEPARTAMENTOS: Record<string, string> = {
  INF: "Departamento de Informática",
  MAT: "Departamento de Matemática",
  ELE: "Departamento de Engenharia Elétrica",
  FIS: "Departamento de Física",
  MCA: "Departamento de Engenharia Mecânica",
  QUI: "Departamento de Química",
  STA: "Departamento de Estatística",
  DEA: "Departamento de Engenharia Ambiental",
  // Código herdado do antigo Departamento de Hidráulica e Saneamento, hoje
  // Engenharia Ambiental: o currículo 2022 usa HID onde o anterior usava DEA.
  HID: "Departamento de Engenharia Ambiental",
  EPR: "Departamento de Engenharia de Produção",
  LET: "Departamento de Línguas e Letras",
};

export const departamento = (codigo: string): string | null => DEPARTAMENTOS[codigo.slice(0, 3)] ?? null;
