// Contas sobre as notas. Lógica pura, sem banco, para poder ser testada.

import { chave, contaNaTurma, cursoEhDI, mediaDe } from "./normaliza";

export type LinhaNota = {
  codigo: string;
  curso: string;
  media: number | null;
  situacao: string;
  semestre: string;
};

/** Números de uma disciplina num intervalo de semestres. */
export type Resumo = {
  codigo: string;
  alunos: number;
  aprovados: number;
  reprovadosNota: number;
  reprovadosFalta: number;
  // Soma e soma dos quadrados das notas lançadas: média e desvio padrão
  // saem daqui, sempre do mesmo conjunto de alunos.
  comNota: number;
  somaNotas: number;
  somaQuadrados: number;
  // Metade dos alunos com nota tirou isso ou mais, a outra metade isso ou
  // menos. Ao contrário da média, não é puxada por notas extremas, comuns nas
  // disciplinas difíceis (muito zero de quem desistiu).
  mediana: number | null;
  semestres: number;
};

export type Estatistica = Resumo & {
  aprovacao: number;
  reprovacao: number;
  media: number | null;
  desvio: number | null;
};

/**
 * Soma por disciplina. Só entra quem cursou e recebeu resultado (aprovado,
 * reprovado por nota ou por falta): aproveitamento, trancamento e afins não
 * dizem nada sobre a turma. Reprovado por falta costuma vir sem nota; conta na
 * reprovação, mas não puxa a média como se fosse zero.
 */
/** Mediana de uma lista de notas; null se vazia. Não altera a lista. */
export function mediana(notas: number[]): number | null {
  if (notas.length === 0) return null;
  const o = [...notas].sort((a, b) => a - b);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
}

export function resumir(linhas: Iterable<LinhaNota>): Map<string, Resumo> {
  const porCodigo = new Map<string, Resumo & { sems: Set<string>; notas: number[] }>();
  for (const l of linhas) {
    if (!contaNaTurma(l.situacao)) continue;
    let r = porCodigo.get(l.codigo);
    if (!r) {
      r = {
        codigo: l.codigo,
        alunos: 0,
        aprovados: 0,
        reprovadosNota: 0,
        reprovadosFalta: 0,
        comNota: 0,
        somaNotas: 0,
        somaQuadrados: 0,
        mediana: null,
        semestres: 0,
        sems: new Set(),
        notas: [],
      };
      porCodigo.set(l.codigo, r);
    }
    r.alunos++;
    r.sems.add(l.semestre);
    const k = chave(l.situacao);
    if (k === "aprovado") r.aprovados++;
    else if (k === "reprovado por nota") r.reprovadosNota++;
    else r.reprovadosFalta++;
    const nota = mediaDe(l.media);
    if (nota !== null) {
      r.comNota++;
      r.somaNotas += nota;
      r.somaQuadrados += nota * nota;
      r.notas.push(nota);
    }
  }
  const saida = new Map<string, Resumo>();
  for (const [codigo, { sems, notas, ...r }] of porCodigo)
    saida.set(codigo, { ...r, mediana: mediana(notas), semestres: sems.size });
  return saida;
}

export function estatistica(r: Resumo): Estatistica {
  const media = r.comNota > 0 ? r.somaNotas / r.comNota : null;
  const variancia = media !== null ? Math.max(0, r.somaQuadrados / r.comNota - media * media) : null;
  return {
    ...r,
    aprovacao: r.aprovados / r.alunos,
    reprovacao: (r.alunos - r.aprovados) / r.alunos,
    media,
    desvio: variancia === null ? null : Math.sqrt(variancia),
  };
}

/** Um ponto por semestre, para o gráfico da disciplina. */
export type Semestre = {
  semestre: string;
  alunos: number;
  aprovados: number;
  reprovadosNota: number;
  reprovadosFalta: number;
  // null quando ninguém teve nota lançada: zero seria um ponto real no
  // gráfico, num semestre em que não houve nota nenhuma.
  media: number | null;
  mediana: number | null;
  // Só alunos de Engenharia e Ciência da Computação de Goiabeiras.
  mediaComputacao: number | null;
};

export function porSemestre(linhas: Iterable<LinhaNota>): Semestre[] {
  const mapa = new Map<string, Semestre & { soma: number; n: number; somaC: number; nC: number; notas: number[] }>();
  for (const l of linhas) {
    if (!contaNaTurma(l.situacao)) continue;
    let s = mapa.get(l.semestre);
    if (!s) {
      s = {
        semestre: l.semestre,
        alunos: 0,
        aprovados: 0,
        reprovadosNota: 0,
        reprovadosFalta: 0,
        media: null,
        mediana: null,
        mediaComputacao: null,
        notas: [],
        soma: 0,
        n: 0,
        somaC: 0,
        nC: 0,
      };
      mapa.set(l.semestre, s);
    }
    s.alunos++;
    const k = chave(l.situacao);
    if (k === "aprovado") s.aprovados++;
    else if (k === "reprovado por nota") s.reprovadosNota++;
    else s.reprovadosFalta++;
    const nota = mediaDe(l.media);
    if (nota !== null) {
      s.soma += nota;
      s.n++;
      s.notas.push(nota);
      if (cursoEhDI(l.curso)) {
        s.somaC += nota;
        s.nC++;
      }
    }
  }
  return Array.from(mapa.values())
    .map(({ soma, n, somaC, nC, notas, ...s }) => ({
      ...s,
      media: n > 0 ? soma / n : null,
      mediana: mediana(notas),
      mediaComputacao: nC > 0 ? somaC / nC : null,
    }))
    .sort((a, b) => a.semestre.localeCompare(b.semestre));
}
