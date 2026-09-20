/*
 * Ate aqui o backend rodava o TypeScript direto, com ts-node-dev, e o knex
 * gravou em knex_migrations os nomes das migrations ja aplicadas terminando
 * em ".ts". Agora que producao roda o JavaScript compilado, os arquivos no
 * disco terminam em ".js": o knex compara as duas listas, nao acha os ".ts" e
 * recusa subir dizendo que o diretorio de migrations esta corrompido.
 *
 * Este passo renomeia os registros antigos. E idempotente: num banco que ja
 * foi convertido, ou num banco novo, nao ha o que fazer.
 */
const path = require('path');
const sqlite3 = require('sqlite3');

const arquivo =
    process.env.DATABASE_PATH ||
    path.resolve(__dirname, '..', 'src', 'database', 'database.sqlite');

const bd = new sqlite3.Database(arquivo, (erro) => {
    if (erro) {
        console.error('nao foi possivel abrir o banco:', erro.message);
        process.exit(1);
    }
});

bd.serialize(() => {
    bd.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='knex_migrations'",
        (erro, linha) => {
            if (erro) {
                console.error('erro ao consultar o banco:', erro.message);
                process.exit(1);
            }
            if (!linha) {
                console.log('banco novo, sem migrations registradas');
                return bd.close();
            }
            bd.run(
                "UPDATE knex_migrations SET name = REPLACE(name, '.ts', '.js') WHERE name LIKE '%.ts'",
                function (erroUpdate) {
                    if (erroUpdate) {
                        console.error('erro ao converter os registros:', erroUpdate.message);
                        process.exit(1);
                    }
                    console.log(
                        this.changes > 0
                            ? `migrations convertidas de .ts para .js: ${this.changes}`
                            : 'migrations ja estavam no formato compilado'
                    );
                    bd.close();
                }
            );
        }
    );
});
