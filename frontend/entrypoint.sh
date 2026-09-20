#!/bin/sh
# Escreve a configuracao que o index.html carrega antes do bundle. Roda a cada
# boot, entao trocar a variavel na stack basta -- nao precisa reconstruir a
# imagem.
set -e

cat > /usr/share/nginx/html/config.js <<FIM
window.__CONFIG__ = { apiUrl: "${REACT_APP_API_URL:-}" };
FIM

exec nginx -g 'daemon off;'
