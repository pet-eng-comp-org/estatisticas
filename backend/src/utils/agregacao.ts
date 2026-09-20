// Agregacao das notas por periodo e professor. Logica pura, sem banco, para
// poder ser conferida isoladamente.

import { chave, contaNaTurma, cursoEhDI, mediaDe } from './normaliza';

export interface Item {
    nome_disciplina?: string;
    codigo_disciplina?: string;
    curso: string;
    media: number | null;
    situacao: string;
    ano: string;
    professor: string;
    matricula?: string;
}

export interface Resultado {
    periodo: string;
    aprovados: number;
    reprovados_por_nota: number;
    reprovados_por_frequencia: number;
    amparo_legal: number;
    matricula: number;
    dispensa_sem_nota: number;
    professor: string;
    media: number;
    media_di: number;
    alunos_di: number;
    aprovados_di: number;
    reprovados_por_nota_di: number;
    reprovados_por_frequencia_di: number;
}

// Soma das notas e quantidade correspondente, para que a media use sempre o
// mesmo conjunto no numerador e no denominador.
interface Acumulador {
    resultado: Resultado;
    soma: number;
    comNota: number;
    soma_di: number;
    comNota_di: number;
}

function novoAcumulador(periodo: string, professor: string): Acumulador {
    return {
        resultado: {
            periodo,
            professor,
            aprovados: 0,
            reprovados_por_nota: 0,
            reprovados_por_frequencia: 0,
            amparo_legal: 0,
            matricula: 0,
            dispensa_sem_nota: 0,
            media: 0,
            media_di: 0,
            alunos_di: 0,
            aprovados_di: 0,
            reprovados_por_nota_di: 0,
            reprovados_por_frequencia_di: 0,
        },
        soma: 0,
        comNota: 0,
        soma_di: 0,
        comNota_di: 0,
    };
}

function acumula(acc: Acumulador, item: Item) {
    const r = acc.resultado;
    const k = chave(item.situacao);
    const nota = mediaDe(item.media);
    const di = cursoEhDI(item.curso);

    switch (k) {
        case 'aprovado':
            r.aprovados++;
            if (di) r.aprovados_di++;
            break;
        case 'reprovado por nota':
            r.reprovados_por_nota++;
            if (di) r.reprovados_por_nota_di++;
            break;
        case 'reprovado por frequencia':
            r.reprovados_por_frequencia++;
            if (di) r.reprovados_por_frequencia_di++;
            break;
        case 'matricula':
            r.matricula++;
            break;
        case 'amparo legal':
            r.amparo_legal++;
            break;
        case 'dispensa sem nota':
            r.dispensa_sem_nota++;
            break;
        default:
            // Aproveitamento de estudos, trancamento, mobilidade: entram no
            // historico do aluno, mas nao descrevem o desempenho da turma.
            break;
    }

    if (!contaNaTurma(item.situacao)) return;

    if (di) r.alunos_di++;

    // Reprovado por frequencia costuma vir sem nota. Entra na taxa de
    // reprovacao, mas nao pode puxar a media como se fosse zero.
    if (nota !== null) {
        acc.soma += nota;
        acc.comNota++;
        if (di) {
            acc.soma_di += nota;
            acc.comNota_di++;
        }
    }
}

export function agrega(items: Item[]): Resultado[] {
    const porChave: { [k: string]: Acumulador } = {};
    const ordem: Acumulador[] = [];

    items.forEach(item => {
        const k = `${item.ano}\u0000${item.professor}`;
        if (!porChave[k]) {
            porChave[k] = novoAcumulador(item.ano, item.professor);
            ordem.push(porChave[k]);
        }
        acumula(porChave[k], item);
    });

    return ordem.map(acc => {
        acc.resultado.media = acc.comNota > 0 ? acc.soma / acc.comNota : 0;
        acc.resultado.media_di = acc.comNota_di > 0 ? acc.soma_di / acc.comNota_di : 0;
        return acc.resultado;
    });
}
