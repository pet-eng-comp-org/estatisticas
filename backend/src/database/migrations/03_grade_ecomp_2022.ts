import Knex from 'knex';
import { GRADE_ECOMP_2022 } from '../grade-ecomp-2022';

// O curso trocou de curriculo em 2022 e as disciplinas ganharam codigos novos,
// entao a tabela so tinha a grade anterior e as notas de 2022 em diante nao
// tinham onde aparecer.
//
// As disciplinas do curriculo antigo continuam na tabela: o site mostra a serie
// historica delas, que segue ate a ultima turma daquele curriculo.

export async function up(knex: Knex) {
    for (const d of GRADE_ECOMP_2022) {
        const existe = await knex('disciplines')
            .where('codigo_disciplina', d.codigo_disciplina).first();
        if (existe) {
            // Disciplina compartilhada com Ciencia da Computacao: preserva as
            // colunas do outro curso e preenche so as de Engenharia.
            await knex('disciplines')
                .where('codigo_disciplina', d.codigo_disciplina)
                .update({
                    nome: d.nome,
                    periodo_ecomp: d.periodo_ecomp,
                    pre_requisitos_ecomp: d.pre_requisitos_ecomp,
                });
        } else {
            await knex('disciplines').insert(d);
        }
    }
}

export async function down(knex: Knex) {
    // Apaga so o que o up() inseriu. As disciplinas que ele encontrou ja
    // existentes foram atualizadas, nao criadas: sao compartilhadas com
    // Ciencia da Computacao e continuam servindo aquele curso, entao apagar
    // levaria junto periodo_ccomp e pre_requisitos_ccomp.
    const codigos = GRADE_ECOMP_2022.map(d => d.codigo_disciplina);
    await knex('disciplines')
        .whereIn('codigo_disciplina', codigos)
        .whereNull('periodo_ccomp')
        .del();
    await knex('disciplines')
        .whereIn('codigo_disciplina', codigos)
        .whereNotNull('periodo_ccomp')
        .update({ periodo_ecomp: null, pre_requisitos_ecomp: null });
}
