import departmentByCode from "./departmentByCode";

// As tres telas mostram a mesma grade recortada de jeitos diferentes. Cada
// funcao devolve o mesmo formato -- [{ titulo, disciplinas }] -- para que a
// lista em si seja um componente so.

function todasAsDisciplinas(grade) {
  const todas = [];
  grade.ecomp.forEach((periodo) => {
    periodo.disciplinas.forEach((disciplina) => todas.push(disciplina));
  });
  return todas;
}

export function porPeriodo(grade) {
  return grade.ecomp.map((periodo, indice) => ({
    titulo: indice + 1 < 11 ? `${indice + 1}º Período` : "Optativas",
    disciplinas: periodo.disciplinas,
  }));
}

export function porNome(grade) {
  const todas = todasAsDisciplinas(grade).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );
  return [{ titulo: "Nome", disciplinas: todas }];
}

export function porDepartamento(grade) {
  // Agrupa pelo departamento, nao pelo prefixo do codigo: DEA e HID sao o
  // mesmo departamento. Prefixo sem nome conhecido fica separado, para nao
  // juntar coisas diferentes sob o rotulo generico.
  const grupos = new Map();

  todasAsDisciplinas(grade)
    .sort((a, b) => a.codigo.localeCompare(b.codigo))
    .forEach((disciplina) => {
      const nome = departmentByCode(disciplina.codigo);
      const chave = nome === "Departamento" ? disciplina.codigo.substring(0, 3) : nome;
      if (!grupos.has(chave)) grupos.set(chave, { titulo: nome, disciplinas: [] });
      grupos.get(chave).disciplinas.push(disciplina);
    });

  return Array.from(grupos.values());
}
