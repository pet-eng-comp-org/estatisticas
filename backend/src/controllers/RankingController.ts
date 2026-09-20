import { Request, Response } from 'express';
import knex from '../database/connection';
import { chave, contaNaTurma, mediaDe } from '../utils/normaliza';

interface Linha {
    codigo_disciplina: string;
    nome_disciplina: string;
    curso: string;
    media: number | null;
    situacao: string;
    ano: string;
}

interface Resumo {
    codigo: string;
    nome: string;
    periodo_ecomp: number | null;
    curriculo: number | null;
    alunos: number;
    aprovados: number;
    reprovados: number;
    reprovacao: number;
    media: number;
    semestres: number;
}

/**
 * "Quais disciplinas mais reprovam" e a pergunta que um aluno faz antes de
 * montar o semestre, e ate agora o site so respondia uma disciplina por vez:
 * era preciso abrir cada uma e comparar de cabeca.
 */
class RankingController {

    async index(req: Request, res: Response) {
        // Por padrao olha os ultimos anos: o desempenho de 2012 nao ajuda quem
        // vai se matricular agora.
        const desde = String(req.query.desde || '2018');
        // Valor nao numerico vira filtro nenhum: antes comparava contra NaN,
        // que nunca casa, e a resposta vinha vazia como se nao houvesse dado.
        const pedido = Number(req.query.periodo);
        const periodo = Number.isInteger(pedido) ? pedido : null;

        const linhas: Linha[] = await knex('items')
            .select('codigo_disciplina', 'nome_disciplina', 'curso', 'media', 'situacao', 'ano')
            .where('ano', '>=', desde);

        const disciplinas = await knex('disciplines')
            .select('codigo_disciplina', 'nome', 'periodo_ecomp', 'curriculo');

        const naGrade = new Map<string, any>();
        disciplinas.forEach(d => naGrade.set(String(d.codigo_disciplina).trim(), d));

        const acumulado = new Map<string, Resumo & { soma: number; comNota: number; sems: Set<string> }>();

        linhas.forEach(linha => {
            const codigo = String(linha.codigo_disciplina).trim();
            const daGrade = naGrade.get(codigo);
            // So o que tem lugar na grade: o resto e optativa de outro curso,
            // atividade complementar e afins.
            if (!daGrade || daGrade.periodo_ecomp === null) return;
            if (periodo !== null && Number(daGrade.periodo_ecomp) !== periodo) return;
            if (!contaNaTurma(linha.situacao)) return;

            if (!acumulado.has(codigo)) {
                acumulado.set(codigo, {
                    codigo,
                    nome: daGrade.nome,
                    periodo_ecomp: daGrade.periodo_ecomp,
                    curriculo: daGrade.curriculo === undefined ? null : daGrade.curriculo,
                    alunos: 0, aprovados: 0, reprovados: 0,
                    reprovacao: 0, media: 0, semestres: 0,
                    soma: 0, comNota: 0, sems: new Set<string>(),
                });
            }

            const r = acumulado.get(codigo)!;
            const k = chave(linha.situacao);
            r.alunos++;
            r.sems.add(linha.ano);
            if (k === 'aprovado') r.aprovados++;
            else r.reprovados++;

            const nota = mediaDe(linha.media);
            if (nota !== null) { r.soma += nota; r.comNota++; }
        });

        const resultado = Array.from(acumulado.values())
            // Poucos alunos fazem a taxa oscilar demais para servir de guia.
            .filter(r => r.alunos >= 20)
            .map(r => ({
                codigo: r.codigo,
                nome: r.nome,
                periodo_ecomp: r.periodo_ecomp,
                curriculo: r.curriculo,
                alunos: r.alunos,
                aprovados: r.aprovados,
                reprovados: r.reprovados,
                reprovacao: r.reprovados / r.alunos,
                media: r.comNota > 0 ? r.soma / r.comNota : 0,
                semestres: r.sems.size,
            }))
            .sort((a, b) => b.reprovacao - a.reprovacao);

        return res.json({ desde, periodo, disciplinas: resultado });
    }
}

export default RankingController;
