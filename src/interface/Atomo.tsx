import { distribuirCamadas, type StatusNuclideo } from "@/motor";
import { ParticleDefs } from "./Particula";

const VB = 400;
const CX = VB / 2;

/** Núcleo + camadas. Desenho simplificado (modelo de camadas), não é uma órbita real. */
export function Atomo({
  p,
  n,
  e,
  status,
  wobbleKey,
}: {
  p: number;
  n: number;
  e: number;
  status: StatusNuclideo | null;
  wobbleKey: number;
}) {
  const total = p + n;
  const s = total <= 12 ? 22 : total <= 40 ? 16 : total <= 100 ? 11 : 8;
  const raioNucleo = total === 0 ? 26 : Math.max(26, s * Math.sqrt(total) * 0.62 + s * 0.7);

  // intercala prótons e nêutrons de forma determinística
  const nucleons: ("p" | "n")[] = [];
  for (let i = 0; i < total; i++) {
    const viraP = Math.floor(((i + 1) * p) / total) > Math.floor((i * p) / total);
    nucleons.push(viraP ? "p" : "n");
  }

  const camadas = p > 0 && p <= 118 ? distribuirCamadas(p, Math.min(e, p + 3)) : e > 0 ? [e] : [];
  const rMax = VB / 2 - 14;
  const r0 = raioNucleo + 24;
  const passo = camadas.length > 1 ? Math.min(30, (rMax - r0) / (camadas.length - 1)) : 0;
  const tremor = status === "radioativo" || status === "nao_catalogado" ? "anim-jitter" : total ? "anim-jitter-slow" : "";

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full" shapeRendering="crispEdges" role="img" aria-label={`Átomo com ${p} prótons, ${n} nêutrons e ${e} elétrons`}>
      <ParticleDefs />
      {camadas.map((_, k) => (
        <circle key={k} cx={CX} cy={CX} r={r0 + k * passo} fill="none" stroke="var(--parchment-shade)" strokeWidth={3} strokeDasharray="6 6" opacity={0.75} />
      ))}
      <circle cx={CX} cy={CX} r={raioNucleo} fill="color-mix(in oklab, var(--gold) 20%, var(--night))" stroke="var(--ink)" strokeWidth={3} />
      <g key={wobbleKey} className="anim-wobble" style={{ transformOrigin: "center", transformBox: "view-box" }}>
        <g className={tremor} style={{ transformOrigin: "center", transformBox: "view-box" }}>
          {nucleons.map((t, i) => {
            const r = s * 0.62 * Math.sqrt(i);
            const a = i * 2.39996;
            return <use key={i} href={`#part-${t}`} x={CX + r * Math.cos(a) - s / 2} y={CX + r * Math.sin(a) - s / 2} width={s} height={s} />;
          })}
        </g>
      </g>
      {camadas.map((qtd, k) => {
        const r = r0 + k * passo;
        const tam = 16;
        return (
          <g key={`e${k}`} className="anim-orbit" style={{ ["--orbit-dur" as string]: `${10 + k * 5}s`, animationDirection: k % 2 ? "reverse" : "normal" }}>
            {Array.from({ length: qtd }, (_, j) => {
              const a = (j / qtd) * Math.PI * 2 + k * 0.4;
              return <use key={j} href="#part-e" x={CX + r * Math.cos(a) - tam / 2} y={CX + r * Math.sin(a) - tam / 2} width={tam} height={tam} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}
