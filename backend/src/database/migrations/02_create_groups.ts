import Knex from 'knex';

//criar tabela de login

export async function up(knex: Knex){
    return knex.schema.createTable('disciplines', table =>{
        table.string('codigo_disciplina').notNullable().primary();
        table.string('nome').notNullable();
        table.integer('periodo_ecomp');
        table.string('pre_requisitos_ecomp');
        table.integer('periodo_ccomp');
        table.string('pre_requisitos_ccomp');
    });
};

//deletar a tabela
export async function down(knex: Knex){
    return knex.schema.dropTable('disciplines');
};