import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import BarraBusca from "../components/BarraBusca";
import CartaoDisciplina from "../components/CartaoDisciplina";

import useGrade from "../hooks/useGrade";
import useEstatisticas from "../hooks/useEstatisticas";
import useTitulo from "../hooks/useTitulo";
import { useCurriculo } from "../contexto/Curriculo";
import {
  disciplinasDoCurriculo,
  filtraPorTexto,
  rotuloPeriodo,
  semRepetir,
  OPTATIVA,
} from "../utils/disciplinas";

import "./styles/Disciplinas.css";

/**
 * Busca, periodo e tipo ficam no endereco: da para mandar o link de "todas
 * as optativas do 2022" para alguem, e o voltar do navegador desfaz o filtro.
 */
function Disciplinas() {
  useTitulo("Disciplinas");
  const { curriculo } = useCurriculo();
  const { grade, erro, carregando } = useGrade();
  const { estatisticas } = useEstatisticas();
  const [parametros, setParametros] = useSearchParams();

  const busca = parametros.get("busca") || "";
  const periodo = parametros.get("periodo") ? Number(parametros.get("periodo")) : null;
  const tipo = parametros.get("tipo"); // "OB" | "OP" | null

  const muda = (nome, valor) => {
    const novos = new URLSearchParams(parametros);
    if (valor === null || valor === "") novos.delete(nome);
    else novos.set(nome, valor);
    setParametros(novos, { replace: nome === "busca" });
  };

  const todas = useMemo(
    () => semRepetir(disciplinasDoCurriculo(grade, curriculo)),
    [grade, curriculo]
  );

  const periodos = useMemo(
    () =>
      Array.from(new Set(todas.map((d) => d.periodo)))
        .filter((p) => p !== OPTATIVA)
        .sort((a, b) => a - b),
    [todas]
  );

  const visiveis = filtraPorTexto(todas, busca)
    .filter((d) => periodo === null || d.periodo === periodo)
    .filter((d) => tipo !== "OB" || d.obrigatoria)
    .filter((d) => tipo !== "OP" || !d.obrigatoria)
    .sort((a, b) => a.periodo - b.periodo || a.nome.localeCompare(b.nome, "pt-BR"));

  return (
    <main className="pagina disciplinas">
      <h1 className="titulo-pagina">Disciplinas</h1>
      <p className="subtitulo-pagina">
        Busque uma matéria e veja avaliações feitas pelos alunos.
      </p>

      <div className="disciplinas-filtros">
        <BarraBusca
          id="busca-disciplinas"
          className="disciplinas-busca"
          valor={busca}
          aoMudar={(texto) => muda("busca", texto)}
        />
        <div className="disciplinas-pilulas">
          <label className="pilula pilula-seletor disciplinas-pilula-periodo">
            <span className="sr-only">Período</span>
            <span aria-hidden="true">
              {periodo === null ? "Todos os períodos" : rotuloPeriodo(periodo)}
            </span>
            <select
              value={periodo === null ? "" : periodo}
              onChange={(e) => muda("periodo", e.target.value)}
            >
              <option value="">Todos os períodos</option>
              {periodos.map((p) => (
                <option key={p} value={p}>
                  {rotuloPeriodo(p)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="pilula disciplinas-pilula-ob"
            aria-pressed={tipo === "OB"}
            title="Só disciplinas obrigatórias"
            onClick={() => muda("tipo", tipo === "OB" ? null : "OB")}
          >
            OB
          </button>
          <button
            type="button"
            className="pilula disciplinas-pilula-op"
            aria-pressed={tipo === "OP"}
            title="Só disciplinas optativas"
            onClick={() => muda("tipo", tipo === "OP" ? null : "OP")}
          >
            OP
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {carregando ? "" : `${visiveis.length} disciplinas encontradas`}
      </p>

      {carregando && <p className="aviso">Carregando disciplinas…</p>}
      {erro && (
        <p className="aviso aviso-erro" role="alert">
          A lista de disciplinas não carregou. Recarregue a página; se continuar
          assim, o servidor está fora do ar.
        </p>
      )}
      {!carregando && !erro && visiveis.length === 0 && (
        <p className="aviso">Nenhuma disciplina encontrada com esses filtros.</p>
      )}

      <div className="disciplinas-cartoes">
        {visiveis.map((d) => (
          <CartaoDisciplina key={d.codigo} disciplina={d} estatistica={estatisticas[d.codigo]} />
        ))}
      </div>
    </main>
  );
}

export default Disciplinas;
