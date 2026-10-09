// Roda na subida do container, antes do site (ver Dockerfile):
//   1. aplica as migrations de ./drizzle, criando o arquivo se preciso;
//   2. se o banco ainda não tem nota nenhuma e o banco do site antigo está no
//      mesmo volume (BANCO_ANTIGO), copia os dados dele.
// O passo 2 faz a troca de versão sem ninguém precisar entrar no container,
// e não roda de novo depois: com notas no banco, ele é pulado.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import { copiarBancoAntigo } from "../src/lib/db/banco-antigo";

const arquivo = process.env.DATABASE_PATH || path.resolve("dados", "estatisticas.db");
fs.mkdirSync(path.dirname(arquivo), { recursive: true });
const conexao = new Database(arquivo);
migrate(drizzle(conexao), { migrationsFolder: process.env.PASTA_MIGRATIONS || "./drizzle" });
console.log(`migrations aplicadas em ${arquivo}`);

const antigo = process.env.BANCO_ANTIGO;
const { n } = conexao.prepare("select count(*) as n from notas").get() as { n: number };
if (n === 0 && antigo && fs.existsSync(antigo)) {
  const r = copiarBancoAntigo(antigo, conexao);
  console.log(`banco novo vazio: ${r.disciplinas} disciplinas e ${r.notas} notas copiadas de ${antigo}`);
}
conexao.close();
