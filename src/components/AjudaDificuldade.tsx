import { DESDE } from "@/lib/formato";
import { PESOS } from "@/lib/notas/dificuldade";
import Ajuda from "./Ajuda";

const porcento = (peso: number) => `${Math.round(peso * 100)}%`;

/** É a única explicação da conta no site; os pesos vêm da própria conta. */
export default function AjudaDificuldade() {
  return (
    <Ajuda pergunta="O que é a dificuldade?">
      <span className="block">
        Vai de 1 a 5 e compara as disciplinas do curso entre si: quanto mais perto de 5, mais difícil em relação às
        outras.
      </span>
      <span className="mt-1.5 block">
        A conta usa as turmas desde {DESDE} e três medidas: a reprovação (peso {porcento(PESOS.reprovacao)}), o quanto a
        média das notas fica abaixo de 10 ({porcento(PESOS.notaBaixa)}) e o desvio padrão das notas (
        {porcento(PESOS.desvio)}), que mostra se a turma se divide entre quem vai muito bem e quem vai muito mal.
        Disciplinas com poucos alunos ficam perto do meio da escala até terem dados suficientes.
      </span>
    </Ajuda>
  );
}
