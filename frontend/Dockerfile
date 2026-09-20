# O bundle e montado aqui, na construcao da imagem. Antes o container rodava
# "npm run build" a cada boot: o deploy levava cerca de um minuto so
# compilando, e um erro de build so aparecia em producao.
FROM node:20-alpine AS construcao

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# A imagem final tem so os arquivos prontos e um servidor estatico.
FROM nginx:1.27-alpine

COPY --from=construcao /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
