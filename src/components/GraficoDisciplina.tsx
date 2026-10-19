"use client";

import { useState } from "react";
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import type { Semestre } from "@/lib/notas/agregacao";

// Cores do mockup, conferidas no validador de paleta (luminosidade e
// separação em deuteranopia, protanopia e tritanopia): verde para aprovado,
// rosa escuro para reprovado por nota, rosa vivo para reprovado por falta. O
// contraste do verde e do rosa vivo contra o branco fica abaixo de 3:1, e por
// isso o gráfico sempre tem legenda e a tabela com os números.
const COR = { aprovados: "#43AB4D", nota: "#BF2D5D", falta: "#FF6B9D", todos: "#6E676A", computacao: "#800C33" };
const EIXO = { fontSize: 12, fill: "#6E676A" };
const GRADE = "#F1E7EB";

const umaCasa = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
const porcento = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;
const virgula = (v: number | null) => (v === null ? "—" : v.toFixed(1).replace(".", ","));

type Dica = TooltipContentProps<ValueType, NameType>;
type Itens = NonNullable<Dica["payload"]>;

function Caixa({
  titulo,
  extra,
  itens,
  formato,
}: {
  titulo?: string | number;
  extra?: string;
  itens: Itens;
  formato: (v: number | null) => string;
}) {
  return (
    <div className="flex min-w-[190px] flex-col gap-1 rounded-xl border border-borda bg-white px-3.5 py-3 text-[13px] leading-[17px] text-cinza shadow-[0_6px_18px_rgba(128,12,51,0.1)]">
      <strong className="text-sm text-vinho">{titulo}</strong>
      {extra && <span className="mb-1">{extra}</span>}
      {itens.map((p) => (
        <span key={String(p.dataKey)} className="flex items-center gap-2">
          <i aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
          {p.name}
          <b className="ml-auto text-vinho">{formato(typeof p.value === "number" ? p.value : null)}</b>
        </span>
      ))}
    </div>
  );
}

const DicaResultado = ({ active, payload, label }: Dica) =>
  active && payload?.length ? (
    <Caixa
      titulo={label}
      extra={`${payload[0].payload?.alunos} alunos`}
      itens={payload}
      formato={(v) => porcento(v ?? 0)}
    />
  ) : null;

// O texto da legenda fica na cor do texto; a cor da série vai só no ícone.
const textoLegenda = (valor: string) => <span className="text-cinza">{valor}</span>;

const DicaMedia = ({ active, payload, label }: Dica) =>
  active && payload?.length ? <Caixa titulo={label} itens={payload} formato={virgula} /> : null;

export default function GraficoDisciplina({
  nome,
  semestres,
  minimo,
}: {
  nome: string;
  semestres: Semestre[];
  minimo: number;
}) {
  const [tabela, setTabela] = useState(false);

  if (semestres.length === 0) {
    return <p className="aviso">Esta disciplina não tem semestre com pelo menos {minimo} alunos registrados.</p>;
  }

  const dados = semestres.map((s) => ({
    semestre: s.semestre,
    alunos: s.alunos,
    // Sem arredondar: as três somam exatamente 100. Arredondadas antes da
    // soma, davam 100,1 e estouravam o topo do eixo.
    aprovados: (s.aprovados / s.alunos) * 100,
    reprovadosNota: (s.reprovadosNota / s.alunos) * 100,
    reprovadosFalta: (s.reprovadosFalta / s.alunos) * 100,
    mediaTodos: umaCasa(s.media),
    medianaTodos: umaCasa(s.mediana),
    mediaComputacao: umaCasa(s.mediaComputacao),
  }));

  // As duas médias descrevem populações diferentes: a primeira inclui todos os
  // cursos da turma; a segunda, só Engenharia e Ciência da Computação. De 2022
  // em diante o relatório só traz alunos de Engenharia de Computação, então as
  // duas coincidem; sem esta nota, parece defeito. (`every` num conjunto vazio
  // é verdadeiro, daí a checagem de tamanho.)
  const comparaveis = dados.filter((d) => d.semestre >= "2022" && d.mediaTodos !== null && d.mediaComputacao !== null);
  const coincidem =
    comparaveis.length > 0 && comparaveis.every((d) => Math.abs(d.mediaTodos! - d.mediaComputacao!) < 0.05);

  // itemSorter={null} nas legendas: sem ele o Recharts 3 ordena os itens
  // pelo nome, e a legenda deixa de seguir a ordem da pilha.
  const legenda = { fontSize: 13, fontWeight: 700, color: "#6E676A" };

  return (
    <div>
      <h3 className="text-lg leading-[22px] font-bold text-vinho">Resultado das turmas por semestre</h3>
      <p className="mt-1 mb-4 text-[13px] leading-4 text-cinza">Porcentagem dos alunos de cada semestre</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="semestre" tick={EIXO} tickLine={false} axisLine={{ stroke: "#E9DDE2" }} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            unit="%"
            tick={EIXO}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip content={DicaResultado} cursor={{ fill: "rgba(191, 45, 93, 0.06)" }} />
          <Legend itemSorter={null} iconType="circle" iconSize={10} wrapperStyle={legenda} formatter={textoLegenda} />
          <Bar dataKey="aprovados" name="Aprovados" stackId="r" fill={COR.aprovados} stroke="#fff" strokeWidth={2} />
          <Bar
            dataKey="reprovadosNota"
            name="Reprovados por nota"
            stackId="r"
            fill={COR.nota}
            stroke="#fff"
            strokeWidth={2}
          />
          <Bar
            dataKey="reprovadosFalta"
            name="Reprovados por falta"
            stackId="r"
            fill={COR.falta}
            stroke="#fff"
            strokeWidth={2}
            radius={[4, 4, 0, 0]}
          />
          {dados.length > 14 && <Brush dataKey="semestre" height={20} stroke="#BF2D5D" travellerWidth={8} />}
        </ComposedChart>
      </ResponsiveContainer>

      <h3 className="mt-9 text-lg leading-[22px] font-bold text-vinho">Média das notas</h3>
      <p className="mt-1 mb-4 text-[13px] leading-4 text-cinza">Nota final de 0 a 10, só de quem teve nota lançada</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis
            dataKey="semestre"
            tick={EIXO}
            tickLine={false}
            axisLine={{ stroke: "#E9DDE2" }}
            padding={{ left: 24, right: 24 }}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={EIXO}
            tickLine={false}
            axisLine={false}
            width={46}
          />
          <Tooltip content={DicaMedia} cursor={{ stroke: "#E9DDE2", strokeWidth: 2 }} />
          <Legend itemSorter={null} iconType="plainline" wrapperStyle={legenda} formatter={textoLegenda} />
          <Line
            dataKey="mediaTodos"
            name="Todos os cursos"
            stroke={COR.todos}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            connectNulls
          />
          {/* Tracejada de propósito: de 2022 em diante as duas médias
              coincidem, e uma linha contínua sobre a outra sumiria. */}
          <Line
            dataKey="mediaComputacao"
            name="Alunos de computação"
            stroke={COR.computacao}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>

      {coincidem && (
        <p className="mt-3 text-[13px] leading-[19px] text-cinza">
          As duas linhas coincidem de 2022 em diante: desde então o relatório da coordenação traz apenas alunos de
          Engenharia de Computação, então os dois grupos são o mesmo.
        </p>
      )}

      <p className="mt-3 text-[13px] leading-[19px] text-cinza">
        Semestres com menos de {minimo} alunos não aparecem: numa turma tão pequena, a média mostraria a nota de cada
        um.
      </p>

      <button type="button" aria-expanded={tabela} onClick={() => setTabela((v) => !v)} className="mt-6 pilula">
        {tabela ? "Ocultar tabela" : "Ver os números em tabela"}
      </button>

      {tabela && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm tabular-nums">
            <caption className="sr-only">Resultados de {nome} por semestre</caption>
            <thead>
              <tr className="text-[13px] text-cinza [&>th]:border-b [&>th]:border-borda [&>th]:px-3 [&>th]:py-2 [&>th]:text-right [&>th]:whitespace-nowrap [&>th:first-child]:text-left">
                <th scope="col">Semestre</th>
                <th scope="col">Alunos</th>
                <th scope="col">Aprovados</th>
                <th scope="col">Rep. nota</th>
                <th scope="col">Rep. falta</th>
                <th scope="col">Média (todos)</th>
                <th scope="col">Mediana (todos)</th>
                <th scope="col">Média (computação)</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d) => (
                <tr
                  key={d.semestre}
                  className="text-cinza [&>*]:border-b [&>*]:border-borda [&>*]:px-3 [&>*]:py-2 [&>*]:text-right [&>*]:whitespace-nowrap"
                >
                  <th scope="row" className="!text-left text-vinho">
                    {d.semestre}
                  </th>
                  <td>{d.alunos}</td>
                  <td>{porcento(d.aprovados)}</td>
                  <td>{porcento(d.reprovadosNota)}</td>
                  <td>{porcento(d.reprovadosFalta)}</td>
                  <td>{virgula(d.mediaTodos)}</td>
                  <td>{virgula(d.medianaTodos)}</td>
                  <td>{virgula(d.mediaComputacao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
