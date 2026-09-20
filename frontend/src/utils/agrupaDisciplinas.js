import departmentByCode from "./departmentByCode";

/** Sem acento e em minusculas: "calculo" encontra "Cálculo". */
function chave(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function filtraPorTexto(grupos, texto) {
  const busca = chave(texto).trim();
  if (!busca) return grupos;

  return grupos
    .map((grupo) => ({
      ...grupo,
      disciplinas: grupo.disciplinas.filter(
        (d) => chave(d.nome).includes(busca) || chave(d.codigo).includes(busca)
      ),
    }))
    .filter((grupo) => grupo.disciplinas.length > 0);
}

// As tres telas mostram a mesma grade recortada de jeitos diferentes. Cada
// funcao devolve o mesmo formato -- [{ titulo, disciplinas }] -- para que a
// lista em si seja um componente so.

/**
 * Recorta a grade por geracao de curriculo. As disciplinas do curriculo 2022
 * vem marcadas pela API; as demais sao do anterior.
 */
export function filtraPorCurriculo(grade, curriculo) {
  if (curriculo === "todos") return grade;

  const querNovo = curriculo === "2022";
  const recorta = (periodos) =>
    periodos.map((periodo) => ({
      ...periodo,
      disciplinas: periodo.disciplinas.filter(
        (d) => (d.curriculo === 2022) === querNovo
      ),
    }));

  return { ecomp: recorta(grade.ecomp), ccomp: recorta(grade.ccomp) };
}

function todasAsDisciplinas(grade) {
  const todas = [];
  grade.ecomp.forEach((periodo) => {
    periodo.disciplinas.forEach((disciplina) => todas.push(disciplina));
  });
  return todas;
}

export function porPeriodo(grade) {
  return grade.ecomp
    .map((periodo, indice) => ({
      titulo: indice + 1 < 11 ? `${indice + 1}º Período` : "Optativas",
      disciplinas: periodo.disciplinas,
    }))
    .filter((grupo) => grupo.disciplinas.length > 0);
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
