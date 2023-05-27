FROM node:10-alpine

WORKDIR /app

COPY . .

EXPOSE 2020

CMD npm install && npm run dev && npm knex:migrate 
