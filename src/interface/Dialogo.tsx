import { useEffect, useRef, useState } from "react";
import { Zula, type Humor } from "./Zula";
import { sons, useProgresso } from "./store";

function useDigitando(texto: string, aoFalar: (i: number) => void) {
  const [n, setN] = useState(0);
  const falar = useRef(aoFalar);
  falar.current = aoFalar;

  useEffect(() => {
    const reduzido = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      setN(texto.length);
      return;
    }
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

  useEffect(() => {
    if (n > 0 && n < texto.length && n % 2 === 0 && texto[n - 1] !== " ") falar.current(n);
  }, [n, texto]);

  return { visivel: texto.slice(0, n), pronto: n >= texto.length, terminar: () => setN(texto.length) };
}

/** Caixa de diálogo estilo RPG: retrato do ZULA, texto que "digita" e botão para avançar. */
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
  /** Sem `onAvancar`, a caixa só informa (o jogador precisa fazer algo na tela). */
  rotulo?: string;
  onAvancar?: (() => void) | undefined;
  extra?: React.ReactNode;
}) {
  const { tocar } = useProgresso();
  const { visivel, pronto, terminar } = useDigitando(texto, (i) => tocar(() => sons.fala(i)));
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    tocar(sons.dialogo);
  }, [texto, tocar]);
  useEffect(() => {
    if (pronto) btn.current?.focus({ preventScroll: true });
  }, [pronto]);

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
