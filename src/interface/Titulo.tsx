/*******************************************************************************
 * Titulo.tsx
 * funcao principal: desenha o titulo "LAB 118" pixel a pixel, porque a
 * fonte do jogo deixava o 8 parecido com um S.
 ******************************************************************************/
// letras 7x7 usadas no titulo; X e pixel aceso
const G: Record<string, string[]> = {
  L: ["XX.....", "XX.....", "XX.....", "XX.....", "XX.....", "XX.....", "XXXXXX."],
  A: [".XXXXX.", "XX...XX", "XX...XX", "XXXXXXX", "XX...XX", "XX...XX", "XX...XX"],
  B: ["XXXXXX.", "XX...XX", "XX...XX", "XXXXXX.", "XX...XX", "XX...XX", "XXXXXX."],
  "1": ["..XX...", ".XXX...", "..XX...", "..XX...", "..XX...", "..XX...", ".XXXXXX"],
  "8": [".XXXXX.", "XX...XX", "XX...XX", ".XXXXX.", "XX...XX", "XX...XX", ".XXXXX."],
  " ": ["...", "...", "...", "...", "...", "...", "..."],
};

/*******************************************************************************
 * montar
 * funcao: junta as letras do texto lado a lado, com uma coluna vazia
 * entre elas.
 * recebe: texto (so com letras que existem em G).
 * retorna: as 7 linhas do titulo inteiro.
 ******************************************************************************/
function montar(texto: string): string[] {
  return Array.from({ length: 7 }, (_, y) => [...texto].map((c) => G[c]![y]!).join("."));
}

// o titulo montado uma vez so
const LINHAS = montar("LAB 118");

/*******************************************************************************
 * TituloLab
 * funcao: titulo do jogo em pixel art, com sombra.
 * recebe: className (define a largura, e o tamanho vem dela), cor e sombra.
 * retorna: um <svg> com o titulo.
 ******************************************************************************/
export function TituloLab({ className, cor = "var(--gold)", sombra = "var(--wood-dark)" }: { className?: string; cor?: string; sombra?: string }) {
  const w = LINHAS[0]!.length;
  // desenha o titulo deslocado de (dx, dy); cada pixel vale 2 unidades e
  // pixels seguidos viram um retangulo so
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
      {/* sombra primeiro, um pixel abaixo e a direita; a cor vem por cima */}
      {rects(1, 1, sombra, "s")}
      {rects(0, 0, cor, "c")}
    </svg>
  );
}
