import type { MetadataRoute } from "next";
import { disciplinasDoCurriculo } from "@/lib/notas/consultas";
import { URL_SITE } from "@/lib/site";

// Montado a cada pedido: a lista de disciplinas vem do banco, que não existe
// na hora do build.
export const dynamic = "force-dynamic";

/** As quatro telas e a página de cada disciplina das duas grades. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ["", "/grade", "/disciplinas", "/comparar"].map((caminho) => ({
    url: `${URL_SITE}${caminho}`,
    changeFrequency: "monthly" as const,
    priority: caminho === "" ? 1 : 0.8,
  }));
  const disciplinas = [...disciplinasDoCurriculo(2022), ...disciplinasDoCurriculo(2008)].map((d) => ({
    url: `${URL_SITE}/disciplinas/${d.codigo}`,
    changeFrequency: "yearly" as const,
    priority: d.curriculo === 2022 ? 0.6 : 0.4,
  }));
  return [...paginas, ...disciplinas];
}
