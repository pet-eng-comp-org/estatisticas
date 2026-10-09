import "server-only";

import { cookies } from "next/headers";
import type { Curriculo } from "../notas/consultas";

export const COOKIE_CURRICULO = "curriculo";

/**
 * Currículo escolhido no cabeçalho. Fica num cookie para a página já vir do
 * servidor com a grade certa, sem piscar a outra antes.
 */
export async function curriculoEscolhido(): Promise<Curriculo> {
  const valor = (await cookies()).get(COOKIE_CURRICULO)?.value;
  return valor === "2008" ? 2008 : 2022;
}
