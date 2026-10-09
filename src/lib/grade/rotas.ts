/**
 * Traçado das setas de pré-requisito da grade.
 *
 * Duas regras da matriz oficial do DI, que a Bia apontou depois de ver o site
 * no ar (a seta de Práticas de Laboratório parecia chegar em Cálculo III):
 *
 * 1. Linhas de disciplinas diferentes nunca correm uma sobre a outra. No
 *    corredor entre duas colunas, cada disciplina de origem tem o seu trilho
 *    vertical, e cada seta que pula colunas tem trilho próprio no corredor de
 *    chegada e altura própria no vão entre as linhas.
 * 2. Onde uma linha horizontal cruza uma vertical de outra seta, ela dá um
 *    saltinho (um arco) por cima, para não parecer que as duas se ligam.
 *
 * Linhas da mesma origem podem dividir o começo, e linhas para o mesmo
 * destino se juntam no fim: nos dois casos elas ligam as mesmas disciplinas.
 * Lógica pura, sem DOM: recebe as caixas medidas e devolve os caminhos.
 */

export type Caixa = { esquerda: number; direita: number; topo: number; meio: number; coluna: number; linha: number };
export type Ligacao = { de: string; para: string };
type Segmento = { x1: number; y1: number; x2: number; y2: number };
export type Rota = Ligacao & { segmentos: Segmento[] };

// Folgas dentro do corredor: os trilhos ficam entre a borda da coluna da
// esquerda (+ MARGEM) e a ponta da seta do destino (- ESPACO_PONTA).
const MARGEM = 7;
const ESPACO_PONTA = 18;
const PONTA = 2; // a seta termina 2 px antes do cartão
const PASSO_VAO = 6; // distância entre linhas que dividem o vão entre duas linhas de cartões
export const RAIO_SALTO = 5;

const chave = (l: Ligacao) => `${l.de}>${l.para}`;

/** Distribui `n` trilhos entre `inicio` e `fim`. */
function trilhos(n: number, inicio: number, fim: number): number[] {
  if (n === 1) return [(inicio + fim) / 2];
  const passo = Math.min(9, (fim - inicio) / (n - 1));
  const largura = passo * (n - 1);
  const comeco = (inicio + fim) / 2 - largura / 2;
  return Array.from({ length: n }, (_, i) => comeco + i * passo);
}

export function rotear(
  ligacoes: Ligacao[],
  caixas: Record<string, Caixa>,
  livre: (coluna: number, linha: number) => boolean,
): Rota[] {
  const validas = ligacoes.filter((l) => caixas[l.de] && caixas[l.para] && caixas[l.de].coluna < caixas[l.para].coluna);

  // Bordas de cada coluna (todos os cartões de uma coluna têm a mesma largura).
  const direita: Record<number, number> = {};
  const esquerda: Record<number, number> = {};
  for (const c of Object.values(caixas)) {
    direita[c.coluna] = Math.max(direita[c.coluna] ?? -Infinity, c.direita);
    esquerda[c.coluna] = Math.min(esquerda[c.coluna] ?? Infinity, c.esquerda);
  }

  type Tipo = "reta" | "vizinha" | "salto";
  const tipo = (l: Ligacao): Tipo => {
    const o = caixas[l.de];
    const d = caixas[l.para];
    if (o.linha === d.linha) {
      let reta = true;
      for (let c = o.coluna + 1; c < d.coluna; c++) reta &&= livre(c, o.linha);
      if (reta) return "reta";
    }
    return d.coluna === o.coluna + 1 ? "vizinha" : "salto";
  };

  // Trilhos de cada corredor (o corredor g fica à direita da coluna g): à
  // esquerda os de saída, um por disciplina de origem, em ordem de linha; à
  // direita os de chegada das setas que pularam colunas, um por destino (setas
  // para o mesmo destino se juntam, como na matriz oficial).
  const saidas = new Map<number, string[]>();
  const chegadas = new Map<number, string[]>();
  for (const l of validas) {
    const t = tipo(l);
    if (t === "reta") continue;
    const o = caixas[l.de];
    const lista = saidas.get(o.coluna) ?? [];
    if (!lista.includes(l.de)) lista.push(l.de);
    saidas.set(o.coluna, lista);
    if (t === "salto") {
      const g = caixas[l.para].coluna - 1;
      const destinos = chegadas.get(g) ?? [];
      if (!destinos.includes(l.para)) destinos.push(l.para);
      chegadas.set(g, destinos);
    }
  }
  const trilhoSaida = new Map<string, number>();
  const trilhoChegada = new Map<string, number>();
  const corredores = new Set([...saidas.keys(), ...chegadas.keys()]);
  for (const g of corredores) {
    const s = (saidas.get(g) ?? []).sort((a, b) => caixas[a].linha - caixas[b].linha);
    const c = (chegadas.get(g) ?? []).sort((a, b) => caixas[a].linha - caixas[b].linha);
    const xs = trilhos(s.length + c.length, direita[g] + MARGEM, esquerda[g + 1] - ESPACO_PONTA);
    s.forEach((codigo, i) => trilhoSaida.set(codigo, xs[i]));
    c.forEach((codigo, i) => trilhoChegada.set(codigo, xs[s.length + i]));
  }

  // Altura no vão acima da linha de destino, uma por destino de seta que pula
  // colunas (de novo, setas para o mesmo destino se juntam).
  const porVao = new Map<number, string[]>();
  const origemMaisAntiga = new Map<string, number>();
  for (const l of validas) {
    if (tipo(l) !== "salto") continue;
    const r = caixas[l.para].linha;
    const destinos = porVao.get(r) ?? [];
    if (!destinos.includes(l.para)) destinos.push(l.para);
    porVao.set(r, destinos);
    origemMaisAntiga.set(l.para, Math.min(origemMaisAntiga.get(l.para) ?? Infinity, caixas[l.de].coluna));
  }
  const alturaVao = new Map<string, number>();
  for (const destinos of porVao.values()) {
    destinos
      .sort((a, b) => origemMaisAntiga.get(a)! - origemMaisAntiga.get(b)! || caixas[a].coluna - caixas[b].coluna)
      .forEach((codigo, k) => alturaVao.set(codigo, caixas[codigo].topo - 7 - k * PASSO_VAO));
  }

  return validas.map((l) => {
    const o = caixas[l.de];
    const d = caixas[l.para];
    const fim = d.esquerda - PONTA;
    const pontos: Array<[number, number]> = [[o.direita, o.meio]];
    const t = tipo(l);
    if (t === "vizinha") {
      const x = trilhoSaida.get(l.de)!;
      pontos.push([x, o.meio], [x, d.meio]);
    } else if (t === "salto") {
      const x1 = trilhoSaida.get(l.de)!;
      const x2 = trilhoChegada.get(l.para)!;
      const y = alturaVao.get(l.para)!;
      pontos.push([x1, o.meio], [x1, y], [x2, y], [x2, d.meio]);
    }
    pontos.push([fim, d.meio]);
    const segmentos: Segmento[] = [];
    for (let i = 1; i < pontos.length; i++) {
      const [x1, y1] = pontos[i - 1];
      const [x2, y2] = pontos[i];
      if (x1 !== x2 || y1 !== y2) segmentos.push({ x1, y1, x2, y2 });
    }
    return { ...l, segmentos };
  });
}

const horizontal = (s: Segmento) => s.y1 === s.y2;
const entre = (v: number, a: number, b: number, folga: number) => v > Math.min(a, b) + folga && v < Math.max(a, b) - folga;

/**
 * O `d` do SVG de cada rota, com um saltinho onde um trecho horizontal cruza
 * o trecho vertical de outra rota. Só conta cruzamento de verdade, longe das
 * pontas dos dois trechos: junção (o fim de uma linha encostando em outra que
 * vai para o mesmo destino) não é cruzamento. Recebe só as rotas visíveis:
 * linha escondida não pede saltinho.
 */
export function desenhar(rotas: Rota[], raio = RAIO_SALTO): Map<string, string> {
  const verticais = rotas.flatMap((r) => r.segmentos.filter((s) => !horizontal(s)).map((s) => ({ s, r })));
  const saida = new Map<string, string>();
  for (const r of rotas) {
    let d = "";
    r.segmentos.forEach((s, i) => {
      if (i === 0) d += `M${s.x1} ${s.y1}`;
      if (!horizontal(s)) {
        d += `V${s.y2}`;
        return;
      }
      const sentido = Math.sign(s.x2 - s.x1) || 1;
      const saltos = verticais
        .filter((v) => v.r !== r && entre(v.s.x1, s.x1, s.x2, raio + 1) && entre(s.y1, v.s.y1, v.s.y2, 1))
        .map((v) => v.s.x1)
        .filter((x, j, xs) => xs.indexOf(x) === j)
        .sort((a, b) => sentido * (a - b));
      let atual = s.x1;
      for (const x of saltos) {
        // Dois saltos colados viram um só, mais largo.
        if (sentido * (x - raio - atual) < 0) continue;
        d += `H${x - sentido * raio}A${raio} ${raio} 0 0 ${sentido > 0 ? 1 : 0} ${x + sentido * raio} ${s.y1}`;
        atual = x + sentido * raio;
      }
      d += `H${s.x2}`;
    });
    saida.set(chave(r), d);
  }
  return saida;
}
