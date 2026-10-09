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
export function resumir(linhas: Iterable<LinhaNota>): Map<string, Resumo> {
  const porCodigo = new Map<string, Resumo & { sems: Set<string> }>();
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
        semestres: 0,
        sems: new Set(),
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
    }
  }
  const saida = new Map<string, Resumo>();
  for (const [codigo, { sems, ...r }] of porCodigo) saida.set(codigo, { ...r, semestres: sems.size });
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
  // Só alunos de Engenharia e Ciência da Computação de Goiabeiras.
  mediaComputacao: number | null;
};

export function porSemestre(linhas: Iterable<LinhaNota>): Semestre[] {
  const mapa = new Map<string, Semestre & { soma: number; n: number; somaC: number; nC: number }>();
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
        mediaComputacao: null,
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
      if (cursoEhDI(l.curso)) {
        s.somaC += nota;
        s.nC++;
      }
    }
  }
  return Array.from(mapa.values())
    .map(({ soma, n, somaC, nC, ...s }) => ({
      ...s,
      media: n > 0 ? soma / n : null,
      mediaComputacao: nC > 0 ? somaC / nC : null,
    }))
    .sort((a, b) => a.semestre.localeCompare(b.semestre));
}
