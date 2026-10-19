import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { NOME_CATEGORIA, elementoPorZ } from "@/motor";
import { Stars, catStyle } from "./comuns";
import { useProgresso } from "./store";

const CORES = ["var(--gold)", "var(--proton)", "var(--electron)", "var(--cat-nao_metal)", "var(--cat-gas_nobre)", "var(--cloud)"];

export function Confete() {
  return (
    <div aria-hidden className="pointer-events-none fixed left-1/2 top-1/3 z-50">
      {Array.from({ length: 48 }, (_, i) => {
        const ang = (i / 48) * Math.PI * 2;
        const dist = 120 + ((i * 37) % 180);
        return (
          <span
            key={i}
            className="anim-confetti absolute block"
            style={{
              width: 6 + (i % 3) * 3,
              height: 6 + (i % 3) * 3,
              background: CORES[i % CORES.length],
              boxShadow: "0 0 0 2px var(--ink)",
              ["--dx" as string]: `${Math.cos(ang) * dist}px`,
              ["--dy" as string]: `${Math.sin(ang) * dist + 140}px`,
              animationDelay: `${(i % 6) * 30}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export function Celebracao({ z, mensagem, onFechar }: { z: number; mensagem: string; onFechar: () => void }) {
  const el = elementoPorZ(z);
  const { estado } = useProgresso();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  if (!el) return null;
  const est = estado.elementos[String(z)]?.estrelas ?? [false, false, false];
  return (
    <div role="dialog" aria-modal="true" aria-label={`Descoberta: ${el.nome}`} className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "color-mix(in oklab, var(--ink) 75%, transparent)" }}>
      <Confete />
      <div className="anim-flip pixel-panel w-full max-w-sm overflow-hidden">
        <div className="pixel-block block-open flex flex-col items-center gap-2 p-6" style={catStyle(el.categoria)}>
          <p className="font-display text-[10px]">NOVO ELEMENTO!</p>
          <p className="font-display text-5xl">{el.simbolo}</p>
          <p className="font-display text-sm">{el.nome}</p>
          <p className="text-sm">
            Z = {el.z} · {NOME_CATEGORIA[el.categoria]}
          </p>
          <Stars estrelas={est} scale={4} animar={[1]} />
        </div>
        <div className="flex flex-col gap-3 p-4">
          <p>{mensagem}</p>
          <div className="flex flex-wrap gap-2">
            <Link to="/elemento/$z" params={{ z: String(z) }} className="pixel-btn btn-gold">
              VER FICHA
            </Link>
            <button ref={btn} type="button" className="pixel-btn btn-sky" onClick={onFechar}>
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
