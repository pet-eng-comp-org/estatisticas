FROM node:10-alpine

RUN npm config set registry http://registry.npmjs.org/
RUN npm i npm@6.14.18
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm

WORKDIR /app

COPY . .

RUN npm install

CMD  npm run dev && npm knex:migrate 
