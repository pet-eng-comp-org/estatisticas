import departmentByCode from "./departmentByCode";

/** Sem acento e em minusculas: "calculo" encontra "Cálculo". */
export function chave(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Na tabela, periodo 99 e a convencao para optativa.
export const OPTATIVA = 99;

/**
 * A grade vem agrupada por periodo e mistura as duas geracoes de curriculo;
 * as telas querem uma lista plana do curriculo escolhido, ja com periodo e
 * tipo em cada disciplina.
 */
export function disciplinasDoCurriculo(grade, curriculo) {
  if (!grade) return [];
  const querNova = curriculo === "2022";
  const lista = [];
  grade.ecomp.forEach((grupo) => {
    grupo.disciplinas.forEach((d) => {
      if ((d.curriculo === 2022) !== querNova) return;
      lista.push({
        ...d,
        periodo: grupo.periodo,
        obrigatoria: grupo.periodo !== OPTATIVA,
      });
    });
  });
  return lista;
}

/** Todas as disciplinas da grade, das duas geracoes, por codigo. */
export function indicePorCodigo(grade) {
  const mapa = {};
  if (!grade) return mapa;
  grade.ecomp.forEach((grupo) => {
    grupo.disciplinas.forEach((d) => {
      mapa[d.codigo] = {
        ...d,
        periodo: grupo.periodo,
        obrigatoria: grupo.periodo !== OPTATIVA,
      };
    });
  });
  return mapa;
}

export function filtraPorTexto(lista, texto) {
  const busca = chave(texto).trim();
  if (!busca) return lista;
  return lista.filter(
    (d) => chave(d.nome).includes(busca) || chave(d.codigo).includes(busca)
  );
}

export function rotuloPeriodo(periodo) {
  return periodo === OPTATIVA ? "Optativa" : `${periodo}º período`;
}

export function rotuloTipo(d) {
  return d.obrigatoria ? "Obrigatória" : "Optativa";
}

/** "60h · Obrigatória", sem a carga quando ela nao e conhecida. */
export function rotuloCarga(d) {
  return [d.carga_horaria ? `${d.carga_horaria}h` : null, rotuloTipo(d)]
    .filter(Boolean)
    .join(" · ");
}

const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const inteiro = new Intl.NumberFormat("pt-BR");

export const formata = {
  decimal: (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : numero.format(n)),
  porcento: (n) => (n === null || n === undefined || Number.isNaN(n) ? "—" : `${Math.round(n * 100)}%`),
  inteiro: (n) => (n === null || n === undefined ? "—" : inteiro.format(n)),
};

/*
 * Rosa ou verde no cartao. Ate a Bia definir o que "dificuldade" mede, o
 * criterio e a reprovacao das turmas desde 2018: uma em cada tres ou mais
 * reprovando pinta de rosa. Sem dado suficiente, o cartao fica neutro em vez
 * de inventar uma cor.
 */
export const LIMITE_REPROVACAO = 0.3;

export function tom(estatistica) {
  if (!estatistica || estatistica.reprovacao === null || estatistica.reprovacao === undefined) {
    return "neutro";
  }
  return estatistica.reprovacao >= LIMITE_REPROVACAO ? "rosa" : "verde";
}

/** Simbolo do cartao da tela inicial, pela area da disciplina. */
export function simbolo(d) {
  const nome = chave(d.nome);
  if (nome.includes("logica")) return "⊢";
  if (nome.startsWith("introducao")) return "●";
  const prefixo = d.codigo.substring(0, 3);
  if (prefixo === "MAT" || prefixo === "STA") return "∑";
  if (prefixo === "INF") return "</>";
  if (prefixo === "FIS") return "F";
  if (prefixo === "ELE") return "Ω";
  return "●";
}

export function departamento(codigo) {
  return departmentByCode(codigo);
}

/**
 * Uma optativa pode aparecer em mais de um baldes da grade quando o banco a
 * registra em dois cursos; a lista mostra cada codigo uma vez so.
 */
export function semRepetir(lista) {
  const vistos = new Set();
  return lista.filter((d) => (vistos.has(d.codigo) ? false : vistos.add(d.codigo)));
}
