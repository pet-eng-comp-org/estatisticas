import axios from "axios";

/*
 * A URL da API vem do config.js que o container escreve no boot, a partir da
 * variavel da stack. Gravar a URL dentro do bundle obrigaria a reconstruir a
 * imagem para apontar para outro ambiente.
 *
 * Em desenvolvimento o config.js vem vazio e vale a variavel do .env; o nome
 * REACT_APP_API_URL ficou de quando o projeto usava create-react-app, e segue
 * assim porque e o que a stack ja tem configurado.
 */
const doContainer = (window.__CONFIG__ || {}).apiUrl;
const doAmbiente = import.meta.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: doContainer || doAmbiente || "",
});

export default api;
