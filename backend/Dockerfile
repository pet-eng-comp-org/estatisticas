FROM node:20-alpine

# O Node 20 precisa das ferramentas de build para compilar o driver do SQLite.
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY . .

RUN npm ci

# Compila o TypeScript: producao roda o JavaScript gerado, nao o ts-node-dev,
# que e um observador de arquivos feito para desenvolvimento.
RUN npm run build

# As migrations precisam rodar antes do servidor. Antes daqui o CMD era
# "npm run dev && npm knex:migrate": o dev e um watcher que nunca termina,
# entao a segunda parte era inalcancavel -- e "npm knex:migrate" nem e
# comando valido, faltava o "run". Com o banco num volume, migration que
# nao roda no boot simplesmente nao e aplicada.
CMD node scripts/normaliza-migrations.js && npm run knex:migrate && npm start
