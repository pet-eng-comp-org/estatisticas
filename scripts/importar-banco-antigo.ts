// Copia o banco do site antigo para o banco novo, à mão:
//
//   node operacao/importar-banco-antigo.js /dados/database.sqlite
//
// Normalmente não é preciso: a preparação do banco, na subida do container,
// faz isso sozinha quando o banco novo está vazio. Rodar de novo apaga e
// recria as tabelas do banco novo a partir do antigo.
import Database from "better-sqlite3";
import path from "node:path";
import { copiarBancoAntigo } from "../src/lib/db/banco-antigo";

const origem = process.argv[2];
if (!origem) {
  console.error("uso: importar-banco-antigo <database.sqlite>");
  process.exit(2);
}
const destino = process.env.DATABASE_PATH || path.resolve("dados", "estatisticas.db");
const conexao = new Database(destino);
const { disciplinas, notas } = copiarBancoAntigo(origem, conexao);
conexao.close();
console.log(`${disciplinas} disciplinas e ${notas} notas copiadas para ${destino}`);
