// Formatação e rótulos usados no servidor e no navegador.

export const OPTATIVA = 99;

const decimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat("pt-BR");

const vazio = (n: number | null | undefined): n is null | undefined =>
  n === null || n === undefined || Number.isNaN(n);

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
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Rosa ou verde nos cartões da grade e da tela inicial: rosa para as
 * disciplinas da metade mais difícil da escala (3 ou mais), verde para as
 * outras. Sem dado suficiente, o cartão fica neutro em vez de inventar cor.
 */
export function tom(dificuldade: number | null | undefined): "rosa" | "verde" | "neutro" {
  if (vazio(dificuldade)) return "neutro";
  return dificuldade >= 3 ? "rosa" : "verde";
}

/** Símbolo do cartão da tela inicial, pela área da disciplina. */
export function simbolo(d: { codigo: string; nome: string }) {
  const nome = chaveBusca(d.nome);
  if (nome.includes("logica")) return "⊢";
  if (nome.startsWith("introducao")) return "●";
  const prefixo = d.codigo.slice(0, 3);
  if (prefixo === "MAT" || prefixo === "STA") return "∑";
  if (prefixo === "INF") return "</>";
  if (prefixo === "FIS") return "F";
  if (prefixo === "ELE") return "Ω";
  return "●";
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
