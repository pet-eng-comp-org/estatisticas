# Fixada por digest, não pela tag: a tag node:24 troca de conteúdo sem aviso, e
# duas construções da mesma revisão poderiam gerar imagens diferentes.
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS base

# --- dependências (camada reaproveitada enquanto package*.json não mudam) ---
FROM base AS deps
WORKDIR /app
# Só para o caso de o better-sqlite3 não ter binário pronto para esta
# plataforma e precisar compilar; não vão para a imagem final.
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# --- build ---
FROM base AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# Scripts de operação num arquivo cada: rodam na imagem final sem tsx. O
# better-sqlite3 é binário nativo e vem do standalone.
RUN npx esbuild scripts/preparar-banco.ts scripts/importar-notas.ts scripts/importar-banco-antigo.ts scripts/avisar-buscadores.ts \
      --bundle --platform=node --format=esm --target=node24 --outdir=dist \
      --external:better-sqlite3 \
      "--banner:js=import{createRequire}from'module';const require=createRequire(import.meta.url);"

# --- execução ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 \
    DATABASE_PATH=/dados/estatisticas.db BANCO_ANTIGO=/dados/database.sqlite
RUN apk add --no-cache su-exec
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/drizzle ./drizzle
# A imagem de prévia (opengraph-image.tsx) lê a Inter em TTF do disco.
COPY --from=build --chown=node:node /app/src/app/fontes/*.ttf ./src/app/fontes/
COPY --from=build --chown=node:node /app/dist ./operacao
COPY --chmod=755 entrypoint.sh /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
# Prepara o banco (migrations e, na primeira vez, a cópia do banco antigo)
# antes de subir o site.
CMD ["sh", "-c", "node operacao/preparar-banco.js && exec node server.js"]
