import React, { useState, Suspense, lazy } from "react";
import { useNavigate, useParams } from "react-router-dom";

import MenuBar from "../components/MenuBar";
import ListaDisciplinas from "../components/ListaDisciplinas";
import FiltroCurriculo from "../components/FiltroCurriculo";
import CampoBusca from "../components/CampoBusca";
import BoasVindas from "../components/BoasVindas";

import useGrade from "../hooks/useGrade";
import useTaxas from "../hooks/useTaxas";
import {
  porPeriodo,
  porDepartamento,
  porNome,
  filtraPorCurriculo,
  filtraPorTexto,
} from "../utils/agrupaDisciplinas";

import "./styles/App.style.css";

// O grafico carrega a biblioteca de desenho junto, e quem so percorre a lista
// nao precisa dela.
const SubjectChart = lazy(() => import("../components/SubjectChart"));

// As tres telas eram arquivos separados e identicos, cada uma importando um
// Card proprio. O que muda entre elas e so como a grade e agrupada.
const AGRUPAMENTOS = {
  periodo: porPeriodo,
  departamento: porDepartamento,
  nome: porNome,
};

// Cada tela tem seu caminho; a disciplina aberta entra como sufixo, para que o
// endereco possa ser copiado e aberto direto.
const RAIZ = {
  periodo: "",
  departamento: "/departamentos",
  nome: "/nome",
};

function Grade({ modo }) {
  const { codigo } = useParams();
  const navegar = useNavigate();

  const [curriculo, setCurriculo] = useState("2022");
  const [busca, setBusca] = useState("");

  const { grade, erro, carregando } = useGrade();
  const taxas = useTaxas();

  const selecionar = (nome, codigoClicado) => {
    navegar(`${RAIZ[modo]}/disciplina/${codigoClicado}`);
  };

  const fechar = () => navegar(RAIZ[modo] || "/");

  const daGeracao = grade ? filtraPorCurriculo(grade, curriculo) : null;
  const todos = daGeracao ? AGRUPAMENTOS[modo](daGeracao) : [];
  const grupos = filtraPorTexto(todos, busca);

  const conta = (lista) =>
    lista.reduce((soma, grupo) => soma + grupo.disciplinas.length, 0);

  // O nome vem da propria grade: assim o endereco aberto direto mostra o
  // titulo certo, sem depender de quem clicou.
  const aberta = codigo
    ? todos
        .flatMap((grupo) => grupo.disciplinas)
        .find((d) => d.codigo === codigo)
    : null;

  return (
    <div className="main-container">
      <MenuBar />
      <main className="conteudo">
        <div className="coluna-lista">
          <FiltroCurriculo valor={curriculo} aoMudar={setCurriculo} />
          <CampoBusca
            valor={busca}
            aoMudar={setBusca}
            encontradas={conta(grupos)}
            total={conta(todos)}
          />
          <ListaDisciplinas
            grupos={grupos}
            aoSelecionar={selecionar}
            carregando={carregando}
            erro={erro}
            // O selo so distingue quando as duas geracoes estao na mesma lista.
            marcarCurriculo={curriculo === "todos"}
            taxas={taxas}
          />
        </div>
        {codigo ? (
          <Suspense fallback={<div className="coluna-grafico" />}>
            <SubjectChart
              selectedSubject={aberta ? aberta.nome : codigo}
              selectedSubjectCode={codigo}
              aoFechar={fechar}
            />
          </Suspense>
        ) : (
          <BoasVindas />
        )}
      </main>
    </div>
  );
}

export default Grade;
