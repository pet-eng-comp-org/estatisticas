/**
 * Junta os grupos que a API devolve (um por professor) num ponto por semestre.
 *
 * A versao anterior guardava os semestres num vetor e os totais em outro, e os
 * dois saiam de sincronia quando um semestre era descartado por nao ter
 * alunos: o indice achado no primeiro vetor passava a apontar para o semestre
 * errado no segundo. O remendo era pular quando o destino fosse undefined, o
 * que silenciosamente somava no lugar errado. Um mapa por semestre resolve na
 * origem.
 */
export default function filterDataBySemester(response) {
  const porSemestre = new Map();

  response.data.forEach((turma) => {
    const total =
      turma.aprovados + turma.reprovados_por_nota + turma.reprovados_por_frequencia;
    if (total <= 0) return;

    if (!porSemestre.has(turma.periodo)) {
      porSemestre.set(turma.periodo, {
        periodo: turma.periodo,
        aprovados: 0,
        reprovados_por_nota: 0,
        reprovados_por_frequencia: 0,
        alunos: 0,
        alunosxmedia: 0,
        comNota: 0,
        alunos_di: 0,
        alunosxmedia_di: 0,
        comNota_di: 0,
        media: null,
        media_di: null,
      });
    }

    const semestre = porSemestre.get(turma.periodo);
    semestre.aprovados += turma.aprovados;
    semestre.reprovados_por_nota += turma.reprovados_por_nota;
    semestre.reprovados_por_frequencia += turma.reprovados_por_frequencia;
    semestre.alunos += total;
    semestre.alunos_di += turma.alunos_di;

    // A media de cada grupo vale pelos alunos que tiveram nota lancada, nao
    // pelo total: reprovado por falta costuma vir sem nota e entraria como
    // zero. Grupo sem nota nenhuma chega com media null e fica de fora.
    if (turma.media !== null && turma.alunos_com_nota > 0) {
      semestre.alunosxmedia += turma.alunos_com_nota * turma.media;
      semestre.comNota += turma.alunos_com_nota;
    }
    if (turma.media_di !== null && turma.alunos_com_nota_di > 0) {
      semestre.alunosxmedia_di += turma.alunos_com_nota_di * turma.media_di;
      semestre.comNota_di += turma.alunos_com_nota_di;
    }
  });

  return Array.from(porSemestre.values()).map((semestre) => {
    // Sem ninguem com nota lancada nao ha media: null vira ausencia de ponto
    // no grafico, enquanto zero seria lido como media zero.
    semestre.media_di =
      semestre.comNota_di > 0 ? semestre.alunosxmedia_di / semestre.comNota_di : null;
    semestre.media =
      semestre.comNota > 0 ? semestre.alunosxmedia / semestre.comNota : null;
    semestre.porcentagem_aprovados = semestre.aprovados / semestre.alunos;
    semestre.porcentagem_reprovados_por_nota =
      semestre.reprovados_por_nota / semestre.alunos;
    semestre.porcentagem_reprovados_por_frequencia =
      semestre.reprovados_por_frequencia / semestre.alunos;
    return semestre;
  });
}
