import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Prévia que aparece ao compartilhar o link (WhatsApp, Instagram, Telegram):
// as cores e o logo do mockup, com o nome do site.
export const alt = "Estatísticas de disciplinas — Engenharia de Computação UFES";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A Inter do site, em TTF: o gerador de imagem não lê woff2.
const fonte = (peso: string) => readFile(path.join(process.cwd(), "src/app/fontes", `inter-${peso}.ttf`));

export default async function Imagem() {
  const [normal, negrito] = await Promise.all([fonte("400"), fonte("700")]);
  const barra = (altura: number) => (
    <div style={{ width: 34, height: altura, borderRadius: 17, background: "#fff" }} />
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#FFF9FB",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 48,
            background: "#800C33",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 18,
            paddingBottom: 34,
          }}
        >
          {barra(56)}
          {barra(94)}
          {barra(132)}
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 700, color: "#800C33" }}>
          Estatísticas de disciplinas
        </div>
        <div style={{ marginTop: 8, fontSize: 40, fontWeight: 700, color: "#BF2D5D" }}>
          Engenharia de Computação UFES
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#7A7074" }}>
          Aprovação, notas, dificuldade e a grade curricular de cada disciplina
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: normal, weight: 400, style: "normal" },
        { name: "Inter", data: negrito, weight: 700, style: "normal" },
      ],
    },
  );
}
