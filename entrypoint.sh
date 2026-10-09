#!/bin/sh
# O volume de dados veio do site anterior, que rodava como root: a pasta é do
# root. Aqui, ainda como root, ela passa para o usuário node, e o resto roda
# como node, sem privilégio.
set -e
if [ "$(id -u)" = "0" ]; then
  mkdir -p /dados
  chown node:node /dados
  exec su-exec node "$@"
fi
exec "$@"
