import Knex from 'knex';
import { CARGA_HORARIA_2008, CARGA_HORARIA_2022 } from '../carga-horaria';

// O site passou a mostrar a carga horaria de cada disciplina ("60h ·
// Obrigatoria"), que a tabela nunca guardou. Os valores vem dos documentos
// oficiais dos dois curriculos; a origem de cada um esta em carga-horaria.ts.

export async function up(knex: Knex) {
    const tem = await knex.schema.hasColumn('disciplines', 'carga_horaria');
    if (!tem) {
        await knex.schema.table('disciplines', table => {
            table.integer('carga_horaria');
        });
    }
    const todas = { ...CARGA_HORARIA_2008, ...CARGA_HORARIA_2022 };
    for (const [codigo, horas] of Object.entries(todas)) {
        await knex('disciplines')
            .where('codigo_disciplina', codigo)
            .update({ carga_horaria: horas });
    }
}

export async function down(knex: Knex) {
    const tem = await knex.schema.hasColumn('disciplines', 'carga_horaria');
    if (tem) {
        await knex.schema.table('disciplines', table => {
            table.dropColumn('carga_horaria');
        });
    }
}
