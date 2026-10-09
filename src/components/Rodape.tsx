import { DESDE, MINIMO_POR_SEMESTRE } from "@/lib/formato";
import { periodoDosDados } from "@/lib/notas/consultas";
import { LogoPet, LogoUfes } from "./Icones";

const PPC = "https://informatica.ufes.br/pt-br/ppc-engcomp";

const Externo = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
    {children}
  </a>
);

/**
 * Rodapé (sugestão da Bia): quem faz o site e de onde vêm os dados. O fundo é
 * o vinho do site porque o manual da Ufes não deixa recolorir o selo: em
 * fundo escuro ele vai todo branco, como a marca do PET, e combina com o
 * resto em vez de destoar em azul.
 */
export default function Rodape() {
  const periodo = periodoDosDados();
  return (
    <footer className="bg-vinho">
      <div className="mx-auto grid max-w-[calc(1328px+112px)] grid-cols-[auto_1fr] gap-x-16 gap-y-8 px-14 py-10 text-[13px] leading-5 text-white/80 max-[1100px]:px-8 max-[900px]:grid-cols-1 max-celular:px-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-6">
            <a href="https://pet.inf.ufes.br" target="_blank" rel="noopener noreferrer" className="text-white transition-opacity hover:opacity-80">
              <LogoPet />
            </a>
            <a href="https://www.ufes.br" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
              <LogoUfes branca />
            </a>
          </div>
          <p>
            Feito pelo <b className="text-white">PET Engenharia de Computação</b>
            <br />
            Universidade Federal do Espírito Santo
          </p>
          <p className="flex gap-4">
            <Externo href="https://pet.inf.ufes.br">Site do PET</Externo>
            <Externo href="https://www.instagram.com/petengcomp/">Instagram</Externo>
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-bold text-white">De onde vêm os dados</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 marker:text-white/40">
            <li>
              <b className="text-white">Notas:</b> relatórios de notas finais da Coordenação do curso de Engenharia de Computação
              {periodo && (
                <>
                  , de {periodo.primeiro} a {periodo.ultimo}
                </>
              )}
              . Aprovação, média e dificuldade consideram as turmas de {DESDE} em diante; os gráficos mostram o
              histórico completo.
            </li>
            <li>
              <b className="text-white">Grade, carga horária e equivalências:</b> Projeto Pedagógico do Curso e representação gráfica da
              matriz curricular, do <Externo href={PPC}>Departamento de Informática</Externo>.
            </li>
            <li>
              <b className="text-white">Privacidade:</b> o site só mostra números agregados por disciplina. Nenhum aluno é identificado, e
              semestres com menos de {MINIMO_POR_SEMESTRE} alunos ficam fora dos gráficos.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
