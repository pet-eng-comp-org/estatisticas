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

// Paleta conferida com o validador de contraste e de visao de cores: as cores
// adjacentes se distinguem tambem em deuteranopia, protanopia e tritanopia.
const COR_APROVADO = "#2a78d6";
const COR_REPROVADO_NOTA = "#eb6834";
const COR_REPROVADO_FALTA = "#4a3aa7";
const COR_MEDIA_CT = "#008300";
const COR_MEDIA_DI = "#e87ba4";

const umaCasa = (n) => (n === null || Number.isNaN(n) ? null : Number(n.toFixed(1)));

const SubjectChart = ({ selectedSubject, selectedSubjectCode }) => {
  const [dados, setDados] = useState([]);
  const [estado, setEstado] = useState("vazio"); // vazio | carregando | pronto | sem-dados | erro
  const [departamento, setDepartamento] = useState("");
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [fechado, setFechado] = useState(false);

  useEffect(() => {
    if (!selectedSubjectCode) {
      setEstado("vazio");
      return;
    }

    let ativo = true;
    setEstado("carregando");
    setFechado(false);
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
            aprovados: umaCasa(s.porcentagem_aprovados * 100),
            reprovadosNota: umaCasa(s.porcentagem_reprovados_por_nota * 100),
            reprovadosFalta: umaCasa(s.porcentagem_reprovados_por_frequencia * 100),
            mediaCt: umaCasa(s.media),
            mediaDi: Number.isNaN(s.media_di) ? null : umaCasa(s.media_di),
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

  if (estado === "vazio" || fechado) {
    return <div className="col-lg-7" />;
  }

  // As duas medias descrevem populacoes diferentes: a do Centro Tecnologico
  // inclui todos os cursos que cursaram a turma; a do DI, so Engenharia e
  // Ciencia da Computacao. Nos dados de 2022 em diante o relatorio so traz
  // alunos de Engenharia de Computacao, entao as duas coincidem e as linhas
  // se sobrepoem -- sem esta nota, parece defeito.
  const temRecente = dados.some((d) => d.periodo >= "2022");
  const coincidem =
    temRecente &&
    dados
      .filter((d) => d.periodo >= "2022" && d.mediaCt !== null && d.mediaDi !== null)
      .every((d) => Math.abs(d.mediaCt - d.mediaDi) < 0.05);

  return (
    <div className="col-lg-7 grafico-coluna">
      <div className="chart-container">
        <div className="d-flex title-subtitle">
          <div className="pb-2">
            <h2 className="chart-title">
              {selectedSubject} <span className="chart-codigo">{selectedSubjectCode}</span>
            </h2>
            <p className="chart-departamento">{departamento}</p>
          </div>
          <div className="ml-auto x-icon">
            <button
              type="button"
              className="botao-fechar"
              aria-label="Fechar gráfico"
              onClick={() => setFechado(true)}
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
            Não foi possível carregar os dados desta disciplina. Tente de novo em
            instantes.
          </p>
        )}

        {estado === "sem-dados" && (
          <p className="grafico-aviso" role="status">
            Ainda não há notas registradas para esta disciplina.
          </p>
        )}

        {estado === "pronto" && (
          <>
            <h3 className="grafico-subtitulo">Resultado da turma (% de alunos)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e6e6e3" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} width={48} />
                <Tooltip formatter={(v, nome) => [`${v}%`, nome]} />
                <Legend />
                <Bar dataKey="aprovados" name="Aprovados" stackId="r" fill={COR_APROVADO} />
                <Bar dataKey="reprovadosNota" name="Reprovados por nota" stackId="r" fill={COR_REPROVADO_NOTA} />
                <Bar dataKey="reprovadosFalta" name="Reprovados por falta" stackId="r" fill={COR_REPROVADO_FALTA} />
                {dados.length > 12 && <Brush dataKey="periodo" height={18} stroke="#adadad" />}
              </ComposedChart>
            </ResponsiveContainer>

            <h3 className="grafico-subtitulo">Média das notas (0 a 10)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e6e6e3" vertical={false} />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={48} />
                <Tooltip />
                <Legend />
                <Line dataKey="mediaCt" name="Média do CT" stroke={COR_MEDIA_CT} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                <Line dataKey="mediaDi" name="Média do DI" stroke={COR_MEDIA_DI} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>

            {coincidem && (
              <p className="grafico-nota">
                A partir de 2022 as duas médias coincidem: o relatório da
                coordenação passou a trazer apenas alunos de Engenharia de
                Computação, então as duas linhas descrevem o mesmo grupo.
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
                      <th scope="col">Média CT</th>
                      <th scope="col">Média DI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.map((d) => (
                      <tr key={d.periodo}>
                        <th scope="row">{d.periodo}</th>
                        <td>{d.alunos}</td>
                        <td>{d.aprovados}%</td>
                        <td>{d.reprovadosNota}%</td>
                        <td>{d.reprovadosFalta}%</td>
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
