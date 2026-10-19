/*******************************************************************************
 * Dialogo.tsx
 * funcao principal: caixa de dialogo estilo RPG, com o retrato da Zula e o
 * texto aparecendo letra por letra.
 ******************************************************************************/
import { useEffect, useRef, useState } from "react";
import { Zula, type Humor } from "./Zula";
import { sons, useProgresso } from "./store";

/*******************************************************************************
 * useDigitando
 * funcao: hook que revela o texto uma letra a cada 26 ms e chama aoFalar
 * a cada duas letras (para o som da voz). com movimento reduzido, mostra
 * tudo de uma vez.
 * recebe: texto e aoFalar (recebe a posicao da letra).
 * retorna: { visivel (trecho ja mostrado), pronto, terminar (mostra tudo) }.
 ******************************************************************************/
function useDigitando(texto: string, aoFalar: (i: number) => void) {
  const [n, setN] = useState(0);
  // ref para usar sempre a funcao mais nova sem reiniciar o efeito
  const falar = useRef(aoFalar);
  falar.current = aoFalar;

  useEffect(() => {
    const reduzido = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      setN(texto.length);
      return;
    }
    // texto novo: recomeca do zero
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= texto.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 26);
    return () => window.clearInterval(id);
  }, [texto]);

  // som da voz a cada duas letras, pulando os espacos
  useEffect(() => {
    if (n > 0 && n < texto.length && n % 2 === 0 && texto[n - 1] !== " ") falar.current(n);
  }, [n, texto]);

  return { visivel: texto.slice(0, n), pronto: n >= texto.length, terminar: () => setN(texto.length) };
}

/*******************************************************************************
 * Dialogo
 * funcao: caixa de dialogo com retrato da Zula, texto que "digita" e botao
 * para avancar.
 * recebe: texto, autor (padrao "ZULA"), humor (expressao da Zula), rotulo
 * (texto do botao), onAvancar e extra (conteudo abaixo do texto).
 * retorna: a caixa fixa na parte de baixo da tela.
 ******************************************************************************/
export function Dialogo({
  texto,
  autor = "ZULA",
  humor = "normal",
  rotulo = "PRÓXIMO ▶",
  onAvancar,
  extra,
}: {
  texto: string;
  autor?: string;
  humor?: Humor;
  rotulo?: string;
  // sem onAvancar, a caixa so informa (o jogador precisa fazer algo na tela)
  onAvancar?: (() => void) | undefined;
  extra?: React.ReactNode;
}) {
  const { tocar } = useProgresso();
  const { visivel, pronto, terminar } = useDigitando(texto, (i) => tocar(() => sons.fala(i)));
  const btn = useRef<HTMLButtonElement>(null);

  // som de dialogo novo a cada texto
  useEffect(() => {
    tocar(sons.dialogo);
  }, [texto, tocar]);
  // texto terminou: foca o botao para o Enter avancar
  useEffect(() => {
    if (pronto) btn.current?.focus({ preventScroll: true });
  }, [pronto]);

  // primeiro clique termina o texto; o segundo avanca
  const avancar = () => {
    if (!pronto) terminar();
    else onAvancar?.();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center p-3">
      <div
        className="anim-slide-up pixel-panel pointer-events-auto flex w-full max-w-3xl items-stretch gap-3 p-3"
        onClick={() => !pronto && terminar()}
      >
        <div className="flex shrink-0 flex-col items-center justify-end gap-1">
          {autor === "ZULA" ? <Zula falando={!pronto} humor={humor} scale={4} /> : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-display text-[10px] text-wood-dark">{autor}</p>
          {/* leitor de tela recebe o texto inteiro; a versao que digita fica escondida dele */}
          <p className="sr-only" aria-live="polite">
            {texto}
          </p>
          <p aria-hidden className="min-h-[3.6em] text-lg leading-snug">
            {visivel}
            {!pronto && <span className="anim-blink">▌</span>}
          </p>
          {extra}
          {onAvancar && (
            <div className="flex justify-end">
              <button ref={btn} type="button" className="pixel-btn btn-gold" onClick={avancar}>
                {pronto ? rotulo : "…"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
