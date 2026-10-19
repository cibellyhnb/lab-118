/*******************************************************************************
 * Zula.tsx
 * funcao principal: sprite do Zula, o robo-assistente do jogo, que pisca
 * sozinho e mexe a boca enquanto fala.
 ******************************************************************************/
import { useEffect, useState } from "react";
import { C, PixelArt } from "./PixelArt";

// ZULA, robo-assistente do Laboratorio Atomico (personagem original). o "Z" e de numero atomico.
// cabeca 16x16: w = metal claro, s = sombra, k = contorno, c = brilho da tela, r = luz da antena
// antena e topo da cabeca
const TOPO = [
  "................",
  "......wwww......",
  "......wrrw......",
  "......wwww......",
  ".......ww.......",
  "..kkkkkkkkkkkk..",
  ".kwwwwwwwwwwwsk.",
];
// poe as bordas da cabeca em volta de cada linha do rosto
const lado = (miolo: string) => ".kww" + miolo + "ssk.";
// o rosto (tela) em cada expressao: olhos e boca
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
// parte de baixo da cabeca
const BASE = [".kssssssssssssk.", "..kkkkkkkkkkkk.."];

export type Humor = keyof typeof ROSTO;

/*******************************************************************************
 * linhasZula
 * funcao: monta o desenho inteiro do Zula numa expressao.
 * recebe: humor ("normal", "pisca", "fala" ou "feliz").
 * retorna: as linhas do desenho.
 ******************************************************************************/
export function linhasZula(humor: Humor): string[] {
  return [...TOPO, ...ROSTO[humor], ...BASE];
}

const PALETA = { k: C.ink, w: C.cloud, s: "var(--parchment-shade)", c: "var(--sky-light)", r: "var(--proton)" };

/*******************************************************************************
 * Zula
 * funcao: sprite do Zula. falando alterna a boca; pisca sozinho de tempos
 * em tempos.
 * recebe: falando, humor (expressao parada), className e scale.
 * retorna: o Zula em pixel art.
 ******************************************************************************/
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

  // piscada de 160 ms a cada 3,2 s
  useEffect(() => {
    const id = window.setInterval(() => {
      setPisca(true);
      window.setTimeout(() => setPisca(false), 160);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  // enquanto fala, abre e fecha a boca a cada 140 ms
  useEffect(() => {
    if (!falando) {
      setBoca(false);
      return;
    }
    const id = window.setInterval(() => setBoca((b) => !b), 140);
    return () => window.clearInterval(id);
  }, [falando]);

  // prioridade: boca aberta, depois piscada, depois o humor pedido
  const atual: Humor = falando && boca ? "fala" : pisca ? "pisca" : humor;
  return <PixelArt rows={linhasZula(atual)} palette={PALETA} scale={scale} className={className} title="ZULA, o robô-assistente" />;
}
