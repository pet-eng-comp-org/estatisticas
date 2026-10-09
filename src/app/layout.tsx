import type { Metadata } from "next";
import localFont from "next/font/local";

import Cabecalho from "@/components/Cabecalho";
import { URL_SITE } from "@/lib/site";
import { curriculoEscolhido } from "@/lib/curriculos/escolha";
import "./globals.css";

// Inter 3.19, a versão desktop: é a que o Figma usou no mockup. A do Google
// Fonts (4.x) tem outra largura e quebra as linhas em outro lugar. Subset
// latino, licença SIL Open Font License 1.1 (fontes/LICENCA-inter.txt).
const inter = localFont({
  src: [
    { path: "./fontes/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fontes/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--fonte-inter",
  display: "swap",
});

const DESCRICAO =
  "Aprovação, notas e dificuldade das disciplinas de Engenharia de Computação da UFES, com a grade curricular de 2022 e a comparação com o currículo 2008. Mantido pelo PET Engenharia de Computação.";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Estatísticas de disciplinas — Engenharia de Computação UFES",
    description: DESCRICAO,
  },
  title: {
    default: "Estatísticas de disciplinas — Engenharia de Computação UFES",
    template: "%s — Estatísticas de disciplinas",
  },
  description: DESCRICAO,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const curriculo = await curriculoEscolhido();
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <Cabecalho curriculo={curriculo} />
        {children}
      </body>
    </html>
  );
}
