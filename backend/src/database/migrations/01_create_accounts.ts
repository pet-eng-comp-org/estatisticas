import Knex from 'knex';

//criar tabela de login

export async function up(knex: Knex){
    return knex.schema.createTable('user', table =>{
        table.increments('id').primary();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('senha').notNullable();
        table.boolean('admin').notNullable();
    });
};

//deletar a tabela
export async function down(knex: Knex){
    return knex.schema.dropTable('user');
};