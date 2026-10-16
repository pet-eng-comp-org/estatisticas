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
/** Área que as linhas devem evitar (as etiquetas em cima dos cartões). */
export type Obstaculo = { esquerda: number; direita: number; topo: number; base: number };
type Segmento = { x1: number; y1: number; x2: number; y2: number };
export type Rota = Ligacao & { segmentos: Segmento[] };

// Folgas dentro do corredor: os trilhos ficam entre a borda da coluna da
// esquerda (+ MARGEM) e a ponta da seta do destino (- ESPACO_PONTA).
const MARGEM = 7;
const ESPACO_PONTA = 18;
const PONTA = 2; // a seta termina 2 px antes do cartão
const PASSO_VAO = 6; // distância entre linhas que dividem o vão entre duas linhas de cartões
export const RAIO_SALTO = 5;
const FOLGA_ETIQUETA = 4; // linha mais perto que isso de uma etiqueta conta como em cima dela

const chave = (l: Ligacao) => `${l.de}>${l.para}`;

// Trechos mais perto que isso contam como se encontrando: senão o fim de um
// e o começo do outro pareceriam a mesma linha.
const FOLGA_TRECHO = 14;

/**
 * Menor número de faixas para uma lista de trechos, sem dois trechos que se
 * encontram na mesma faixa (coloração gulosa de intervalos, que é ótima).
 */
function colorir(trechos: { chave: string; de: number; ate: number }[]): Map<string, number> {
  const fins: number[] = [];
  const faixa = new Map<string, number>();
  for (const t of [...trechos].sort((a, b) => a.de - b.de || a.chave.localeCompare(b.chave))) {
    let k = fins.findIndex((fim) => fim + FOLGA_TRECHO < t.de);
    if (k === -1) k = fins.length;
    fins[k] = t.ate;
    faixa.set(t.chave, k);
  }
  return faixa;
}

/**
 * Distribui `n` trilhos entre `inicio` e `fim`. Com 9 px entre eles, dois
 * trilhos pareciam uma linha só, desalinhada; com 16 dá para ver que são
 * duas (o corredor tem uns 40 px úteis, cabem três).
 */
function trilhos(n: number, inicio: number, fim: number): number[] {
  if (n === 1) return [(inicio + fim) / 2];
  const passo = Math.min(16, (fim - inicio) / (n - 1));
  const largura = passo * (n - 1);
  const comeco = (inicio + fim) / 2 - largura / 2;
  return Array.from({ length: n }, (_, i) => comeco + i * passo);
}

export function rotear(
  ligacoes: Ligacao[],
  caixas: Record<string, Caixa>,
  livre: (coluna: number, linha: number) => boolean,
  obstaculos: Obstaculo[] = [],
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

  // Altura no vão acima da linha de destino, para as setas que pulam colunas.
  // Setas para o mesmo destino se juntam; destinos diferentes só ganham
  // alturas diferentes se os trechos horizontais se sobrepõem (mesmo vão e
  // colunas em comum). Senão, ficam todos no meio do vão, como na matriz.
  const saltos = validas.filter((l) => tipo(l) === "salto");
  const alcanceX = new Map<string, [number, number]>();
  for (const l of saltos) {
    const atual = alcanceX.get(l.para);
    const de = caixas[l.de].direita;
    const ate = caixas[l.para].esquerda;
    alcanceX.set(l.para, atual ? [Math.min(atual[0], de), ate] : [de, ate]);
  }
  // Meio do vão entre a linha de destino e a de cima (os cartões têm todos a
  // mesma altura e as linhas o mesmo passo).
  const altura = validas.length ? (caixas[validas[0].para].meio - caixas[validas[0].para].topo) * 2 : 0;
  const topos = [...new Set(Object.values(caixas).map((c) => c.topo))].sort((a, b) => a - b);
  const passos = topos.slice(1).map((t, i) => t - topos[i]).filter((d) => d > altura);
  const vao = passos.length ? Math.min(...passos) - altura : 2 * 9;
  const alturaVao = new Map<string, number>();
  const porLinha = new Map<number, string[]>();
  for (const destino of alcanceX.keys()) {
    const r = caixas[destino].linha;
    porLinha.set(r, [...(porLinha.get(r) ?? []), destino]);
  }
  for (const destinos of porLinha.values()) {
    const faixa = colorir(destinos.map((d) => ({ chave: d, de: alcanceX.get(d)![0], ate: alcanceX.get(d)![1] })));
    for (const [destino, k] of faixa) {
      // A linha corre no meio do vão. As etiquetas ficam na metade de baixo
      // dele: se alguma estiver embaixo do trecho horizontal, a linha sobe e
      // passa por cima dela.
      const y = caixas[destino].topo - vao / 2 - k * PASSO_VAO;
      const [de, ate] = alcanceX.get(destino)!;
      const embaixo = obstaculos.filter(
        (o) => o.direita > de && o.esquerda < ate && o.topo - FOLGA_ETIQUETA < y && o.base + FOLGA_ETIQUETA > y,
      );
      alturaVao.set(destino, embaixo.length ? Math.min(...embaixo.map((o) => o.topo)) - 8 - k * PASSO_VAO : y);
    }
  }

  // Trilhos verticais de cada corredor (o corredor g fica à direita da coluna
  // g). Cada disciplina de origem e cada destino de seta longa ocupa um trecho
  // de altura do corredor; trechos que não se encontram dividem o mesmo
  // trilho, como na matriz oficial (Cálculo I e Práticas de Laboratório usam o
  // mesmo x no primeiro corredor). Só os que se sobrepõem ganham trilhos
  // separados, e então lado a lado.
  type Trecho = { chave: string; de: number; ate: number };
  const trechos = new Map<number, Trecho[]>();
  const junta = (g: number, chave: string, a: number, b: number) => {
    const lista = trechos.get(g) ?? [];
    const t = lista.find((x) => x.chave === chave);
    if (t) {
      t.de = Math.min(t.de, a, b);
      t.ate = Math.max(t.ate, a, b);
    } else lista.push({ chave, de: Math.min(a, b), ate: Math.max(a, b) });
    trechos.set(g, lista);
  };
  for (const l of validas) {
    const t = tipo(l);
    if (t === "reta") continue;
    const o = caixas[l.de];
    const d = caixas[l.para];
    if (t === "vizinha") junta(o.coluna, `saida:${l.de}`, o.meio, d.meio);
    else {
      const y = alturaVao.get(l.para)!;
      junta(o.coluna, `saida:${l.de}`, o.meio, y);
      junta(d.coluna - 1, `chegada:${l.para}`, y, d.meio);
    }
  }
  const trilhoSaida = new Map<string, number>();
  const trilhoChegada = new Map<string, number>();
  for (const [g, lista] of trechos) {
    const faixa = colorir(lista);
    const n = Math.max(...faixa.values()) + 1;
    const xs = trilhos(n, direita[g] + MARGEM, esquerda[g + 1] - ESPACO_PONTA);
    for (const [chaveTrecho, k] of faixa) {
      const [tipoTrecho, codigo] = chaveTrecho.split(":");
      (tipoTrecho === "saida" ? trilhoSaida : trilhoChegada).set(codigo, xs[k]);
    }
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

/**
 * Rotas copiadas de um desenho de referência (a matriz oficial, em
 * setas-2022.ts), convertidas para as medidas do site: cada ponto é posto no
 * mesmo lugar relativo da coluna ou do corredor, da linha ou do vão. As pontas
 * encostam no cartão (a ponta da seta fica a 2 px dele). Ligação sem percurso
 * de referência fica de fora: quem chama traça essas com `rotear`.
 */
export function rotasDeReferencia(
  referencia: Array<[string, string, Array<[number, "c" | "v", number, number, "c" | "v", number]>]>,
  ligacoes: Ligacao[],
  caixas: Record<string, Caixa>,
): Rota[] {
  const lista = Object.values(caixas);
  if (lista.length === 0) return [];
  const altura = (lista[0].meio - lista[0].topo) * 2;
  const esquerda: Record<number, number> = {};
  const direita: Record<number, number> = {};
  const topo: Record<number, number> = {};
  for (const c of lista) {
    esquerda[c.coluna] = Math.min(esquerda[c.coluna] ?? Infinity, c.esquerda);
    direita[c.coluna] = Math.max(direita[c.coluna] ?? -Infinity, c.direita);
    topo[c.linha] = Math.min(topo[c.linha] ?? Infinity, c.topo);
  }
  const passoX = (esquerda[1] ?? esquerda[0] + 334) - esquerda[0];
  const passoY = (topo[1] ?? topo[0] + 120) - topo[0];
  const colEsq = (i: number) => esquerda[i] ?? esquerda[0] + i * passoX;
  const colDir = (i: number) => direita[i] ?? colEsq(i) + (direita[0] - esquerda[0]);
  const linTopo = (i: number) => topo[i] ?? topo[0] + i * passoY;
  const x = (i: number, k: "c" | "v", f: number) => {
    if (k === "c") return colEsq(i) + f * (colDir(i) - colEsq(i));
    const antes = i > 0 ? colDir(i - 1) : colEsq(0) - (passoX - (colDir(0) - colEsq(0)));
    return antes + f * (colEsq(i) - antes);
  };
  const y = (i: number, k: "c" | "v", f: number) => {
    if (k === "c") return linTopo(i) + f * altura;
    const antes = i > 0 ? linTopo(i - 1) + altura : linTopo(0) - (passoY - altura);
    return antes + f * (linTopo(i) - antes);
  };

  const porPar = new Map(referencia.map(([de, para, pontos]) => [`${de}>${para}`, pontos]));
  const rotas: Rota[] = [];
  for (const l of ligacoes) {
    const pontos = porPar.get(chave(l));
    const o = caixas[l.de];
    const d = caixas[l.para];
    if (!pontos || !o || !d || o.coluna === d.coluna) continue;
    const ps = pontos.map(([ci, ck, cf, li, lk, lf]) => [x(ci, ck, cf), y(li, lk, lf)] as [number, number]);
    // A ponta encosta no cartão de destino: pela esquerda, por baixo ou por cima.
    const [ax, ay] = ps[ps.length - 2];
    const ultimo = ps[ps.length - 1];
    if (ay === ultimo[1]) ultimo[0] = d.esquerda - PONTA;
    else if (ultimo[1] < ay) ultimo[1] = d.topo + altura + PONTA;
    else ultimo[1] = d.topo - PONTA;
    if (ax !== ultimo[0] && ay !== ultimo[1]) continue; // trecho torto: desenho não confiável
    const segmentos: Segmento[] = [];
    for (let i = 1; i < ps.length; i++) {
      const [x1, y1] = ps[i - 1];
      const [x2, y2] = ps[i];
      if (x1 !== x2 || y1 !== y2) segmentos.push({ x1, y1, x2, y2 });
    }
    rotas.push({ ...l, segmentos });
  }
  return rotas;
}
