// Importa um relatório de notas da coordenação (CSV) para o banco do site.
//
//   node operacao/importar-notas.js /caminho/relatorio.csv [--substituir]
//
// Dentro do container, pelo console do Portainer. Antes, copie o arquivo para
// o volume (ou para /tmp do container) e faça backup do banco. O site mostra
// os números novos sozinho, sem reiniciar.
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../src/lib/db/schema";
import { gravar, lerRelatorio } from "../src/lib/notas/importacao";

const [arquivo, ...opcoes] = process.argv.slice(2);
if (!arquivo) {
  console.error("uso: importar-notas <relatorio.csv> [--substituir]");
  process.exit(2);
}

const { notas, problemas } = lerRelatorio(fs.readFileSync(arquivo, "utf8"));
if (problemas.length > 0) {
  console.error(`${problemas.length} linha(s) com problema; nada foi gravado:`);
  for (const p of problemas.slice(0, 20)) console.error(`  linha ${p.linha}: ${p.erro}`);
  process.exit(1);
}

const banco = process.env.DATABASE_PATH || path.resolve("dados", "estatisticas.db");
const conexao = new Database(banco);
conexao.pragma("busy_timeout = 5000");
const resultado = gravar(drizzle(conexao, { schema, casing: "snake_case" }), notas, opcoes.includes("--substituir"));
conexao.close();

if (!resultado.ok) {
  console.error(
    `O arquivo tem linhas sem MATR_ALUNO, e já existem ${resultado.existentes} notas dessas disciplinas ` +
      `nos semestres ${resultado.semestres.join(", ")}. Sem a matrícula não dá para saber se é ` +
      "reimportação ou dado novo. Rode de novo com --substituir para apagar e regravar só o que o arquivo cobre.",
  );
  process.exit(1);
}
console.log(resultado);
