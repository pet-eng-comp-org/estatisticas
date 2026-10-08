import { useEffect, useState } from "react";

import api from "../services/api";

// O desempenho de 2012 nao ajuda quem vai se matricular agora: os numeros
// dos cartoes olham as turmas desde este ano, como o ranking ja fazia.
export const DESDE = "2018";

// Com menos alunos que isso a taxa oscila demais para dizer alguma coisa.
const MINIMO = 10;

/**
 * Aprovacao, media e numero de alunos de cada disciplina, por codigo. Vem do
 * mesmo calculo do ranking, num pedido so para o site inteiro.
 */
export default function useEstatisticas() {
  const [estatisticas, setEstatisticas] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    api
      .get(`/ranking?desde=${DESDE}&minimo=${MINIMO}`)
      .then((resposta) => {
        if (!ativo) return;
        const mapa = {};
        resposta.data.disciplinas.forEach((d) => {
          mapa[d.codigo] = {
            alunos: d.alunos,
            aprovados: d.aprovados,
            reprovados: d.reprovados,
            aprovacao: d.alunos > 0 ? d.aprovados / d.alunos : null,
            reprovacao: d.reprovacao,
            media: d.media,
            semestres: d.semestres,
          };
        });
        setEstatisticas(mapa);
      })
      // Os numeros sao um extra: sem eles a grade continua servindo.
      .catch(() => ativo && setErro(true));

    return () => {
      ativo = false;
    };
  }, []);

  return { estatisticas: estatisticas || {}, carregando: estatisticas === null && !erro, erro };
}
