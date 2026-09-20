import { Request, Response } from 'express';
import knex from '../database/connection';
import csv from 'csv-parser';
import fs from 'fs';

import { mediaDe, semestreDe, situacaoCanonica } from '../utils/normaliza';
import { agrega, Item } from '../utils/agregacao';

/** Apaga o arquivo enviado, que fica numa pasta servida publicamente. */
function descarta(caminho: string) {
    fs.unlink(caminho, () => { /* ja foi lido; se sumiu antes, tudo bem */ });
}

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
        if (!req.user || !req.user.admin) {
            return res.status(401).send("User is not admin. It is necessary to be an admin to create/update the data table.")
        }
        if (!req.file) {
            return res.status(400).json({ message: "Nenhum arquivo enviado." });
        }

        // O relatorio traz nota de aluno e o multer grava em /app/uploads, que
        // o server.ts serve como estatico, sem autenticacao. O arquivo nao pode
        // sobreviver a requisicao.
        const enviado = req.file.path;
        let linhas: any[];
        try {
            linhas = await leCsv(enviado);
        } catch (erro) {
            return res.status(400).json({ message: "Nao foi possivel ler o CSV.", erro: String(erro) });
        } finally {
            descarta(enviado);
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
        // linha: da para reimportar o mesmo arquivo sem duplicar. Os de 2022 em
        // diante nao trazem, e ai duas linhas iguais sao dois alunos, nao uma
        // repeticao.
        //
        // A decisao e por linha, nao pelo arquivo: olhar so se "alguma" linha
        // tem matricula fazia um arquivo misto entrar inteiro em modo de
        // deduplicacao, e as linhas sem matricula eram gravadas sem checagem
        // nenhuma -- reimportar duplicava todas elas.
        const semestres = Array.from(new Set(lista.map(item => item.ano)));
        const codigos = Array.from(new Set(lista.map(item => String(item.codigo_disciplina))));
        const substituir = String(req.query.modo || '') === 'substituir';
        const semMatricula = lista.filter(item => item.matricula === '');

        if (semMatricula.length > 0 && !substituir) {
            // So conta o que colide com as linhas sem matricula: disciplinas e
            // semestres que elas trazem.
            const anos = Array.from(new Set(semMatricula.map(i => i.ano)));
            const disciplinas = Array.from(new Set(semMatricula.map(i => String(i.codigo_disciplina))));
            // Os dois filtros vao em blocos separados: encadear dois whereIn
            // faz o knex 0.21 resolver para a sobrecarga de varias colunas.
            const jaExiste = await knex('items')
                .whereIn('ano', anos)
                .whereIn('codigo_disciplina', disciplinas)
                .count({ n: '*' }).first();
            const n = Number(jaExiste && jaExiste.n) || 0;
            if (n > 0) {
                return res.status(409).json({
                    message: "Ha linhas sem MATR_ALUNO, e sem a matricula nao da para "
                        + "distinguir reimportacao de dado novo. Ja existem registros "
                        + "dessas disciplinas nesses semestres. Reenvie com "
                        + "?modo=substituir para apagar e regravar so o que o arquivo "
                        + "cobre.",
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
            if (substituir) {
                // Restrito ao que o arquivo cobre. Apagar o semestre inteiro
                // levaria junto as disciplinas que nao estao nele: um relatorio
                // so das materias do DI apagaria as de matematica, fisica e
                // eletrica daquele semestre, sem repor.
                removidos = await trx('items')
                    .whereIn('ano', semestres)
                    .whereIn('codigo_disciplina', codigos)
                    .del();
            }

            for (const item of lista) {
                // Depois de substituir nao ha o que deduplicar: a faixa que o
                // arquivo cobre acabou de ser esvaziada.
                if (!substituir && item.matricula !== '') {
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
