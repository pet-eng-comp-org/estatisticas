FROM node:10-alpine

RUN npm config set registry http://registry.npmjs.org/
RUN npm i npm@6.14.18
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm

WORKDIR /app

COPY . .

RUN npm install

# As migrations precisam rodar antes do servidor. Antes daqui o CMD era
# "npm run dev && npm knex:migrate": o dev e um watcher que nunca termina,
# entao a segunda parte era inalcancavel -- e "npm knex:migrate" nem e
# comando valido, faltava o "run". Com o banco num volume, migration que
# nao roda no boot simplesmente nao e aplicada.
CMD npm run knex:migrate && npm run dev
