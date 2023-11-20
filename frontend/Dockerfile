FROM node:14-alpine

RUN npm config set registry http://registry.npmjs.org/
RUN npm i npm@6.14.18
RUN rm -rf /usr/local/lib/node_modules/npm
RUN mv node_modules/npm /usr/local/lib/node_modules/npm

WORKDIR /app

COPY . .
RUN npm install
RUN npm install -g serve

CMD  npm run build && serve -l 80 -s build
