# Estatísticas de disciplinas — Engenharia de Computação UFES

Site do PET Engenharia de Computação com aprovação, notas e dificuldade das
disciplinas dos currículos 2008 e 2022: <https://estatistica.pet.inf.ufes.br>.

Uma aplicação Next (App Router) + React + TypeScript + Tailwind, com o banco
num arquivo SQLite lido pelo Drizzle. O site só lê; os dados entram uma vez
por ano, pelo relatório de notas da coordenação.

## Rodar na sua máquina

```bash
npm install
# Cria dados/estatisticas.db. Com BANCO_ANTIGO, copia os dados de um backup
# do banco do site anterior (o database.sqlite do volume); sem ele, o banco
# fica vazio e a grade aparece sem números.
BANCO_ANTIGO=/caminho/database.sqlite npm run db:preparar
npm run dev          # http://localhost:3000
npm test             # Vitest: dificuldade, agregação e importação
```

O banco tem nota e matrícula de aluno: não vai para o git (`dados/` está no
`.gitignore`) e não sai da VM a não ser em backup.

## De onde vem cada coisa

- **Notas**: relatórios da coordenação (CSV), importados com `importar-notas`.
- **Grade 2022**: `src/lib/curriculos/grade-2022.ts`, da grade emitida em
  11/02/2025 (revisão 2025 da página do PPC no site do DI).
- **Desenho da grade**: `src/lib/curriculos/matriz.ts`, copiado da
  "Representação Gráfica da Matriz Curricular - 2022 (Revisão 2024)": posição
  de cada disciplina, área (cor) e pré-requisitos que viram etiqueta.
- **Grade 2008**: veio do banco do site anterior e confere, período a período e pré-requisito a pré-requisito, com a última emissão oficial da versão 2008 (05/07/2017, "Grade Curricular - 2017" na página do PPC). Não tem representação gráfica oficial, então a tela Grade mostra só a de 2022.
- **Carga horária** e **equivalências 2022 ⇄ 2008**: documentos oficiais,
  com o link em cada arquivo de `src/lib/curriculos/`.
- **Dificuldade (1 a 5)**: `src/lib/notas/dificuldade.ts`. Combina
  reprovação, média e desvio padrão das notas desde 2018, comparando as
  disciplinas entre si; a explicação para o público fica no balão da
  interrogação ao lado de "Dificuldade" (`src/components/AjudaDificuldade.tsx`).
  O balão é o `Ajuda.tsx`, usado também na média, na mediana e na tela Comparar.

## Importar um relatório novo

1. Peça o relatório de notas à coordenação, em CSV, com as colunas de sempre
   (`COD_DISCIPLINA`, `NOME_DISCIPLINA`, `NOME_CURSO_ALUNO`, `MEDIA_FINAL`,
   `SITUACAO`, `ANO`, `PERIODO`, `NOME_DOCENTE` e, se houver, `MATR_ALUNO`).
2. Faça backup do volume `estatisticas_data`.
3. Copie o arquivo para o container e importe, pelo console do Portainer ou
   com `docker exec -u node`:

   ```bash
   node operacao/importar-notas.js /tmp/relatorio.csv
   ```

   Linha com dado inválido interrompe tudo antes de gravar. Relatório sem
   matrícula (de 2022 em diante) de semestres que já estão no banco pede
   `--substituir`, que apaga e regrava só as disciplinas e os semestres que o
   arquivo cobre.
4. O site mostra os números novos sozinho, sem reiniciar.
5. Opcional: `node operacao/avisar-buscadores.js` avisa o Bing (e por ele
   DuckDuckGo, Yahoo e Ecosia) de que as páginas mudaram (IndexNow). O Google
   lê o sitemap sozinho pelo Search Console.

## Deploy

Git-ops, como as outras stacks do PET: cada push no `master` roda o CI
(`.github/workflows/ci.yml`), publica a imagem no GHCR e grava o digest dela
em `docker-compose.prod.yml`; o Portainer aplica em até 5 minutos. Voltar uma
versão é `git revert` do commit `deploy:`.

Na subida, o container aplica as migrations e, se o banco novo está vazio e
o do site anterior (`/dados/database.sqlite`) existe no volume, copia os dados
dele. O arquivo antigo só é lido.

### Imagem com nome novo

O compose só pode apontar para uma imagem que já existe no GHCR. Quando o
nome da imagem muda (foi `siteestatisticas` até 10/10/2026, agora
`estatisticas`, o nome do repositório):

1. Mudar `IMAGEM` no `ci.yml` numa branch e rodar o CI por
   `workflow_dispatch` nela: ele publica a imagem sem implantar.
2. Gravar o digest e o `sha-` dela no `docker-compose.prod.yml`, na mesma
   branch; merge no `master`.
