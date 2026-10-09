// Regras de leitura dos relatorios da PROGRAD.
//
// Os relatorios mudaram de formato entre 2021 e 2022: a grafia das situacoes
// perdeu o trema, o nome do curso trocou "da" por "de", o periodo virou um
// codigo de tres digitos e a coluna de media passa vazia quando a situacao
// nao tem nota. Tudo isso fica concentrado aqui.

export type Situacao = string;

/** Minusculas, sem acento e sem espaco sobrando. Usado so para comparar. */
export function chave(valor: string | null | undefined): string {
    return String(valor || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

// Cada situacao conhecida e a forma como ela deve ser gravada.
const SITUACOES: { [k: string]: Situacao } = {
    'aprovado': 'Aprovado',
    'aprovado sem nota': 'Aprovado sem Nota',
    'reprovado por nota': 'Reprovado por Nota',
    'reprovado por frequencia': 'Reprovado por Frequência',
    'matricula': 'Matrícula',
    'dispensa sem nota': 'Dispensa sem nota',
    'amparo legal': 'Amparo Legal',
    'aproveitamento de estudos': 'Aproveitamento de Estudos',
    'mobilidade academica': 'Mobilidade Acadêmica',
    'trancamento de curso': 'Trancamento de Curso',
};

/** Grafia canonica da situacao. Valor desconhecido volta limpo, sem perder o dado. */
export function situacaoCanonica(valor: string | null | undefined): Situacao {
    const k = chave(valor);
    return SITUACOES[k] || String(valor || '').trim();
}

// Situacoes que representam alguem que cursou a disciplina e recebeu um
// resultado. Aproveitamento, trancamento e mobilidade ficam de fora: entram
// no historico do aluno, mas nao dizem nada sobre o desempenho da turma.
const NUCLEO = [
    'aprovado',
    'reprovado por nota',
    'reprovado por frequencia',
];

export function contaNaTurma(situacao: string | null | undefined): boolean {
    return NUCLEO.indexOf(chave(situacao)) !== -1;
}

/**
 * Semestre no formato "2024/1".
 *
 * O relatorio antigo trazia o periodo como "1" ou "2". O de 2022 em diante usa
 * 201 e 202 para o primeiro e o segundo semestre, e 3xx para periodo especial
 * (o banco ja tinha um "2014/C" dessa natureza).
 *
 * O significado de 201/202 nao vem escrito no relatorio, mas os dados o
 * fixam. Engenharia de Computacao entra uma vez por ano, no primeiro
 * semestre, entao quem cursa o 1o periodo da grade esta no primeiro semestre
 * do ano, o 2o periodo no segundo, e assim por diante. Na planilha de
 * 2022-2025 os periodos impares da grade concentram em 201 (794x147 no 1o,
 * 509x183 no 3o, 372x103 no 5o) e os pares em 202 (948x188 no 2o, 545x140 no
 * 4o, 431x115 no 6o), alternando sem excecao. 201 e o primeiro semestre.
 *
 * O 3xx aparece uma unica vez em toda a planilha e continua sendo leitura
 * nossa: virou periodo especial, como o "2014/C" que o banco ja tinha.
 */
export function semestreDe(ano: string | number, periodo: string | number): string {
    const a = String(ano).trim();
    const p = String(periodo).trim();

    if (p === '1' || p === '2') return `${a}/${p}`;
    if (/^2\d\d$/.test(p)) return `${a}/${p.slice(-1)}`;
    if (/^3\d\d$/.test(p)) return `${a}/C`;
    return `${a}/${p}`;
}

// Cursos do Departamento de Informatica em Goiabeiras. O relatorio antigo
// escrevia "Engenharia da Computacao"; o de 2022 em diante, "de Computacao".
//
// A comparacao e exata de proposito. O banco guarda o nome do curso truncado
// em ~26 caracteres, e variantes como "Ciencia da Computacao - Ba" ou
// "Engenharia da Computacao -" podem ser tanto uma enfase de Goiabeiras
// quanto Sao Mateus ou Alegre. Casar por prefixo traria outros campi para
// dentro da media do DI.
const CURSOS_DI = [
    'engenharia da computacao',
    'engenharia de computacao',
    'ciencia da computacao',
];

export function cursoEhDI(curso: string | null | undefined): boolean {
    return CURSOS_DI.indexOf(chave(curso)) !== -1;
}

/** Media como numero, ou null quando a situacao nao tem nota. */
export function mediaDe(valor: unknown): number | null {
    if (valor === null || valor === undefined) return null;
    const texto = String(valor).trim().replace(',', '.');
    if (texto === '') return null;
    const n = parseFloat(texto);
    return isNaN(n) ? null : n;
}
