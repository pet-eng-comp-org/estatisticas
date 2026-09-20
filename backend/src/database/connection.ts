import knex from 'knex';
import path from 'path';

// O caminho do banco e configuravel para que ele possa viver num volume,
// fora da imagem. Sem DATABASE_PATH o comportamento e o antigo.
const filename = process.env.DATABASE_PATH
    || path.resolve(__dirname, 'database.sqlite');

const connection = knex({
    client: 'sqlite3',
    connection: { filename },
    useNullAsDefault: true,
})

export default connection;
