import { useEffect, useState } from "react";

import api from "../services/api";

/**
 * Taxa de reprovacao por disciplina, para a lista da grade mostrar a resposta
 * antes do clique. Vem do mesmo calculo do ranking, com um corte mais baixo:
 * ali poucos alunos distorceriam a ordem, aqui a barra so acompanha o nome.
 */
export default function useTaxas() {
  const [taxas, setTaxas] = useState({});

  useEffect(() => {
    let ativo = true;

    api
      .get("/ranking?desde=2018&minimo=10")
      .then((resposta) => {
        if (!ativo) return;
        const mapa = {};
        resposta.data.disciplinas.forEach((d) => {
          mapa[d.codigo] = { reprovacao: d.reprovacao, alunos: d.alunos };
        });
        setTaxas(mapa);
      })
      // A barra e um extra: sem ela a lista continua servindo.
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  return taxas;
}
