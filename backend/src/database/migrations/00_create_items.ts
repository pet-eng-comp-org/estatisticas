import Knex from 'knex';

//criar tabela

export async function up(knex: Knex){
    return knex.schema.createTable('items', table =>{
        table.increments('id').primary();
        table.string('nome_disciplina').notNullable();
        table.string('codigo_disciplina').notNullable();
        table.string('curso').notNullable();
        table.decimal('media');
        table.string('situacao').notNullable();
        table.string('ano').notNullable();
        table.string('professor').notNullable();
        table.string('matricula').notNullable();
    });
};

//deletar a tabela
export async function down(knex: Knex){
    return knex.schema.dropTable('items');
};