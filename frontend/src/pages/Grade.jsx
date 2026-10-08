import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import useGrade from "../hooks/useGrade";
import useEstatisticas from "../hooks/useEstatisticas";
import useTitulo from "../hooks/useTitulo";
import { useCurriculo } from "../contexto/Curriculo";
import { disciplinasDoCurriculo, rotuloCarga, rotuloPeriodo, semRepetir, tom, OPTATIVA } from "../utils/disciplinas";

import "./styles/Grade.css";

/**
 * Ordena cada periodo para as setas cruzarem pouco: o primeiro em ordem
 * alfabetica, os seguintes pela posicao media dos seus pre-requisitos na
 * coluna anterior (o metodo do baricentro). Sem pre-requisito, vai para o
 * fim.
 */
function ordenaColunas(colunas) {
  const linha = {};
  return colunas.map((coluna, i) => {
    const ordenada = [...coluna.disciplinas].sort((a, b) => {
      if (i === 0) return a.nome.localeCompare(b.nome, "pt-BR");
      const peso = (d) => {
        const posicoes = d.pre_requisitos.filter((c) => c in linha).map((c) => linha[c]);
        return posicoes.length ? posicoes.reduce((s, p) => s + p, 0) / posicoes.length : 1000;
      };
      return peso(a) - peso(b) || a.nome.localeCompare(b.nome, "pt-BR");
    });
    ordenada.forEach((d, j) => {
      linha[d.codigo] = j;
    });
    return { ...coluna, disciplinas: ordenada };
  });
}

/**
 * Caminho em angulo reto, como no mockup: sai pela direita do cartao,
 * desce ou sobe no corredor entre as colunas e entra pela esquerda do
 * destino. Quando pula colunas, passa pelo vao entre as linhas acima do
 * destino, para nunca atravessar um cartao.
 */
function caminho(origem, destino) {
  const sx = origem.direita;
  const sy = origem.meio;
  const tx = destino.esquerda - 2;
  const ty = destino.meio;
  const corredor = origem.direita + 27.5;
  if (destino.coluna === origem.coluna + 1) {
    return `M${sx} ${sy}H${corredor}V${ty}H${tx}`;
  }
  const vao = destino.topo - 14.5;
  const antes = destino.esquerda - 25;
  return `M${sx} ${sy}H${corredor}V${vao}H${antes}V${ty}H${tx}`;
}

// Cartao de 88 px mais o vao de 32 entre eles.
const ALTURA_LINHA = 120;

function Grade() {
  useTitulo("Grade curricular");
  const { curriculo } = useCurriculo();
  const { grade, erro, carregando } = useGrade();
  const { estatisticas } = useEstatisticas();

  const colunas = useMemo(() => {
    const porPeriodo = new Map();
    semRepetir(disciplinasDoCurriculo(grade, curriculo))
      .filter((d) => d.periodo !== OPTATIVA)
      .forEach((d) => {
        if (!porPeriodo.has(d.periodo)) porPeriodo.set(d.periodo, []);
        porPeriodo.get(d.periodo).push(d);
      });
    const lista = Array.from(porPeriodo.entries())
      .sort(([a], [b]) => a - b)
      .map(([periodo, disciplinas]) => ({ periodo, disciplinas }));
    return ordenaColunas(lista);
  }, [grade, curriculo]);

  // Posicao de cada cartao dentro da area rolavel, medida depois do layout:
  // as setas sao desenhadas por cima, num SVG do mesmo tamanho.
  const areaRef = useRef(null);
  const [posicoes, setPosicoes] = useState({});
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 });
  const [destaque, setDestaque] = useState(null);

  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return undefined;

    const mede = () => {
      const base = area.getBoundingClientRect();
      const novas = {};
      area.querySelectorAll("[data-codigo]").forEach((el) => {
        const r = el.getBoundingClientRect();
        novas[el.dataset.codigo] = {
          esquerda: r.left - base.left + area.scrollLeft,
          direita: r.right - base.left + area.scrollLeft,
          topo: r.top - base.top,
          meio: r.top - base.top + r.height / 2,
          coluna: Number(el.dataset.coluna),
        };
      });
      setPosicoes(novas);
      setTamanho({ largura: area.scrollWidth, altura: area.scrollHeight });
    };

    mede();
    const observador = new ResizeObserver(mede);
    observador.observe(area);
    return () => observador.disconnect();
  }, [colunas]);

  const arestas = useMemo(() => {
    const lista = [];
    colunas.forEach((coluna) => {
      coluna.disciplinas.forEach((d) => {
        d.pre_requisitos.forEach((pre) => {
          const origem = posicoes[pre];
          const destino = posicoes[d.codigo];
          if (origem && destino && origem.coluna < destino.coluna) {
            // As "principais", que ficam sempre a mostra: periodo seguinte e
            // no maximo uma linha de distancia. As outras so aparecem com o
            // mouse ou o foco na disciplina; todas juntas viram um emaranhado.
            const principal =
              destino.coluna === origem.coluna + 1 &&
              Math.abs(destino.topo - origem.topo) <= ALTURA_LINHA + 1;
            lista.push({ de: pre, para: d.codigo, principal, d: caminho(origem, destino) });
          }
        });
      });
    });
    return lista;
  }, [colunas, posicoes]);

  const ligadas = (aresta) => destaque && (aresta.de === destaque || aresta.para === destaque);
  const visiveis = arestas.filter((a) => (destaque ? ligadas(a) : a.principal));

  return (
    <main className="pagina grade">
      <h1 className="titulo-pagina">Grade curricular</h1>
      <p className="subtitulo-pagina">Visualize os períodos e os principais pré-requisitos.</p>

      <section className="grade-quadro" aria-label={`Grade do currículo ${curriculo}`}>
        {carregando && <p className="aviso">Carregando a grade…</p>}
        {erro && (
          <p className="aviso aviso-erro" role="alert">
            A grade não carregou. Recarregue a página; se continuar assim, o
            servidor está fora do ar.
          </p>
        )}

        <div className="grade-area" ref={areaRef}>
          <svg
            className={`grade-setas${destaque ? " com-destaque" : ""}`}
            width={tamanho.largura}
            height={tamanho.altura}
            aria-hidden="true"
          >
            <defs>
              {/* Uma ponta por cor: context-stroke ainda nao funciona em
                  todos os navegadores. */}
              {[["ponta", "#C6C6C6"], ["ponta-ligada", "#BF2D5D"]].map(([id, cor]) => (
                <marker key={id} id={id} viewBox="0 0 12 22" refX="11" refY="11" markerWidth="12" markerHeight="22" markerUnits="userSpaceOnUse" orient="auto">
                  <path d="M1.5 1.5 11 11l-9.5 9.5" fill="none" stroke={cor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              ))}
            </defs>
            {visiveis.map((a) => (
              <path
                key={`${a.de}-${a.para}`}
                d={a.d}
                className={ligadas(a) ? "seta-ligada" : ""}
                markerEnd={ligadas(a) ? "url(#ponta-ligada)" : "url(#ponta)"}
              />
            ))}
          </svg>

          {colunas.map((coluna, i) => (
            <div className="grade-coluna" key={coluna.periodo}>
              <h2 className="grade-periodo">{rotuloPeriodo(coluna.periodo)}</h2>
              <span className="grade-periodo-barra" aria-hidden="true" />
              <ul className="grade-lista">
                {coluna.disciplinas.map((d) => (
                  <li key={d.codigo}>
                    <Link
                      to={`/disciplinas/${d.codigo}`}
                      className={`grade-cartao grade-cartao-${tom(estatisticas[d.codigo])}`}
                      data-codigo={d.codigo}
                      data-coluna={i}
                      onMouseEnter={() => setDestaque(d.codigo)}
                      onMouseLeave={() => setDestaque(null)}
                      onFocus={() => setDestaque(d.codigo)}
                      onBlur={() => setDestaque(null)}
                    >
                      <span className="grade-cartao-faixa" aria-hidden="true" />
                      <span className="grade-cartao-nome">{d.nome}</span>
                      <span className="grade-cartao-meta">{rotuloCarga(d)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Grade;
