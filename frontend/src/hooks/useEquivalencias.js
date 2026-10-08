import { useEffect, useState } from "react";

import api from "../services/api";

/**
 * Pares [codigo 2022, codigo 2008] da secao "Equivalencias" do PPC. Devolve
 * os dois sentidos, porque uma disciplina pode ter mais de uma equivalente.
 */
export default function useEquivalencias() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    api
      .get("/equivalencias")
      .then((resposta) => ativo && setDados(resposta.data))
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
    };
  }, []);

  const pares = dados ? dados.pares : [];
  const deNova = {};
  const deAntiga = {};
  pares.forEach(([nova, antiga]) => {
    (deNova[nova] = deNova[nova] || []).push(antiga);
    (deAntiga[antiga] = deAntiga[antiga] || []).push(nova);
  });

  // Nome das antigas que nao estao na tabela do site (so tem as que
  // tiveram nota importada).
  const nomes2008 = dados ? dados.nomes2008 : {};

  return { pares, deNova, deAntiga, nomes2008, carregando: dados === null && !erro, erro };
}
