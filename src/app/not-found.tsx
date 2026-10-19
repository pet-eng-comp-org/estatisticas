import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página não encontrada" };

export default function NaoEncontrada() {
  return (
    <main className="pagina">
      <h1 className="titulo-pagina">Página não encontrada</h1>
      <p className="subtitulo-pagina">
        Este endereço não existe. Volte para o{" "}
        <Link href="/" className="text-rosa">
          início
        </Link>{" "}
        ou procure a disciplina em{" "}
        <Link href="/disciplinas" className="text-rosa">
          Disciplinas
        </Link>
        .
      </p>
    </main>
  );
}
