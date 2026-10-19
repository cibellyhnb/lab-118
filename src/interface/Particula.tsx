/*******************************************************************************
 * Particula.tsx
 * funcao principal: desenho das particulas (proton, neutron, eletron) em
 * pixel art 10x10. cada uma tem cor e simbolo, para daltonicos
 * distinguirem.
 ******************************************************************************/
export type TipoParticula = "p" | "n" | "e";

// monta uma vez os pixels do circulo e marca quais sao borda
const N = 10;
const cells: { x: number; y: number; borda: boolean }[] = [];
const dentro = (x: number, y: number) => (x - 4.5) ** 2 + (y - 4.5) ** 2 <= 22;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++)
    if (dentro(x, y)) {
      const borda = !dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 1) || !dentro(x, y + 1);
      cells.push({ x, y, borda });
    }

// retangulos [x, y, largura, altura] do simbolo: + no proton, - no eletron, 0 no neutron
const SIMBOLO: Record<TipoParticula, [number, number, number, number][]> = {
  p: [[4, 2, 2, 6], [2, 4, 6, 2]],
  e: [[2, 4, 6, 2]],
  n: [[3, 2, 4, 1], [3, 7, 4, 1], [3, 3, 1, 4], [6, 3, 1, 4]],
};
const COR: Record<TipoParticula, string> = { p: "var(--proton)", n: "var(--neutron)", e: "var(--electron)" };
const COR_SIMB: Record<TipoParticula, string> = { p: "var(--cloud)", n: "var(--ink)", e: "var(--cloud)" };

// nome de cada particula como aparece na tela
export const NOME_PARTICULA: Record<TipoParticula, string> = { p: "Próton", n: "Nêutron", e: "Elétron" };

/*******************************************************************************
 * Corpo
 * funcao: desenha a particula: circulo com contorno, brilho e simbolo.
 * recebe: tipo ("p", "n" ou "e").
 * retorna: os retangulos SVG, sem o <svg> em volta.
 ******************************************************************************/
function Corpo({ tipo }: { tipo: TipoParticula }) {
  return (
    <>
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.borda ? "var(--ink)" : COR[tipo]} />
      ))}
      {/* pontinho de brilho */}
      <rect x={2} y={2} width={1} height={1} fill="var(--cloud)" opacity={0.7} />
      {SIMBOLO[tipo].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={COR_SIMB[tipo]} />
      ))}
    </>
  );
}

/*******************************************************************************
 * ParticleDefs
 * funcao: define as tres particulas uma vez dentro de um SVG, para serem
 * reusadas com <use href="#part-p" />.
 * recebe: nada. retorna: o bloco <defs>.
 ******************************************************************************/
export function ParticleDefs() {
  return (
    <defs>
      {(["p", "n", "e"] as const).map((t) => (
        <symbol key={t} id={`part-${t}`} viewBox="0 0 10 10">
          <Corpo tipo={t} />
        </symbol>
      ))}
    </defs>
  );
}

/*******************************************************************************
 * ParticleSprite
 * funcao: uma particula sozinha num SVG proprio (botoes e legendas).
 * recebe: tipo e size (tamanho em pixels, padrao 40).
 * retorna: o <svg> da particula.
 ******************************************************************************/
export function ParticleSprite({ tipo, size = 40 }: { tipo: TipoParticula; size?: number }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      <Corpo tipo={tipo} />
    </svg>
  );
}
