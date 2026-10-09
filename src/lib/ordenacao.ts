// Ordens da tela Disciplinas. A Bia pediu para poder ver a mais difícil
// primeiro; as outras saem do mesmo jeito.

export const ORDENS = {
  periodo: "Por período",
  dificil: "Mais difícil primeiro",
  facil: "Mais fácil primeiro",
  "menor-aprovacao": "Menor aprovação",
  "maior-aprovacao": "Maior aprovação",
  nome: "Por nome",
} as const;

export type Ordem = keyof typeof ORDENS;

export const ehOrdem = (v: string | null): v is Ordem => v !== null && v in ORDENS;

type Ordenavel = {
  nome: string;
  periodo: number | null;
  numeros: { dificuldade: number | null; aprovacao: number } | null;
};

const porNome = (a: Ordenavel, b: Ordenavel) => a.nome.localeCompare(b.nome, "pt-BR");

/**
 * Ordena sem mexer na lista recebida. Disciplina sem número (poucos alunos)
 * vai sempre para o fim, nas duas direções: no meio, pareceria a mais fácil
 * ou a mais difícil sem ser. Empate desempata pelo nome.
 */
export function ordenar<T extends Ordenavel>(lista: T[], ordem: Ordem): T[] {
  if (ordem === "nome") return [...lista].sort(porNome);
  if (ordem === "periodo") return [...lista].sort((a, b) => (a.periodo ?? 0) - (b.periodo ?? 0) || porNome(a, b));

  const valor = (d: T) =>
    ordem === "dificil" || ordem === "facil" ? (d.numeros?.dificuldade ?? null) : (d.numeros?.aprovacao ?? null);
  const sinal = ordem === "dificil" || ordem === "maior-aprovacao" ? -1 : 1;
  return [...lista].sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    if (va === null || vb === null) return va === null && vb === null ? porNome(a, b) : va === null ? 1 : -1;
    return sinal * (va - vb) || porNome(a, b);
  });
}
