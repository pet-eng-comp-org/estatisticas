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
        alunos_di: 0,
        alunosxmedia_di: 0,
        media: 0,
        media_di: 0,
      });
    }

    const semestre = porSemestre.get(turma.periodo);
    semestre.aprovados += turma.aprovados;
    semestre.reprovados_por_nota += turma.reprovados_por_nota;
    semestre.reprovados_por_frequencia += turma.reprovados_por_frequencia;
    semestre.alunos += total;
    semestre.alunosxmedia += total * turma.media;
    semestre.alunos_di += turma.alunos_di;
    semestre.alunosxmedia_di += turma.alunos_di * turma.media_di;
  });

  return Array.from(porSemestre.values()).map((semestre) => {
    // Disciplina sem nenhum aluno do DI naquele semestre: a media do DI nao
    // existe, e NaN e o que sinaliza "sem ponto" para o grafico.
    semestre.media_di =
      semestre.alunos_di > 0 ? semestre.alunosxmedia_di / semestre.alunos_di : NaN;
    semestre.media = semestre.alunosxmedia / semestre.alunos;
    semestre.porcentagem_aprovados = semestre.aprovados / semestre.alunos;
    semestre.porcentagem_reprovados_por_nota =
      semestre.reprovados_por_nota / semestre.alunos;
    semestre.porcentagem_reprovados_por_frequencia =
      semestre.reprovados_por_frequencia / semestre.alunos;
    return semestre;
  });
}
