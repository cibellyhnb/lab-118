/*******************************************************************************
 * Inicio.tsx
 * funcao principal: tela inicial do jogo, com o titulo e os botoes de
 * jogar, tutorial, quiz e glossario, e o botao de reiniciar o jogo.
 ******************************************************************************/
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
 * com o progresso. se o progresso salvo estava estragado, mostra o aviso
 * no topo ate o jogador dispensar. o botao REINICIAR JOGO pede confirmacao
 * numa janela do proprio jogo antes de apagar tudo.
 ******************************************************************************/
export function Inicio() {
  const { estado, carregado, avisoCorrompido, dispensarAviso, reiniciar } = useProgresso();
  // janela de confirmacao do reinicio aberta ou fechada
  const [confirmando, setConfirmando] = useState(false);
  const cancelar = useRef<HTMLButtonElement>(null);
  const navegar = useNavigate();
  const tot = contarTotais(estado);
  // quem ja fez o tutorial vai direto para o mapa
  const jaJogou = estado.tutorialConcluido;
  const jogar = () => void navegar({ to: jaJogou ? "/mapa" : "/tutorial" });

  // com a confirmacao aberta: foca CANCELAR (a opcao segura) e deixa o Esc fechar
  useEffect(() => {
    if (!confirmando) return;
    cancelar.current?.focus();
    const tecla = (ev: KeyboardEvent) => ev.key === "Escape" && setConfirmando(false);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [confirmando]);

  // confirmou: apaga tudo e fica na tela inicial, como um jogador novo
  const confirmarReinicio = () => {
    reiniciar();
    setConfirmando(false);
    void navegar({ to: "/" });
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden px-4 pb-[16vh] pt-6 text-center" style={{ background: "linear-gradient(to bottom, var(--ink) 0 45%, color-mix(in oklab, var(--ink) 70%, var(--night)) 100%)" }}>
      <DecorCena cena="titulo" />

      {/* canto esquerdo: reiniciar o jogo, pequeno e discreto */}
      <div className="absolute left-3 top-3 z-10">
        <button type="button" className="pixel-btn btn-dark text-[9px]" onClick={() => setConfirmando(true)} disabled={!carregado}>
          REINICIAR JOGO
        </button>
      </div>

      {/* canto: tela cheia e som */}
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <TelaCheia />
        <SoundToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* aviso de progresso corrompido: aqui ele aparece antes do redirecionamento
            para o tutorial, que esconderia o aviso do mapa */}
        {avisoCorrompido && (
          <div role="alert" className="pixel-panel flex max-w-md flex-col items-center gap-3 p-4">
            <p>Não conseguimos ler o progresso salvo, então começamos um novo. Uma cópia do arquivo antigo foi guardada.</p>
            <button type="button" className="pixel-btn btn-gold" onClick={dispensarAviso}>
              ENTENDI
            </button>
          </div>
        )}
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

      {/* confirmacao do reinicio, no mesmo estilo do painel de ajuda */}
      {confirmando && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reiniciar jogo"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "color-mix(in oklab, var(--ink) 75%, transparent)" }}
          onClick={() => setConfirmando(false)}
        >
          <div className="pixel-panel anim-pop w-full max-w-md p-4 text-left" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display mb-3 text-sm">REINICIAR JOGO?</h2>
            <p className="mb-4">Todo o progresso salvo neste navegador será apagado: elementos, estrelas, selos do quiz e tutorial. Não dá para desfazer.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button ref={cancelar} type="button" className="pixel-btn btn-parchment" onClick={() => setConfirmando(false)}>
                CANCELAR
              </button>
              <button type="button" className="pixel-btn btn-gold" onClick={confirmarReinicio}>
                APAGAR TUDO
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
