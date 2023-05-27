FROM node:10-alpine

WORKDIR /app

COPY . .

EXPOSE 2121

CMD npm install && npm run dev && npm knex:migrate 
