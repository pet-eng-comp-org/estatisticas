import { useEffect, useState } from "react";

import api from "../services/api";

/**
 * Carrega a grade uma vez e devolve o estado do carregamento junto.
 *
 * As tres telas de navegacao pediam /viewSortedGrid por conta propria e
 * nenhuma tratava demora ou falha: se a API nao respondesse, a lista ficava
 * vazia sem explicar nada a quem estava olhando.
 */
export default function useGrade() {
  const [grade, setGrade] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    api
      .get("/viewSortedGrid")
      .then((resposta) => {
        if (ativo) setGrade(resposta.data);
      })
      .catch(() => {
        if (ativo) setErro("nao foi possivel carregar a lista de disciplinas");
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { grade, erro, carregando: grade === null && erro === null };
}
