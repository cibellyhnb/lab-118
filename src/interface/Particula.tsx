// Partículas desenhadas em pixels (10x10). Cor + símbolo, para daltônicos.
export type TipoParticula = "p" | "n" | "e";

const N = 10;
const cells: { x: number; y: number; borda: boolean }[] = [];
const dentro = (x: number, y: number) => (x - 4.5) ** 2 + (y - 4.5) ** 2 <= 22;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++)
    if (dentro(x, y)) {
      const borda = !dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 1) || !dentro(x, y + 1);
      cells.push({ x, y, borda });
    }

const SIMBOLO: Record<TipoParticula, [number, number, number, number][]> = {
  p: [[4, 2, 2, 6], [2, 4, 6, 2]],
  e: [[2, 4, 6, 2]],
  n: [[3, 2, 4, 1], [3, 7, 4, 1], [3, 3, 1, 4], [6, 3, 1, 4]],
};
const COR: Record<TipoParticula, string> = { p: "var(--proton)", n: "var(--neutron)", e: "var(--electron)" };
const COR_SIMB: Record<TipoParticula, string> = { p: "var(--cloud)", n: "var(--ink)", e: "var(--cloud)" };

export const NOME_PARTICULA: Record<TipoParticula, string> = { p: "Próton", n: "Nêutron", e: "Elétron" };

function Corpo({ tipo }: { tipo: TipoParticula }) {
  return (
    <>
      {cells.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width={1} height={1} fill={c.borda ? "var(--ink)" : COR[tipo]} />
      ))}
      <rect x={2} y={2} width={1} height={1} fill="var(--cloud)" opacity={0.7} />
      {SIMBOLO[tipo].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={COR_SIMB[tipo]} />
      ))}
    </>
  );
}

/** Definições para usar com <use href="#part-p" />. */
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

export function ParticleSprite({ tipo, size = 40 }: { tipo: TipoParticula; size?: number }) {
  return (
    <svg viewBox="0 0 10 10" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      <Corpo tipo={tipo} />
    </svg>
  );
}
