/**
 * Índice de dificuldade de 1 a 5, a partir das notas das turmas.
 *
 * Três medidas, todas apontando para "mais difícil":
 *   - reprovação: quantos não passam (1 - aprovação);
 *   - nota baixa: quão longe de 10 fica a média de quem teve nota;
 *   - desvio padrão das notas: turma polarizada, em que uns vão bem e outros
 *     muito mal, é disciplina em que é fácil se dar mal.
 *
 * Disciplina com poucos alunos oscila muito: 3 reprovações em 5 alunos dariam
 * 60%. Antes de comparar, cada medida é puxada para a média geral do curso
 * com o peso de PSEUDO_ALUNOS alunos fictícios (encolhimento bayesiano): com
 * centenas de alunos o ajuste some; com uma dezena, a disciplina fica perto
 * do meio da escala até ter dado que a afaste dele.
 *
 * Cada medida vira escore padronizado (quantos desvios acima ou abaixo da
 * disciplina típica), os três são somados com os PESOS e o total passa pela
 * curva normal: 1 é a disciplina mais tranquila do curso, 5 a mais difícil, e
 * 3 a do meio. É uma escala relativa, comparando as disciplinas entre si.
 */

export const PSEUDO_ALUNOS = 20;

// Encolhe as pontas da curva: sem isso as cinco ou seis disciplinas mais
// difíceis saíam todas com 5,0 e deixavam de se distinguir.
export const ESPALHAMENTO = 0.75;

// Reprovação pesa mais porque é o que decide o semestre do aluno; a média
// vem em seguida; o desvio só desempata.
export const PESOS = { reprovacao: 0.45, notaBaixa: 0.35, desvio: 0.2 } as const;

export type Entrada = {
  codigo: string;
  alunos: number;
  aprovados: number;
  comNota: number;
  somaNotas: number;
  somaQuadrados: number;
};

const soma = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

function padroniza(valores: number[]): number[] {
  const m = soma(valores) / valores.length;
  const dp = Math.sqrt(soma(valores.map((v) => (v - m) ** 2)) / valores.length);
  return valores.map((v) => (dp > 0 ? (v - m) / dp : 0));
}

/** Função de distribuição da normal padrão (aproximação de Abramowitz e Stegun, erro < 1e-7). */
export function normal(z: number): number {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const p = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - p * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}

/** Dificuldade de cada disciplina, de 1 a 5 com uma casa. */
export function calcularDificuldade(entradas: Entrada[]): Map<string, number> {
  const validas = entradas.filter((e) => e.alunos > 0 && e.comNota > 0);
  const resultado = new Map<string, number>();
  if (validas.length < 2) return resultado;

  const aprovacaoGeral = soma(validas.map((e) => e.aprovados)) / soma(validas.map((e) => e.alunos));
  const mediaGeral = soma(validas.map((e) => e.somaNotas)) / soma(validas.map((e) => e.comNota));
  const desvios = validas.map((e) => {
    const m = e.somaNotas / e.comNota;
    return Math.sqrt(Math.max(0, e.somaQuadrados / e.comNota - m * m));
  });
  const desvioGeral = soma(desvios.map((d, i) => d * validas[i].comNota)) / soma(validas.map((e) => e.comNota));

  const k = PSEUDO_ALUNOS;
  const reprovacao = validas.map((e) => 1 - (e.aprovados + k * aprovacaoGeral) / (e.alunos + k));
  const notaBaixa = validas.map((e) => 10 - (e.somaNotas + k * mediaGeral) / (e.comNota + k));
  const desvio = validas.map((d, i) => (desvios[i] * d.comNota + k * desvioGeral) / (d.comNota + k));

  const zr = padroniza(reprovacao);
  const zn = padroniza(notaBaixa);
  const zd = padroniza(desvio);
  const combinado = validas.map((_, i) => PESOS.reprovacao * zr[i] + PESOS.notaBaixa * zn[i] + PESOS.desvio * zd[i]);
  // A soma de escores correlacionados não tem desvio 1: padroniza de novo
  // para a curva normal espalhar a escala inteira.
  const final = padroniza(combinado);

  validas.forEach((e, i) => {
    resultado.set(e.codigo, Math.round((1 + 4 * normal(ESPALHAMENTO * final[i])) * 10) / 10);
  });
  return resultado;
}
