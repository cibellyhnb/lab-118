import type { Categoria } from "@/motor";
import { PixelArt } from "./PixelArt";

// Ícones 9×9 de cada família. "w" é a parte clara, "k" é detalhe escuro. Cada um lembra algo do dia a dia daquela família.
const ICONES: Record<Categoria, string[]> = {
  // raio: reatividade e baterias de lítio
  metal_alcalino: [".....www.", "....www..", "...www...", "..wwwwww.", ".wwwwww..", "....www..", "...www...", "..ww.....", "..w......"],
  // dente: o cálcio
  metal_alcalino_terroso: [".wwwwwww.", "wwwwwwwww", "wwwwwwwww", "wwwwwwwww", ".wwwwwww.", ".www.www.", ".ww...ww.", ".ww...ww.", "..w...w.."],
  // engrenagem: os metais que constroem
  metal_transicao: ["....w....", ".ww.w.ww.", ".wwwwwww.", "..ww.ww..", "wwww.wwww", "..ww.ww..", ".wwwwwww.", ".ww.w.ww.", "....w...."],
  // bigorna: quem constrói e molda
  metal_representativo: ["wwwwwwww.", "wwwwwwwww", "wwwwwwww.", ".wwwwww..", "..wwww...", "...www...", "...www...", ".wwwwwww.", "wwwwwwwww"],
  // chip de silício
  semimetal: ["..w.w.w..", ".wwwwwww.", "wwwwwwwww", ".wwkkkww.", "wwwkkkwww", ".wwkkkww.", "wwwwwwwww", ".wwwwwww.", "..w.w.w.."],
  // folha: a vida
  nao_metal: [".......ww", ".....wwww", "...wwwwww", "..wwwwwww", "..wwwwww.", "..wwwww..", ".wwww....", "wwk......", "w........"],
  // gota: água tratada
  halogenio: ["....w....", "....w....", "...www...", "...www...", "..wwwww..", ".wwwwwww.", ".wwwwwww.", ".wwwwwww.", "..wwwww.."],
  // lâmpada: luz de neônio
  gas_nobre: ["..wwwww..", ".wwwwwww.", "wwwwwwwww", "wwwwwwwww", "wwwkwkwww", ".wwwkwww.", "..wwwww..", "...www...", "...kkk..."],
  // ímã: os ímãs de neodímio
  lantanideo: ["kkk...kkk", "kkk...kkk", "www...www", "www...www", "www...www", "www...www", ".www.www.", "..wwwww..", "...www..."],
  // cristal: brilho radioativo
  actinideo: ["....w....", "...www...", "..wwwww..", ".wwwwwww.", "wwwwwwwww", ".wwwwwww.", "..wwwww..", "...www...", "....w...."],
};

const LARGURA = 15;
const ALTURA = 17;

/** Meia largura do escudo em cada linha (0 = linha vazia). Topo reto com cantos cortados e ponta embaixo. */
const META = [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1];

function montarEscudo(cat: Categoria): string[] {
  const dentro = (x: number, y: number) => {
    if (y < 0 || y >= ALTURA || x < 0 || x >= LARGURA) return false;
    return Math.abs(x - 7) <= META[y]!;
  };
  const icone = ICONES[cat];
  const grade: string[][] = [];
  for (let y = 0; y < ALTURA; y++) {
    const linha: string[] = [];
    for (let x = 0; x < LARGURA; x++) {
      if (!dentro(x, y)) linha.push(".");
      else if (!dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 1) || !dentro(x, y + 1)) linha.push("k");
      else linha.push(x <= 2 || y <= 1 ? "l" : x >= 12 || y >= 12 ? "s" : "g");
    }
    grade.push(linha);
  }
  // ícone centralizado, com sombrinha escura embaixo à direita
  const ox = 3;
  const oy = 3;
  icone.forEach((linha, y) =>
    [...linha].forEach((c, x) => {
      if (c !== "w") return;
      const sx = ox + x + 1;
      const sy = oy + y + 1;
      if (grade[sy]?.[sx] && grade[sy]![sx] !== "k") grade[sy]![sx] = "k";
    }),
  );
  icone.forEach((linha, y) =>
    [...linha].forEach((c, x) => {
      if (c === "w") grade[oy + y]![ox + x] = "w";
      if (c === "k") grade[oy + y]![ox + x] = "k";
    }),
  );
  return grade.map((l) => l.join(""));
}

export const EMBLEMAS: Record<Categoria, string[]> = Object.fromEntries(
  (Object.keys(ICONES) as Categoria[]).map((c) => [c, montarEscudo(c)]),
) as Record<Categoria, string[]>;

/** Brasão da família: um escudo pixelado na cor da família com o ícone dela no meio. */
export function Emblema({
  familia,
  scale = 4,
  apagado = false,
  className,
}: {
  familia: Categoria;
  scale?: number;
  apagado?: boolean;
  className?: string;
}) {
  const cor = `var(--cat-${familia})`;
  const palette = apagado
    ? { k: "var(--ink)", g: "var(--panel)", l: "var(--parchment-shade)", s: "var(--night)", w: "var(--parchment-shade)" }
    : {
        k: "var(--ink)",
        g: cor,
        l: `color-mix(in oklab, ${cor} 55%, white)`,
        s: `color-mix(in oklab, ${cor} 62%, black)`,
        w: "var(--cloud)",
      };
  return <PixelArt rows={EMBLEMAS[familia]} palette={palette} scale={scale} className={className} style={apagado ? { opacity: 0.6 } : undefined} />;
}
