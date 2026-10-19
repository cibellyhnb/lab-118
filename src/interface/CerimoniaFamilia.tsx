import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { familiaPorId, membros, type Categoria } from "@/motor";
import { Confete } from "./Celebracao";
import { Dialogo } from "./Dialogo";
import { Emblema } from "./Emblema";
import { sons, useProgresso } from "./store";

/** Posição de cada runa (símbolo de elemento) em volta do brasão: anel de dentro e anel de fora. */
function posicoes(n: number): { ux: number; uy: number; anel: 1 | 2 }[] {
  const dentro = Math.min(n, 14);
  const fora = n - dentro;
  const lista: { ux: number; uy: number; anel: 1 | 2 }[] = [];
  for (let i = 0; i < dentro; i++) {
    const a = (i / dentro) * Math.PI * 2 - Math.PI / 2;
    lista.push({ ux: Math.cos(a), uy: Math.sin(a), anel: 1 });
  }
  for (let i = 0; i < fora; i++) {
    const a = ((i + 0.5) / fora) * Math.PI * 2 - Math.PI / 2;
    lista.push({ ux: Math.cos(a), uy: Math.sin(a), anel: 2 });
  }
  return lista;
}

/**
 * Cerimônia de família completa, no estilo RPG:
 * 1) escurece e os raios de luz giram; 2) os símbolos dos elementos voam para o centro;
 * 3) flash, o brasão da família sobe e o título aparece; 4) a Zula conta curiosidades e convida para o quiz.
 */
export function CerimoniaFamilia({ familia, onFechar }: { familia: Categoria; onFechar: () => void }) {
  const { tocar } = useProgresso();
  const info = familiaPorId(familia);
  const lista = useMemo(() => membros(familia), [familia]);
  const pos = useMemo(() => posicoes(lista.length), [lista.length]);
  const [fase, setFase] = useState(0); // 0 raios · 1 runas voam · 2 brasão e título · 3 diálogo
  const [pagina, setPagina] = useState(0);
  const total = 1 + info.fatos.length + 1;

  useEffect(() => {
    const t1 = window.setTimeout(() => setFase(1), 500);
    const t2 = window.setTimeout(() => {
      setFase(2);
      tocar(sons.fanfarra);
    }, 2700);
    const t3 = window.setTimeout(() => setFase(3), 4600);
    return () => [t1, t2, t3].forEach((t) => window.clearTimeout(t));
  }, [tocar]);

  const pular = () => {
    setFase(3);
  };

  const texto =
    pagina === 0
      ? `Incrível! Você reuniu todos os ${info.nome}: ${lista.length} ${lista.length === 1 ? "elemento descoberto" : "elementos descobertos"}. Eles ficam ${info.onde}.`
      : pagina <= info.fatos.length
        ? `Você sabia? ${info.fatos[pagina - 1]}`
        : "Que tal testar o que aprendeu? São só 5 perguntinhas, e ninguém aqui vai pegar você de surpresa.";
  const ultima = pagina === total - 1;
  const cor = `var(--cat-${familia})`;

  return (
    <div role="dialog" aria-modal="true" aria-label={`Família completa: ${info.titulo}`} className="fixed inset-0 z-[60] overflow-hidden" style={{ background: "color-mix(in oklab, var(--ink) 97%, transparent)" }}>
      {/* raios de luz girando atrás do brasão */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[46%] h-[170vmax] w-[170vmax] -translate-x-1/2 -translate-y-1/2">
        <div
          className="anim-raios h-full w-full"
          style={{
            background: `repeating-conic-gradient(from 0deg, color-mix(in oklab, ${cor} 32%, transparent) 0deg 7deg, transparent 7deg 22deg)`,
            maskImage: "radial-gradient(circle, black 0%, transparent 38%)",
            WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 38%)",
          }}
        />
      </div>

      {/* estrelinhas ao fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 26 }, (_, i) => (
          <span
            key={i}
            className="anim-twinkle absolute block bg-cloud"
            style={{ left: `${(i * 37 + 11) % 97}%`, top: `${(i * 53 + 7) % 83}%`, width: i % 3 === 0 ? 4 : 2, height: i % 3 === 0 ? 4 : 2, animationDelay: `${(i % 7) * 300}ms` }}
          />
        ))}
      </div>

      {fase < 3 && (
        <button type="button" className="pixel-btn btn-parchment absolute right-3 top-3 z-10 text-xs" onClick={pular}>
          PULAR ▶▶
        </button>
      )}

      {/* título */}
      {fase >= 2 && (
        <div className="anim-slide-up absolute inset-x-0 top-[5%] z-10 flex flex-col items-center gap-2 px-4 text-center">
          <p className="font-display text-[10px] text-gold sm:text-xs">★ FAMÍLIA COMPLETA ★</p>
          <h2 className="font-display text-base leading-snug text-parchment sm:text-2xl" style={{ textShadow: `3px 3px 0 ${cor}, 5px 5px 0 var(--ink)` }}>
            {info.titulo.toUpperCase()}
          </h2>
          <p className="font-display text-[9px] text-parchment-shade sm:text-[10px]">{info.nome.toUpperCase()}</p>
        </div>
      )}

      {/* palco central: brasão e runas */}
      <div className="absolute left-1/2 top-[46%] h-0 w-0" style={{ ["--r" as string]: "min(40vw, 185px, 26vh)" }}>
        {fase >= 1 &&
          lista.map((el, i) => {
            const p = pos[i]!;
            const raio = p.anel === 1 && lista.length > 14 ? "calc(var(--r) * 0.76)" : "var(--r)";
            return (
              <span
                key={el.z}
                className="anim-voar absolute flex h-7 w-7 items-center justify-center border-[3px] border-ink sm:h-9 sm:w-9"
                style={{
                  left: `calc(${raio} * ${p.ux.toFixed(3)})`,
                  top: `calc(${raio} * ${p.uy.toFixed(3)})`,
                  translate: "-50% -50%",
                  background: cor,
                  boxShadow: "inset 0 -3px 0 color-mix(in oklab, " + cor + " 60%, black)",
                  animationDelay: `${(i * 70) % 1800}ms`,
                  ["--sx" as string]: `${(p.ux * 520).toFixed(0)}px`,
                  ["--sy" as string]: `${(p.uy * 520).toFixed(0)}px`,
                }}
                aria-hidden
              >
                <span className="font-display text-[8px] text-ink sm:text-[10px]">{el.simbolo}</span>
              </span>
            );
          })}

        {fase >= 2 && (
          <>
            <div aria-hidden className="anim-flash pointer-events-none fixed inset-0 bg-cloud" />
            <Confete />
            <div className="anim-subir absolute -left-[4.5rem] -top-[5.2rem] sm:-left-[5.6rem] sm:-top-[6.4rem]">
              <Emblema familia={familia} scale={1} className="anim-brilho h-[10.4rem] w-[9rem] sm:h-[12.8rem] sm:w-[11.2rem]" />
            </div>
          </>
        )}
      </div>

      {fase >= 3 && (
        <Dialogo
          texto={texto}
          rotulo="PRÓXIMO ▶"
          onAvancar={ultima ? undefined : () => setPagina((p) => p + 1)}
          extra={
            ultima ? (
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" className="pixel-btn btn-parchment" onClick={onFechar}>
                  AGORA NÃO
                </button>
                <Link to="/quiz" search={{ familia }} className="pixel-btn btn-gold" onClick={onFechar}>
                  FAZER O QUIZ ▶
                </Link>
              </div>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
