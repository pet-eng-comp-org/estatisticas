import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BarraBusca from "../components/BarraBusca";
import CartaoResumo from "../components/CartaoResumo";
import CartaoInicio from "../components/CartaoInicio";

import useGrade from "../hooks/useGrade";
import useEstatisticas from "../hooks/useEstatisticas";
import useTitulo from "../hooks/useTitulo";
import { useCurriculo } from "../contexto/Curriculo";
import {
  disciplinasDoCurriculo,
  filtraPorTexto,
  formata,
  rotuloPeriodo,
  semRepetir,
  OPTATIVA,
} from "../utils/disciplinas";

import "./styles/Inicio.css";

function Inicio() {
  useTitulo(null);
  const navegar = useNavigate();
  const { curriculo } = useCurriculo();
  const { grade, erro, carregando } = useGrade();
  const { estatisticas } = useEstatisticas();

  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState(1);
  const [soObrigatorias, setSoObrigatorias] = useState(false);

  const todas = useMemo(
    () =>
      semRepetir(disciplinasDoCurriculo(grade, curriculo)).sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      ),
    [grade, curriculo]
  );

  // Os quatro numeros do topo, somando as disciplinas do curriculo
  // escolhido. A media geral pondera pelos alunos, para uma disciplina de 15
  // alunos nao pesar tanto quanto Calculo I.
  const resumo = useMemo(() => {
    let disciplinas = 0;
    let alunos = 0;
    let aprovados = 0;
    let somaMedias = 0;
    todas.forEach((d) => {
      const e = estatisticas[d.codigo];
      if (!e) return;
      disciplinas++;
      alunos += e.alunos;
      aprovados += e.aprovados;
      somaMedias += e.media * e.alunos;
    });
    return {
      disciplinas,
      alunos,
      aprovacao: alunos ? aprovados / alunos : null,
      media: alunos ? somaMedias / alunos : null,
    };
  }, [todas, estatisticas]);

  const periodos = useMemo(
    () => Array.from(new Set(todas.map((d) => d.periodo))).sort((a, b) => a - b),
    [todas]
  );

  // Com texto na busca, procura no curriculo inteiro; sem texto, mostra o
  // periodo escolhido na pilula.
  const buscando = busca.trim() !== "";
  const visiveis = (buscando ? filtraPorTexto(todas, busca) : todas.filter((d) => d.periodo === periodo))
    .filter((d) => !soObrigatorias || d.periodo !== OPTATIVA);

  const tituloSecao = buscando ? "Resultados da busca" : rotuloPeriodo(periodo);

  return (
    <main className="pagina inicio">
      <section className="inicio-chamada">
        <h1 className="inicio-titulo">
          Conheça as estatísticas
          <span>das disciplinas de Computação UFES</span>
        </h1>
        <p className="inicio-texto">
          Compare experiências dos alunos, dificuldade, aprovação e organização
          das disciplinas entre os currículos de 2008 e 2022.
        </p>
        <div className="inicio-acoes">
          <Link to="/disciplinas" className="botao botao-cheio">
            Explorar disciplinas
          </Link>
          <Link to="/comparar" className="botao botao-vazado">
            Comparar currículos
          </Link>
        </div>
      </section>

      <section className="inicio-resumo" aria-label={`Resumo do currículo ${curriculo}`}>
        <CartaoResumo
          tom="rosa"
          valor={formata.inteiro(resumo.disciplinas)}
          rotulo="Disciplinas avaliadas"
          descricao="Disciplinas com pelo menos 10 alunos desde 2018"
        />
        <CartaoResumo
          tom="verde"
          valor={formata.decimal(resumo.media)}
          rotulo="Média geral"
          descricao="Média das notas finais (0 a 10), ponderada pelo número de alunos"
        />
        <CartaoResumo
          tom="verde"
          valor={formata.porcento(resumo.aprovacao)}
          rotulo="Aprovação média"
          descricao="Alunos aprovados sobre o total de alunos das turmas desde 2018"
        />
        <CartaoResumo
          tom="escuro"
          valor={formata.inteiro(resumo.alunos)}
          rotulo="Matrículas"
          descricao="Matrículas em turmas concluídas desde 2018"
        />
      </section>

      <BarraBusca
        id="busca-inicio"
        className="inicio-busca"
        valor={busca}
        aoMudar={setBusca}
        aoEnviar={(texto) => texto.trim() && navegar(`/disciplinas?busca=${encodeURIComponent(texto.trim())}`)}
      >
        <label className="pilula pilula-seletor inicio-pilula-periodo">
          <span className="sr-only">Período mostrado</span>
          <span aria-hidden="true">{rotuloPeriodo(periodo)}</span>
          <select
            value={periodo}
            onChange={(e) => {
              setPeriodo(Number(e.target.value));
              setBusca("");
            }}
          >
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p === OPTATIVA ? "Optativas" : rotuloPeriodo(p)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="pilula inicio-pilula"
          aria-pressed={soObrigatorias}
          title="Mostrar só disciplinas obrigatórias"
          onClick={() => setSoObrigatorias((v) => !v)}
        >
          OB
        </button>
        <Link to="/disciplinas" className="pilula inicio-pilula">
          Filtros
        </Link>
      </BarraBusca>

      <section className="inicio-periodo" aria-live="polite">
        <h2 className="inicio-periodo-titulo">{tituloSecao}</h2>
        {carregando && <p className="aviso">Carregando disciplinas…</p>}
        {erro && (
          <p className="aviso aviso-erro" role="alert">
            A lista de disciplinas não carregou. Recarregue a página; se
            continuar assim, o servidor está fora do ar.
          </p>
        )}
        {!carregando && !erro && visiveis.length === 0 && (
          <p className="aviso">Nenhuma disciplina encontrada.</p>
        )}
        <div className="inicio-cartoes">
          {visiveis.map((d) => (
            <CartaoInicio key={d.codigo} disciplina={d} estatistica={estatisticas[d.codigo]} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Inicio;
