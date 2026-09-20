import React, { useState, Suspense, lazy } from "react";

import MenuBar from "../components/MenuBar";
import ListaDisciplinas from "../components/ListaDisciplinas";

import useGrade from "../hooks/useGrade";
import { porPeriodo, porDepartamento, porNome } from "../utils/agrupaDisciplinas";

import "./styles/App.style.css";

// O grafico carrega a biblioteca de desenho junto, e quem so percorre a lista
// nao precisa dela. Sob demanda, esse peso so chega a quem abre uma
// disciplina.
const SubjectChart = lazy(() => import("../components/SubjectChart"));

// As tres telas eram arquivos separados e identicos, cada uma importando um
// Card proprio. O que muda entre elas e so como a grade e agrupada.
const AGRUPAMENTOS = {
  periodo: porPeriodo,
  departamento: porDepartamento,
  nome: porNome,
};

function Grade({ modo }) {
  const [codigoSelecionado, setCodigoSelecionado] = useState();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState();

  const { grade, erro, carregando } = useGrade();

  const selecionar = (nome, codigo) => {
    setDisciplinaSelecionada(nome);
    setCodigoSelecionado(codigo);
  };

  const grupos = grade ? AGRUPAMENTOS[modo](grade) : [];

  return (
    <div className="main-container">
      <MenuBar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-5">
            <ListaDisciplinas
              grupos={grupos}
              aoSelecionar={selecionar}
              carregando={carregando}
              erro={erro}
            />
          </div>
          <Suspense fallback={<div className="col-lg-7" />}>
            <SubjectChart
              selectedSubject={disciplinaSelecionada}
              selectedSubjectCode={codigoSelecionado}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default Grade;
