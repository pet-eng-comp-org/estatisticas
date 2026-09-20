import { useEffect } from "react";

const SUFIXO = "Estatísticas das disciplinas — PET Engenharia de Computação";

/**
 * O titulo era fixo em todas as telas. Isso passou a importar quando cada
 * disciplina ganhou endereco proprio: um link compartilhado abria uma aba cujo
 * titulo nao dizia de que disciplina se tratava.
 */
export default function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} — ${SUFIXO}` : SUFIXO;
  }, [titulo]);
}
