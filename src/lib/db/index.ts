import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import * as schema from "./schema";

/**
 * O banco é um arquivo no volume da stack (DATABASE_PATH), fora da imagem: a
 * importação anual sobrevive a cada deploy. O site só lê; quem escreve é o
 * script de importação, rodado dentro do container.
 */
export function caminhoDoBanco() {
  return process.env.DATABASE_PATH || path.resolve("dados", "estatisticas.db");
}

function abrir() {
  const conexao = new Database(caminhoDoBanco());
  // WAL: a importação escreve sem travar a leitura do site.
  conexao.pragma("journal_mode = WAL");
  conexao.pragma("busy_timeout = 5000");
  return conexao;
}

// Uma conexão por processo, aberta no primeiro uso: o build do Next importa
// este módulo sem banco nenhum por perto. Em desenvolvimento o Next recarrega
// módulos; guardar no globalThis evita abrir outra a cada recarga.
const global = globalThis as unknown as { banco?: { conexao: Database.Database; db: Db } };

export type Db = BetterSQLite3Database<typeof schema>;

export function banco() {
  if (!global.banco) {
    const conexao = abrir();
    global.banco = { conexao, db: drizzle(conexao, { schema, casing: "snake_case" }) };
  }
  return global.banco;
}

export { schema };

/**
 * Muda toda vez que outra conexão (o script de importação) grava no banco.
 * Serve para jogar fora os números já calculados sem reiniciar o site.
 */
export function versaoDosDados(): number {
  return banco().conexao.pragma("data_version", { simple: true }) as number;
}
