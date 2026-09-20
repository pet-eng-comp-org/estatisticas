import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from "recharts";
import { IoIosCloseCircleOutline } from "react-icons/io";

import filterDataBySemester from "../../utils/filterDataBySemester";
import departmentByCode from "../../utils/departmentByCode";

import api from "../../services/api";

import "./styles.css";

// Paleta conferida no validador de contraste e de visao de cores: as cores
// adjacentes se distinguem tambem em deuteranopia, protanopia e tritanopia.
// O tijolo e a mesma cor da barra da lista -- reprovacao tem uma cor so no
// site inteiro.
//
// As duas medias nao sao categorias independentes: sao a mesma medida para
// dois grupos. Por isso uma e linha de referencia, em tinta neutra, e a outra
// e a do grupo que interessa ao leitor, na cor do site -- distinguidas
// tambem pelo tracejado, nao so pela cor.
const COR_APROVADO = "#2a78d6";
const COR_REPROVADO_NOTA = "#B03A1F";
const COR_REPROVADO_FALTA = "#4a3aa7";
const COR_MEDIA_CT = "#5A5852";
const COR_MEDIA_DI = "#B03A1F";

const umaCasa = (n) => (n === null || Number.isNaN(n) ? null : Number(n.toFixed(1)));

const SubjectChart = ({ selectedSubject, selectedSubjectCode, aoFechar }) => {
  const [dados, setDados] = useState([]);
  const [estado, setEstado] = useState("vazio"); // vazio | carregando | pronto | sem-dados | erro
  const [departamento, setDepartamento] = useState("");
  const [mostrarTabela, setMostrarTabela] = useState(false);

  useEffect(() => {
    if (!selectedSubjectCode) {
      setEstado("vazio");
      return;
    }

    let ativo = true;
    setEstado("carregando");
    setMostrarTabela(false);

    api
      .get(`/items/${selectedSubjectCode}`)
      .then((resposta) => {
        if (!ativo) return;

        const porSemestre = filterDataBySemester(resposta)
          .filter((s) => s.periodo && s.alunos > 0)
          .map((s) => ({
            periodo: s.periodo,
            alunos: s.alunos,
            // Sem arredondar: as tres somam exatamente 100. Arredondadas
            // antes da soma, davam 100,1 e estouravam o topo do eixo.
            aprovados: s.porcentagem_aprovados * 100,
            reprovadosNota: s.porcentagem_reprovados_por_nota * 100,
            reprovadosFalta: s.porcentagem_reprovados_por_frequencia * 100,
            mediaCt: umaCasa(s.media),
            mediaDi: umaCasa(s.media_di),
          }))
          .sort((a, b) => a.periodo.localeCompare(b.periodo));

        setDados(porSemestre);
        setDepartamento(departmentByCode(selectedSubjectCode));
        setEstado(porSemestre.length > 0 ? "pronto" : "sem-dados");
      })
      .catch(() => {
        if (ativo) setEstado("erro");
      });

    return () => {
      ativo = false;
    };
  }, [selectedSubjectCode]);

  if (estado === "vazio") {
    return <div className="coluna-grafico" />;
  }

  // `every` num conjunto vazio e verdadeiro: sem nenhum par de pontos
  // comparavel a nota apareceria dizendo que as medias coincidem sem que
  // nada tenha sido comparado.
  // As duas medias descrevem populacoes diferentes: a do Centro Tecnologico
  // inclui todos os cursos que cursaram a turma; a do DI, so Engenharia e
  // Ciencia da Computacao. Nos dados de 2022 em diante o relatorio so traz
  // alunos de Engenharia de Computacao, entao as duas coincidem e as linhas
  // se sobrepoem -- sem esta nota, parece defeito.
  const comparaveis = dados.filter(
    (d) => d.periodo >= "2022" && d.mediaCt !== null && d.mediaDi !== null
  );
  const coincidem =
    comparaveis.length > 0 &&
    comparaveis.every((d) => Math.abs(d.mediaCt - d.mediaDi) < 0.05);

  return (
    <div className="coluna-grafico grafico-coluna">
      <div className="chart-container">
        <div className="title-subtitle">
          <div>
            <h2 className="chart-title">
              {selectedSubject} <span className="chart-codigo">{selectedSubjectCode}</span>
            </h2>
            <p className="chart-departamento">{departamento}</p>
          </div>
          <div className="x-icon">
            <button
              type="button"
              className="botao-fechar"
              aria-label="Fechar gráfico"
              onClick={aoFechar}
            >
              <IoIosCloseCircleOutline color="gray" size={36} />
            </button>
          </div>
        </div>

        {estado === "carregando" && (
          <p className="grafico-aviso" aria-live="polite">Carregando dados da disciplina…</p>
        )}

        {estado === "erro" && (
          <p className="grafico-aviso grafico-erro" role="alert">
            Os dados desta disciplina não carregaram. Recarregue a página para
            tentar de novo.
          </p>
        )}

        {estado === "sem-dados" && (
          <p className="grafico-aviso" role="status">
            Esta disciplina ainda não tem notas registradas. Escolha outra na
            lista ao lado.
          </p>
        )}

        {estado === "pronto" && (
          <>
            <h3 className="grafico-subtitulo">Resultado da turma (% de alunos)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke="#E4E1D8" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#5A5852" }} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: "#5A5852" }}
                  width={48}
                />
                <Tooltip formatter={(v, nome) => [`${v.toFixed(1)}%`, nome]} />
                <Legend />
                <Bar dataKey="aprovados" name="Aprovados" stackId="r" fill={COR_APROVADO} stroke="#FAF9F6" strokeWidth={1} />
                <Bar dataKey="reprovadosNota" name="Reprovados por nota" stackId="r" fill={COR_REPROVADO_NOTA} stroke="#FAF9F6" strokeWidth={1} />
                <Bar dataKey="reprovadosFalta" name="Reprovados por falta" stackId="r" fill={COR_REPROVADO_FALTA} stroke="#FAF9F6" strokeWidth={1} />
                {dados.length > 12 && <Brush dataKey="periodo" height={18} stroke="#B9B4A6" />}
              </ComposedChart>
            </ResponsiveContainer>

            <h3 className="grafico-subtitulo">Média das notas (0 a 10)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E4E1D8" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: "#5A5852" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#5A5852" }} width={48} />
                <Tooltip />
                <Legend />
                <Line dataKey="mediaCt" name="Todos os cursos" stroke={COR_MEDIA_CT} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                {/* Tracejada de proposito: de 2022 em diante as duas medias
                    coincidem, e uma linha continua sobre a outra sumiria. */}
                <Line
                  dataKey="mediaDi"
                  name="Alunos de computação"
                  stroke={COR_MEDIA_DI}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>

            {coincidem && (
              <p className="grafico-nota">
                As duas linhas coincidem de 2022 em diante: desde então o
                relatório da coordenação traz apenas alunos de Engenharia de
                Computação, então os dois grupos são o mesmo.
              </p>
            )}

            <button
              type="button"
              className="botao-tabela"
              aria-expanded={mostrarTabela}
              onClick={() => setMostrarTabela((v) => !v)}
            >
              {mostrarTabela ? "Ocultar tabela" : "Ver os números em tabela"}
            </button>

            {mostrarTabela && (
              <div className="tabela-rolagem">
                <table className="tabela-dados">
                  <caption className="sr-only">
                    Resultados de {selectedSubject} por semestre
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Semestre</th>
                      <th scope="col">Alunos</th>
                      <th scope="col">Aprovados</th>
                      <th scope="col">Rep. nota</th>
                      <th scope="col">Rep. falta</th>
                      <th scope="col">Todos</th>
                      <th scope="col">Computação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((d) => (
                      <tr key={d.periodo}>
                        <th scope="row">{d.periodo}</th>
                        <td>{d.alunos}</td>
                        <td>{d.aprovados.toFixed(1)}%</td>
                        <td>{d.reprovadosNota.toFixed(1)}%</td>
                        <td>{d.reprovadosFalta.toFixed(1)}%</td>
                        <td>{d.mediaCt ?? "—"}</td>
                        <td>{d.mediaDi ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubjectChart;
