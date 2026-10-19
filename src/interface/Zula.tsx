import { useEffect, useState } from "react";
import { C, PixelArt } from "./PixelArt";

// ZULA, o robô-assistente do Laboratório Atômico (personagem original). O "Z" é de número atômico.
// Cabeça 16x16: w = metal claro, s = sombra, k = contorno, c = brilho da tela, r = luz da antena.
const TOPO = [
  "................",
  "......wwww......",
  "......wrrw......",
  "......wwww......",
  ".......ww.......",
  "..kkkkkkkkkkkk..",
  ".kwwwwwwwwwwwsk.",
];
const lado = (miolo: string) => ".kww" + miolo + "ssk.";
const MIOLOS: Record<"normal" | "pisca" | "fala" | "feliz", string[]> = {
  normal: ["kkkkkkkk", "kcckkcck", "kcckkcck", "kkkkkkkk", "kckkkkck", "kkcccckk", "kkkkkkkk"],
  pisca: ["kkkkkkkk", "kkkkkkkk", "kcckkcck", "kkkkkkkk", "kckkkkck", "kkcccckk", "kkkkkkkk"],
  fala: ["kkkkkkkk", "kcckkcck", "kcckkcck", "kkkkkkkk", "kkcccckk", "kkcccckk", "kkkkkkkk"],
  feliz: ["kkkkkkkk", "kcckkcck", "kkkkkkkk", "kkkkkkkk", "kckkkkck", "kkcccckk", "kkkkkkkk"],
};
const ROSTO = {
  normal: MIOLOS.normal.map(lado),
  pisca: MIOLOS.pisca.map(lado),
  fala: MIOLOS.fala.map(lado),
  feliz: MIOLOS.feliz.map(lado),
};
const BASE = [".kssssssssssssk.", "..kkkkkkkkkkkk.."];

export type Humor = keyof typeof ROSTO;

export function linhasZula(humor: Humor): string[] {
  return [...TOPO, ...ROSTO[humor], ...BASE];
}

const PALETA = { k: C.ink, w: C.cloud, s: "var(--parchment-shade)", c: "var(--sky-light)", r: "var(--proton)" };

/** Sprite do ZULA. `falando` alterna a boca; pisca sozinho de tempos em tempos. */
export function Zula({
  falando = false,
  humor = "normal",
  className,
  scale = 4,
}: {
  falando?: boolean;
  humor?: Humor;
  className?: string;
  scale?: number;
}) {
  const [pisca, setPisca] = useState(false);
  const [boca, setBoca] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPisca(true);
      window.setTimeout(() => setPisca(false), 160);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!falando) {
      setBoca(false);
      return;
    }
    const id = window.setInterval(() => setBoca((b) => !b), 140);
    return () => window.clearInterval(id);
  }, [falando]);

  const atual: Humor = falando && boca ? "fala" : pisca ? "pisca" : humor;
  return <PixelArt rows={linhasZula(atual)} palette={PALETA} scale={scale} className={className} title="ZULA, o robô-assistente" />;
}
