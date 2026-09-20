import React, { useState, Suspense, lazy } from "react";

import MenuBar from "../components/MenuBar";
import ListaDisciplinas from "../components/ListaDisciplinas";
import FiltroCurriculo from "../components/FiltroCurriculo";

import useGrade from "../hooks/useGrade";
import {
  porPeriodo,
  porDepartamento,
  porNome,
  filtraPorCurriculo,
} from "../utils/agrupaDisciplinas";

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
  // Comeca no curriculo em vigor: e o de quem esta entrando agora.
  const [curriculo, setCurriculo] = useState("2022");

  const { grade, erro, carregando } = useGrade();

  const selecionar = (nome, codigo) => {
    setDisciplinaSelecionada(nome);
    setCodigoSelecionado(codigo);
  };

  // Fechar limpa a selecao. Enquanto o grafico guardava esse estado por conta
  // propria, clicar de novo na mesma disciplina nao reabria nada: o codigo
  // selecionado nao mudava, e nada disparava.
  const fechar = () => {
    setDisciplinaSelecionada(undefined);
    setCodigoSelecionado(undefined);
  };

  const grupos = grade
    ? AGRUPAMENTOS[modo](filtraPorCurriculo(grade, curriculo))
    : [];

  return (
    <div className="main-container">
      <MenuBar />
      <div className="conteudo">
          <div className="coluna-lista">
            <FiltroCurriculo valor={curriculo} aoMudar={setCurriculo} />
            <ListaDisciplinas
              grupos={grupos}
              aoSelecionar={selecionar}
              carregando={carregando}
              erro={erro}
            />
          </div>
          <Suspense fallback={<div className="coluna-grafico" />}>
            <SubjectChart
              selectedSubject={disciplinaSelecionada}
              selectedSubjectCode={codigoSelecionado}
              aoFechar={fechar}
            />
          </Suspense>
      </div>
    </div>
  );
}

export default Grade;
