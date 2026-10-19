// "LAB 118" desenhado pixel a pixel (a fonte do jogo deixava o 8 parecido com um S).
const G: Record<string, string[]> = {
  L: ["XX.....", "XX.....", "XX.....", "XX.....", "XX.....", "XX.....", "XXXXXX."],
  A: [".XXXXX.", "XX...XX", "XX...XX", "XXXXXXX", "XX...XX", "XX...XX", "XX...XX"],
  B: ["XXXXXX.", "XX...XX", "XX...XX", "XXXXXX.", "XX...XX", "XX...XX", "XXXXXX."],
  "1": ["..XX...", ".XXX...", "..XX...", "..XX...", "..XX...", "..XX...", ".XXXXXX"],
  "8": [".XXXXX.", "XX...XX", "XX...XX", ".XXXXX.", "XX...XX", "XX...XX", ".XXXXX."],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};

function montar(texto: string): string[] {
  return Array.from({ length: 7 }, (_, y) => [...texto].map((c) => G[c]![y]!).join("."));
}

const LINHAS = montar("LAB 118");

/** Título do jogo em pixel art, com sombra. O tamanho vem da largura (className). */
export function TituloLab({ className, cor = "var(--gold)", sombra = "var(--wood-dark)" }: { className?: string; cor?: string; sombra?: string }) {
  const w = LINHAS[0]!.length;
  const rects = (dx: number, dy: number, fill: string, k: string) =>
    LINHAS.flatMap((linha, y) => {
      const out: React.ReactNode[] = [];
      let x = 0;
      while (x < linha.length) {
        if (linha[x] !== "X") {
          x++;
          continue;
        }
        let len = 1;
        while (linha[x + len] === "X") len++;
        out.push(<rect key={`${k}${x}-${y}`} x={x * 2 + dx} y={y * 2 + dy} width={len * 2} height={2} fill={fill} />);
        x += len;
      }
      return out;
    });
  return (
    <svg viewBox={`0 0 ${w * 2 + 2} ${7 * 2 + 2}`} shapeRendering="crispEdges" role="img" aria-label="Lab 118" className={`h-auto ${className ?? ""}`}>
      {rects(1, 1, sombra, "s")}
      {rects(0, 0, cor, "c")}
    </svg>
  );
}
