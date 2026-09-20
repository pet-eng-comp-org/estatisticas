import Knex from 'knex';

// A tabela items passou de 85 mil linhas e nao tinha indice nenhum: toda
// consulta do site varria a tabela inteira. O site sempre busca por
// codigo_disciplina, as vezes junto com o semestre, e a importacao verifica
// semestres inteiros.
//
// As migrations rodam no boot do container, entao uma que estoure deixa o
// site fora do ar. Criar indice que ja existe e erro no SQLite, e um indice
// pode ter sido criado a mao em algum banco -- por isso cada um e conferido
// antes.

const INDICES: Array<[string, string[]]> = [
    ['idx_items_disciplina', ['codigo_disciplina']],
    ['idx_items_disciplina_ano', ['codigo_disciplina', 'ano']],
    ['idx_items_ano', ['ano']],
];

async function existe(knex: Knex, nome: string): Promise<boolean> {
    const achado = await knex('sqlite_master')
        .where({ type: 'index', name: nome })
        .first();
    return Boolean(achado);
}

export async function up(knex: Knex) {
    for (const [nome, colunas] of INDICES) {
        if (await existe(knex, nome)) continue;
        await knex.schema.table('items', table => {
            table.index(colunas, nome);
        });
    }
}

export async function down(knex: Knex) {
    for (const [nome, colunas] of INDICES) {
        if (!(await existe(knex, nome))) continue;
        await knex.schema.table('items', table => {
            table.dropIndex(colunas, nome);
        });
    }
}
