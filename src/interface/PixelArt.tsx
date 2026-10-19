/*******************************************************************************
 * PixelArt.tsx
 * funcao principal: desenha pixel art em SVG a partir de linhas de texto,
 * e guarda as cores e os desenhos pequenos usados no jogo (estrela,
 * cadeado, nuvem, alto-falante).
 ******************************************************************************/
import type { CSSProperties } from "react";

/*******************************************************************************
 * PixelArt
 * funcao: desenha pixel art a partir de linhas de texto. cada caractere e
 * um pixel, com a cor que a paleta der para ele; "." e transparente.
 * recebe: rows (linhas), palette (caractere -> cor), scale (tamanho do
 * pixel), className, style e title (se tiver, vira imagem acessivel).
 * retorna: um <svg> com o desenho.
 ******************************************************************************/
export function PixelArt({
  rows,
  palette,
  scale = 3,
  className,
  style,
  title,
}: {
  rows: string[];
  palette: Record<string, string>;
  scale?: number;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  title?: string | undefined;
}) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  // junta pixels iguais vizinhos na mesma linha num retangulo so, para ter menos elementos
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x]!;
      // transparente ou sem cor na paleta: pula
      if (ch === "." || !palette[ch]) {
        x++;
        continue;
      }
      let len = 1;
      while (row[x + len] === ch) len++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={len} height={1} fill={palette[ch]} />);
      x += len;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {rects}
    </svg>
  );
}

// atalhos para as cores do tema (variaveis do css)
export const C = {
  ink: "var(--ink)",
  gold: "var(--gold)",
  parchment: "var(--parchment)",
  shade: "var(--parchment-shade)",
  cloud: "var(--cloud)",
  sky: "var(--sky-light)",
  wood: "var(--wood)",
  woodDark: "var(--wood-dark)",
  panel: "var(--panel)",
  proton: "var(--proton)",
  neutron: "var(--neutron)",
  electron: "var(--electron)",
};

// desenhos pequenos: k = contorno, g = preenchimento, w = branco, s = sombra
export const STAR = ["...k...", "..kgk..", "kkkgkkk", "kgggggk", ".kgggk.", ".kgkgk.", "kk...kk"];
export const LOCK = ["..kkk..", ".k...k.", ".k...k.", "kkkkkkk", "kgggggk", "kggkggk", "kgggggk", "kkkkkkk"];
export const CLOUD = [
  "......kkkk......",
  "....kkwwwwk.....",
  "..kkwwwwwwwkkk..",
  ".kwwwwwwwwwwwwk.",
  "kwwwwwwwwwwwwssk",
  ".kkssssssssssskk",
  "...kkkkkkkkkkk..",
];
export const SOUND_ON = ["...k....", "..kk..k.", "kkgk.k.k", "kggk.k.k", "kggk.k.k", "kkgk.k.k", "..kk..k.", "...k...."];
export const SOUND_OFF = ["...k....", "..kk....", "kkgk.k.k", "kggk..k.", "kggk..k.", "kkgk.k.k", "..kk....", "...k...."];

/*******************************************************************************
 * Star
 * funcao: uma estrela de pixel art, dourada se ganha e apagada se nao.
 * recebe: filled, scale e className.
 * retorna: a estrela.
 ******************************************************************************/
export function Star({ filled, scale = 3, className }: { filled: boolean; scale?: number; className?: string | undefined }) {
  return (
    <PixelArt
      rows={STAR}
      scale={scale}
      className={className}
      palette={{ k: C.ink, g: filled ? C.gold : C.panel }}
    />
  );
}
