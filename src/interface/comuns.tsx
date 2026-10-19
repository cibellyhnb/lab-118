import { Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties } from "react";
import { C, CLOUD, PixelArt, SOUND_OFF, SOUND_ON, Star } from "./PixelArt";
import { BotaoAjuda } from "./Ajuda";
import { useProgresso } from "./store";

export function catStyle(categoria: string): CSSProperties {
  return { ["--cat" as string]: `var(--cat-${categoria})` };
}

/** Botão de tela cheia (Esc ou o mesmo botão para sair). Some sozinho se o navegador não suportar. */
export function TelaCheia() {
  const [cheia, setCheia] = useState(false);
  useEffect(() => {
    const f = () => setCheia(!!document.fullscreenElement);
    f();
    document.addEventListener("fullscreenchange", f);
    return () => document.removeEventListener("fullscreenchange", f);
  }, []);
  if (typeof document !== "undefined" && !document.documentElement.requestFullscreen) return null;
  const alternar = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  };
  return (
    <button type="button" onClick={alternar} className="pixel-btn btn-parchment" aria-pressed={cheia} title={cheia ? "Sair da tela cheia (Esc)" : "Tela cheia"}>
      {cheia ? "SAIR DA TELA CHEIA" : "TELA CHEIA"}
    </button>
  );
}

export function SoundToggle() {
  const { estado, alternarSom } = useProgresso();
  const on = estado.config.som;
  return (
    <button
      type="button"
      onClick={alternarSom}
      className="pixel-btn btn-parchment flex items-center gap-2"
      aria-pressed={on}
      aria-label={on ? "Desligar som" : "Ligar som"}
    >
      <PixelArt rows={on ? SOUND_ON : SOUND_OFF} scale={2} palette={{ k: C.ink, g: C.shade }} />
      <span>{on ? "SOM" : "MUDO"}</span>
    </button>
  );
}

export function Stars({ estrelas, scale = 3, animar = [] }: { estrelas: boolean[]; scale?: number; animar?: number[] }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${estrelas.filter(Boolean).length} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={animar.includes(i + 1) ? "anim-coin inline-block" : "inline-block"} style={{ animationDelay: `${i * 120}ms` }}>
          <Star filled={!!estrelas[i]} scale={scale} />
        </span>
      ))}
    </span>
  );
}

export function Clouds() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {[
        { top: "12%", delay: "0s", s: 4 },
        { top: "48%", delay: "-22s", s: 3 },
        { top: "26%", delay: "-41s", s: 5 },
      ].map((c, i) => (
        <div key={i} className="anim-drift absolute left-0" style={{ top: c.top, animationDelay: c.delay }}>
          <PixelArt rows={CLOUD} scale={c.s} palette={{ k: C.ink, w: C.cloud, s: C.sky }} />
        </div>
      ))}
    </div>
  );
}

/** Volta para a tela de onde o jogador veio (início, mapa…). Se não houver histórico (abriu direto por link), vai para o mapa. */
function BotaoVoltar() {
  const router = useRouter();
  const podeVoltar = useCanGoBack();
  const navegar = useNavigate();
  return (
    <button type="button" className="pixel-btn btn-parchment" onClick={() => (podeVoltar ? router.history.back() : void navegar({ to: "/mapa" }))}>
      ◀ VOLTAR
    </button>
  );
}

export function TopBar({ titulo, compacto = false }: { titulo: string; compacto?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <BotaoVoltar />
      <h1 className={`font-display text-sm text-parchment sm:text-base ${compacto ? "hidden sm:block" : ""}`}>{titulo}</h1>
      <div className="flex gap-2">
        <BotaoAjuda />
        <SoundToggle />
      </div>
    </div>
  );
}
