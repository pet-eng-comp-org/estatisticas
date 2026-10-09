// Avisa os buscadores que usam o IndexNow (Bing, e por ele DuckDuckGo, Yahoo e
// Ecosia; também o Yandex) de que as páginas do site mudaram, para não
// esperarem a próxima visita. Roda depois de um deploy ou de uma importação:
//
//   node operacao/avisar-buscadores.js
//
// O Google não usa IndexNow; ele lê o sitemap pelo Search Console.
// A chave é pública de propósito: o arquivo public/<chave>.txt prova que o
// site é nosso.
import fs from "node:fs";
import path from "node:path";

const SITE = process.env.URL_SITE || "https://estatistica.pet.inf.ufes.br";
const pasta = process.env.PASTA_PUBLICA || path.resolve("public");
const arquivo = fs.readdirSync(pasta).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!arquivo) {
  console.error(`nenhuma chave do IndexNow em ${pasta}`);
  process.exit(1);
}
const chave = arquivo.replace(".txt", "");

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const resposta = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: chave, keyLocation: `${SITE}/${arquivo}`, urlList: urls }),
});
console.log(`${urls.length} páginas enviadas ao IndexNow: HTTP ${resposta.status}`);
if (resposta.status >= 300) process.exit(1);
