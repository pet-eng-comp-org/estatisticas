import type { NextConfig } from "next";

const config: NextConfig = {
  // A imagem Docker roda com `node server.js`: 'standalone' empacota só o que o
  // servidor usa.
  output: "standalone",
  poweredByHeader: false,
  // O `next dev` escreveria AGENTS.md e CLAUDE.md na pasta; o projeto não quer.
  agentRules: false,
  serverExternalPackages: ["better-sqlite3"],
  // Endereços do site anterior: links compartilhados continuam abrindo.
  async redirects() {
    return [
      { source: "/disciplina/:codigo", destination: "/disciplinas/:codigo", permanent: true },
      { source: "/departamentos/disciplina/:codigo", destination: "/disciplinas/:codigo", permanent: true },
      { source: "/nome/disciplina/:codigo", destination: "/disciplinas/:codigo", permanent: true },
      { source: "/departamentos", destination: "/disciplinas", permanent: true },
      { source: "/nome", destination: "/disciplinas", permanent: true },
      { source: "/reprovacoes", destination: "/disciplinas", permanent: true },
    ];
  },
};

export default config;
