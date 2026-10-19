/*******************************************************************************
 * Ajuda.tsx
 * funcao principal: botao "?" que abre o painel de ajuda com as regras de
 * ouro, as 3 estrelas e o significado das siglas do painel.
 ******************************************************************************/
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

// sigla do painel e sua explicacao, na ordem em que aparecem
const SIGLAS: [string, string][] = [
  ["Z", "número atômico: quantos prótons. É o que define o elemento."],
  ["N", "nêutrons: ficam no núcleo e mudam só a massa."],
  ["E", "elétrons: giram em volta do núcleo e mudam a carga."],
  ["A", "número de massa: prótons + nêutrons."],
  ["q", "carga: prótons menos elétrons. Zero é átomo neutro."],
];

/*******************************************************************************
 * BotaoAjuda
 * funcao: botao "?" e o painel de ajuda que ele abre, usado em todas as
 * telas.
 * recebe: nada.
 * retorna: o botao e, quando aberto, o painel por cima da tela.
 ******************************************************************************/
export function BotaoAjuda() {
  const [aberto, setAberto] = useState(false);
  const fechar = useRef<HTMLButtonElement>(null);

  // com o painel aberto: foca o botao FECHAR e deixa o Esc fechar
  useEffect(() => {
    if (!aberto) return;
    fechar.current?.focus();
    const tecla = (ev: KeyboardEvent) => ev.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto]);

  return (
    <>
      <button type="button" className="pixel-btn btn-gold px-4" aria-label="Ajuda" title="Ajuda" onClick={() => setAberto(true)}>
        ?
      </button>
      {/* fundo escuro: clicar fora do painel fecha */}
      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ajuda"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "color-mix(in oklab, var(--ink) 75%, transparent)" }}
          onClick={() => setAberto(false)}
        >
          <div className="pixel-panel anim-pop max-h-[90vh] w-full max-w-md overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            {/* stopPropagation acima: clique dentro do painel nao fecha */}
            <h2 className="font-display mb-3 text-sm">AJUDA</h2>
            <h3 className="font-display mb-1 text-[10px] text-wood-dark">3 REGRAS DE OURO</h3>
            <ul className="mb-3 list-disc pl-5">
              <li><strong>Prótons</strong> definem o elemento.</li>
              <li><strong>Nêutrons</strong> definem o isótopo (a massa).</li>
              <li><strong>Elétrons</strong> definem o íon (a carga).</li>
            </ul>
            <h3 className="font-display mb-1 text-[10px] text-wood-dark">AS 3 ESTRELAS</h3>
            <p className="mb-3">Cada elemento tem 3 estrelas: monte o átomo neutro, um isótopo e um íon.</p>
            <h3 className="font-display mb-1 text-[10px] text-wood-dark">SIGLAS DO PAINEL</h3>
            <dl className="mb-4 grid grid-cols-[1.75rem_1fr] items-start gap-x-3 gap-y-2">
              {SIGLAS.map(([k, d]) => (
                <div key={k} className="contents">
                  <dt className="font-display flex h-7 w-7 items-center justify-center bg-ink text-xs text-gold">{k}</dt>
                  <dd className="leading-snug">{d}</dd>
                </div>
              ))}
            </dl>
            {/* acoes: rever tutorial, abrir glossario ou fechar */}
            <div className="flex flex-wrap gap-2">
              <Link to="/tutorial" className="pixel-btn btn-sky" onClick={() => setAberto(false)}>
                REVER TUTORIAL
              </Link>
              <Link to="/glossario" className="pixel-btn btn-parchment" onClick={() => setAberto(false)}>
                GLOSSÁRIO
              </Link>
              <button ref={fechar} type="button" className="pixel-btn btn-gold" onClick={() => setAberto(false)}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
