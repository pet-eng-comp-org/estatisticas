import Knex from 'knex';
import { CODIGOS_ECOMP_2022 } from '../grade-ecomp-2022';

// Duas geracoes de disciplina convivem na grade: a do curriculo 2022 e a
// anterior, que continua no ar enquanto houver serie historica. Varias
// mantiveram o nome -- "Calculo I" existe nas duas -- entao a tela precisa de
// algo que as distinga.

export async function up(knex: Knex) {
    const tem = await knex.schema.hasColumn('disciplines', 'curriculo');
    if (!tem) {
        await knex.schema.table('disciplines', table => {
            table.integer('curriculo');
        });
    }
    await knex('disciplines')
        .whereIn('codigo_disciplina', CODIGOS_ECOMP_2022)
        .update({ curriculo: 2022 });
}

export async function down(knex: Knex) {
    const tem = await knex.schema.hasColumn('disciplines', 'curriculo');
    if (tem) {
        await knex.schema.table('disciplines', table => {
            table.dropColumn('curriculo');
        });
    }
}
