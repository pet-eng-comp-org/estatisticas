import Knex from 'knex';
import { GRADE_ECOMP_2022 } from '../grade-ecomp-2022';

// A migration 03 gravou os nomes como saem do PDF da UFES, em caixa alta, e
// as disciplinas que ja estavam na tabela usam caixa mista. Numa lista em que
// as duas geracoes aparecem juntas isso fica visivel -- "Calculo I" ao lado de
// "CALCULO I". Como a 03 ja rodou onde o banco esta num volume, a correcao
// precisa de migration propria.

export async function up(knex: Knex) {
    for (const d of GRADE_ECOMP_2022) {
        await knex('disciplines')
            .where('codigo_disciplina', d.codigo_disciplina)
            .update({ nome: d.nome });
    }
}

export async function down(knex: Knex) {
    // Sem volta: o nome anterior era o mesmo texto em caixa alta, e a grafia
    // correta nao se perde ao reaplicar.
}
