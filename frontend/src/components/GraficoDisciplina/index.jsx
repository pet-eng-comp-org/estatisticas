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

import filterDataBySemester from "../../utils/filterDataBySemester";
import api from "../../services/api";

import "./style.css";

// Cores do mockup, conferidas no validador de paleta (luminosidade, separacao
// em deuteranopia, protanopia e tritanopia): verde para aprovado, rosa escuro
// para reprovado por nota e rosa vivo para reprovado por falta. O contraste
// do verde e do rosa vivo contra o branco fica abaixo de 3:1, e por isso o
// grafico sempre tem legenda e a tabela com os numeros.
const COR_APROVADO = "#43AB4D";
const COR_REPROVADO_NOTA = "#BF2D5D";
const COR_REPROVADO_FALTA = "#FF6B9D";

// As duas medias sao a mesma medida para dois grupos: uma fica em tinta
// neutra, como referencia, e a outra na cor do site, tracejada.
const COR_MEDIA_TODOS = "#7A7074";
const COR_MEDIA_COMPUTACAO = "#800C33";

const EIXO = { fontSize: 12, fill: "#7A7074", fontFamily: "Inter, sans-serif" };
const GRADE = "#F1E7EB";

const umaCasa = (n) => (n === null || Number.isNaN(n) ? null : Number(n.toFixed(1)));
const porcento = (v) => `${v.toFixed(1).replace(".", ",")}%`;

const DicaResultado = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const linha = payload[0].payload;
  return (
    <div className="grafico-dica">
      <strong>{label}</strong>
      <span className="grafico-dica-alunos">{linha.alunos} alunos</span>
      {payload.map((p) => (
        <span key={p.dataKey} className="grafico-dica-linha">
          <i style={{ background: p.color }} aria-hidden="true" />
          {p.name}
          <b>{porcento(p.value)}</b>
        </span>
      ))}
    </div>
  );
};

const DicaMedia = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="grafico-dica">
      <strong>{label}</strong>
      {payload.map((p) => (
        <span key={p.dataKey} className="grafico-dica-linha">
          <i style={{ background: p.color }} aria-hidden="true" />
          {p.name}
          <b>{p.value === null ? "—" : String(p.value).replace(".", ",")}</b>
        </span>
      ))}
    </div>
  );
};

const GraficoDisciplina = ({ nome, codigo }) => {
  const [dados, setDados] = useState([]);
  const [estado, setEstado] = useState("carregando"); // carregando | pronto | sem-dados | erro
  const [mostrarTabela, setMostrarTabela] = useState(false);

  useEffect(() => {
    let ativo = true;
    setEstado("carregando");
    setMostrarTabela(false);

    api
      .get(`/items/${codigo}`)
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
            mediaTodos: umaCasa(s.media),
            mediaComputacao: umaCasa(s.media_di),
          }))
          .sort((a, b) => a.periodo.localeCompare(b.periodo));

        setDados(porSemestre);
        setEstado(porSemestre.length > 0 ? "pronto" : "sem-dados");
      })
      .catch(() => ativo && setEstado("erro"));

    return () => {
      ativo = false;
    };
  }, [codigo]);

  if (estado === "carregando") {
    return <p className="aviso" aria-live="polite">Carregando as turmas…</p>;
  }
  if (estado === "erro") {
    return (
      <p className="aviso aviso-erro" role="alert">
        Os dados desta disciplina não carregaram. Recarregue a página para
        tentar de novo.
      </p>
    );
  }
  if (estado === "sem-dados") {
    return (
      <p className="aviso" role="status">
        Esta disciplina ainda não tem notas registradas.
      </p>
    );
  }

  // As duas medias descrevem populacoes diferentes: a primeira inclui todos
  // os cursos que cursaram a turma; a segunda, so Engenharia e Ciencia da
  // Computacao. De 2022 em diante o relatorio so traz alunos de Engenharia de
  // Computacao, entao as duas coincidem -- sem esta nota, parece defeito.
  // `every` num conjunto vazio e verdadeiro, dai a checagem de tamanho.
  const comparaveis = dados.filter(
    (d) => d.periodo >= "2022" && d.mediaTodos !== null && d.mediaComputacao !== null
  );
  const coincidem =
    comparaveis.length > 0 &&
    comparaveis.every((d) => Math.abs(d.mediaTodos - d.mediaComputacao) < 0.05);

  return (
    <div className="grafico">
      <h3 className="grafico-titulo">Resultado das turmas por semestre</h3>
      <p className="grafico-legenda-eixo">Porcentagem dos alunos de cada semestre</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="periodo" tick={EIXO} tickLine={false} axisLine={{ stroke: "#E9DDE2" }} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" tick={EIXO} tickLine={false} axisLine={false} width={46} />
          <Tooltip content={<DicaResultado />} cursor={{ fill: "rgba(191, 45, 93, 0.06)" }} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13, fontWeight: 700, color: "#7A7074" }} />
          <Bar dataKey="aprovados" name="Aprovados" stackId="r" fill={COR_APROVADO} stroke="#fff" strokeWidth={2} />
          <Bar dataKey="reprovadosNota" name="Reprovados por nota" stackId="r" fill={COR_REPROVADO_NOTA} stroke="#fff" strokeWidth={2} />
          <Bar dataKey="reprovadosFalta" name="Reprovados por falta" stackId="r" fill={COR_REPROVADO_FALTA} stroke="#fff" strokeWidth={2} radius={[4, 4, 0, 0]} />
          {dados.length > 14 && <Brush dataKey="periodo" height={20} stroke="#BF2D5D" travellerWidth={8} />}
        </ComposedChart>
      </ResponsiveContainer>

      <h3 className="grafico-titulo grafico-titulo-segundo">Média das notas</h3>
      <p className="grafico-legenda-eixo">Nota final de 0 a 10, só de quem teve nota lançada</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="periodo" tick={EIXO} tickLine={false} axisLine={{ stroke: "#E9DDE2" }} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={EIXO} tickLine={false} axisLine={false} width={46} />
          <Tooltip content={<DicaMedia />} cursor={{ stroke: "#E9DDE2", strokeWidth: 2 }} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 13, fontWeight: 700, color: "#7A7074" }} />
          <Line dataKey="mediaTodos" name="Todos os cursos" stroke={COR_MEDIA_TODOS} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} connectNulls />
          {/* Tracejada de proposito: de 2022 em diante as duas medias
              coincidem, e uma linha continua sobre a outra sumiria. */}
          <Line
            dataKey="mediaComputacao"
            name="Alunos de computação"
            stroke={COR_MEDIA_COMPUTACAO}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {coincidem && (
        <p className="grafico-nota">
          As duas linhas coincidem de 2022 em diante: desde então o relatório da
          coordenação traz apenas alunos de Engenharia de Computação, então os
          dois grupos são o mesmo.
        </p>
      )}

      <button
        type="button"
        className="pilula grafico-botao"
        aria-expanded={mostrarTabela}
        onClick={() => setMostrarTabela((v) => !v)}
      >
        {mostrarTabela ? "Ocultar tabela" : "Ver os números em tabela"}
      </button>

      {mostrarTabela && (
        <div className="grafico-tabela-rolagem">
          <table className="grafico-tabela">
            <caption className="sr-only">Resultados de {nome} por semestre</caption>
            <thead>
              <tr>
                <th scope="col">Semestre</th>
                <th scope="col">Alunos</th>
                <th scope="col">Aprovados</th>
                <th scope="col">Rep. nota</th>
                <th scope="col">Rep. falta</th>
                <th scope="col">Média (todos)</th>
                <th scope="col">Média (computação)</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d) => (
                <tr key={d.periodo}>
                  <th scope="row">{d.periodo}</th>
                  <td>{d.alunos}</td>
                  <td>{porcento(d.aprovados)}</td>
                  <td>{porcento(d.reprovadosNota)}</td>
                  <td>{porcento(d.reprovadosFalta)}</td>
                  <td>{d.mediaTodos === null ? "—" : String(d.mediaTodos).replace(".", ",")}</td>
                  <td>{d.mediaComputacao === null ? "—" : String(d.mediaComputacao).replace(".", ",")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GraficoDisciplina;
