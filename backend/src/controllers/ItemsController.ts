import { Request, Response } from 'express';
import knex from '../database/connection';
import csv from 'csv-parser';
import fs from 'fs';

import { mediaDe, semestreDe, situacaoCanonica } from '../utils/normaliza';
import { agrega, Item } from '../utils/agregacao';

/** Le o CSV inteiro antes de devolver. */
function leCsv(caminho: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const linhas: any[] = [];
        fs.createReadStream(caminho)
            .pipe(csv())
            .on('data', linha => linhas.push(linha))
            .on('end', () => resolve(linhas))
            .on('error', reject);
    });
}

// O relatorio da PROGRAD mudou de cabecalho em 2022. Aceita os dois.
function campo(linha: any, ...nomes: string[]): string {
    for (const n of nomes) {
        if (linha[n] !== undefined && linha[n] !== null && String(linha[n]).trim() !== '') {
            return String(linha[n]).trim();
        }
    }
    return '';
}

class ItemsController {

    async index(req: Request, res: Response) {
        // Sem a matricula: identifica o aluno e nada nesta resposta depende dela.
        const items = await knex('items')
            .distinct()
            .select(
                'id', 'nome_disciplina', 'codigo_disciplina',
                'curso', 'media', 'situacao', 'ano', 'professor',
            );
        return res.json(items);
    }

    async show(req: Request, res: Response) {
        const { codigo_disciplina } = req.params;

        const consulta = knex<Item>('items').distinct()
            .where('codigo_disciplina', codigo_disciplina);
        if (req.query.ano) {
            consulta.andWhere('ano', String(req.query.ano));
        }
        const items = await consulta;

        return res.json(agrega(items));
    }

    async create(req: Request, res: Response) {
        if (!req.user.admin) {
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        if (!req.file) {
            return res.status(400).json({ message: "Nenhum arquivo enviado." });
        }

        let linhas: any[];
        try {
            linhas = await leCsv(req.file.path);
        } catch (erro) {
            return res.status(400).json({ message: "Nao foi possivel ler o CSV.", erro: String(erro) });
        }

        const lista: Item[] = linhas.map(linha => ({
            nome_disciplina: campo(linha, 'NOME_DISCIPLINA'),
            codigo_disciplina: campo(linha, 'COD_DISCIPLINA'),
            curso: campo(linha, 'NOME_CURSO_ALUNO', 'NOME_CURSO'),
            media: mediaDe(campo(linha, 'MEDIA_FINAL')),
            situacao: situacaoCanonica(campo(linha, 'SITUACAO')),
            ano: semestreDe(campo(linha, 'ANO'), campo(linha, 'PERIODO', 'PERIODO_ITEM')),
            professor: campo(linha, 'NOME_DOCENTE'),
            matricula: campo(linha, 'MATR_ALUNO'),
        })).filter(item => item.codigo_disciplina !== '');

        // Relatorios ate 2021 trazem a matricula do aluno, e ela identifica a
        // linha. Os de 2022 em diante nao trazem: duas linhas iguais sao dois
        // alunos diferentes e nao da para distinguir reimportacao de dado novo.
        const temMatricula = lista.some(item => item.matricula !== '');
        const semestres = Array.from(new Set(lista.map(item => item.ano)));
        const substituir = String(req.query.modo || '') === 'substituir';

        if (!temMatricula && !substituir) {
            const jaExiste = await knex('items')
                .whereIn('ano', semestres)
                .count({ n: '*' }).first();
            const n = Number(jaExiste && jaExiste.n) || 0;
            if (n > 0) {
                return res.status(409).json({
                    message: "O arquivo nao traz MATR_ALUNO, entao nao e possivel "
                        + "distinguir reimportacao de dado novo. Ja existem registros "
                        + "nos semestres deste arquivo. Reenvie com ?modo=substituir "
                        + "para apagar esses semestres e regravar.",
                    semestres,
                    registros_existentes: n,
                });
            }
        }

        let inseridos = 0;
        let repetidos = 0;
        let removidos = 0;
        const trx = await knex.transaction();
        try {
            if (!temMatricula && substituir) {
                removidos = await trx('items').whereIn('ano', semestres).del();
            }

            for (const item of lista) {
                if (temMatricula && item.matricula !== '') {
                    const existente = await trx('items').where({
                        codigo_disciplina: item.codigo_disciplina,
                        matricula: item.matricula,
                        ano: item.ano,
                    }).select('id');
                    if (existente.length !== 0) {
                        repetidos++;
                        continue;
                    }
                }
                await trx('items').insert(item);
                inseridos++;
            }
            await trx.commit();
        } catch (erro) {
            await trx.rollback();
            return res.status(500).json({ message: "Importacao revertida.", erro: String(erro) });
        }

        return res.json({ lidos: lista.length, inseridos, repetidos, removidos, semestres });
    }
}

export default ItemsController;
