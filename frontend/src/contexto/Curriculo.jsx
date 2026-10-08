import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * O curso trocou de curriculo em 2022 e as duas geracoes convivem: varias
 * disciplinas existem nas duas, com o mesmo nome e codigos diferentes. O
 * botao 2008/2022 do cabecalho vale para o site inteiro, e a escolha fica
 * guardada para a proxima visita: quem entrou antes de 2022 so cursa as
 * antigas.
 */
const CHAVE = "curriculo";
const OPCOES = ["2008", "2022"];

const Contexto = createContext({ curriculo: "2022", setCurriculo: () => {} });

function lerGuardado() {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return OPCOES.includes(valor) ? valor : "2022";
  } catch {
    return "2022";
  }
}

export function CurriculoProvider({ children }) {
  const [curriculo, setCurriculo] = useState(lerGuardado);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, curriculo);
    } catch {
      // Navegacao privada ou armazenamento bloqueado: so nao lembra.
    }
  }, [curriculo]);

  return (
    <Contexto.Provider value={{ curriculo, setCurriculo }}>
      {children}
    </Contexto.Provider>
  );
}

export function useCurriculo() {
  return useContext(Contexto);
}

export { OPCOES as CURRICULOS };
