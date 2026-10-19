/*******************************************************************************
 * Inicio.tsx
 * funcao principal: tela inicial do jogo, com o titulo e os botoes de
 * jogar, tutorial, quiz e glossario.
 ******************************************************************************/
import { Link, useNavigate } from "@tanstack/react-router";
import { contarTotais } from "@/motor";
import { DecorCena, MiniTabela } from "./FundoQuimico";
import { SoundToggle, TelaCheia } from "./comuns";
import { TituloLab } from "./Titulo";
import { useProgresso } from "./store";

/*******************************************************************************
 * Inicio
 * funcao: tela inicial. o jogador escolhe jogar (ou continuar), ver o
 * tutorial de novo, o quiz ou o glossario.
 * recebe: nada.
 * retorna: a tela com titulo, botoes e, para quem ja jogou, a mini tabela
 * com o progresso.
 ******************************************************************************/
export function Inicio() {
  const { estado, carregado } = useProgresso();
  const navegar = useNavigate();
  const tot = contarTotais(estado);
  // quem ja fez o tutorial vai direto para o mapa
  const jaJogou = estado.tutorialConcluido;
  const jogar = () => void navegar({ to: jaJogou ? "/mapa" : "/tutorial" });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden px-4 pb-[16vh] pt-6 text-center" style={{ background: "linear-gradient(to bottom, var(--ink) 0 45%, color-mix(in oklab, var(--ink) 70%, var(--night)) 100%)" }}>
      <DecorCena cena="titulo" />

      {/* canto: tela cheia e som */}
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <TelaCheia />
        <SoundToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* titulo e subtitulo entram em sequencia (animationDelay) */}
        <div className="anim-titulo">
          <TituloLab className="w-[min(86vw,640px)]" />
        </div>
        <p className="font-display anim-entrar text-[10px] tracking-widest text-parchment sm:text-sm" style={{ animationDelay: "800ms" }}>
          CONSTRUTOR ATÔMICO
        </p>
        <p className="anim-entrar max-w-md text-lg text-parchment-shade" style={{ animationDelay: "1000ms" }}>
          Monte átomos, destrave os 118 elementos e acenda a tabela periódica.
        </p>

        <div className="anim-entrar mt-2 flex flex-col items-center gap-3" style={{ animationDelay: "1300ms" }}>
          {/* desativado ate o progresso carregar, para nao mandar ao tutorial quem ja jogou */}
          <button type="button" className="pixel-btn btn-gold px-10 py-5 text-base" onClick={jogar} disabled={!carregado}>
            ▶ {jaJogou ? "CONTINUAR" : "JOGAR"}
          </button>
          <div className="flex flex-wrap justify-center gap-2">
            {jaJogou && (
              <Link to="/tutorial" className="pixel-btn btn-parchment">
                TUTORIAL
              </Link>
            )}
            <Link to="/quiz" className="pixel-btn btn-parchment">
              QUIZ
            </Link>
            <Link to="/glossario" className="pixel-btn btn-parchment">
              GLOSSÁRIO
            </Link>
          </div>
        </div>

        {/* progresso: mini tabela e totais (118 elementos x 3 estrelas = 354) */}
        {jaJogou && (
          <div className="anim-entrar flex flex-col items-center gap-2" style={{ animationDelay: "1600ms" }}>
            <MiniTabela className="w-[min(80vw,420px)]" />
            <p className="font-display text-[9px] text-parchment sm:text-[10px]">
              {tot.elementos}/118 ELEMENTOS · {tot.estrelas}/354 ★
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
