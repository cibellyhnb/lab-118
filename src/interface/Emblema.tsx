/*******************************************************************************
 * Emblema.tsx
 * funcao principal: brasao de cada familia, um escudo de pixel art na cor
 * da familia com um icone no meio. o escudo e montado em codigo.
 ******************************************************************************/
import type { Categoria } from "@/motor";
import { PixelArt } from "./PixelArt";

// icones 9x9 de cada familia. "w" e a parte clara, "k" e detalhe escuro. cada um
// lembra algo do dia a dia daquela familia
const ICONES: Record<Categoria, string[]> = {
  // raio: reatividade e baterias de litio
  metal_alcalino: [".....www.", "....www..", "...www...", "..wwwwww.", ".wwwwww..", "....www..", "...www...", "..ww.....", "..w......"],
  // dente: o calcio
  metal_alcalino_terroso: [".wwwwwww.", "wwwwwwwww", "wwwwwwwww", "wwwwwwwww", ".wwwwwww.", ".www.www.", ".ww...ww.", ".ww...ww.", "..w...w.."],
  // engrenagem: os metais que constroem
  metal_transicao: ["....w....", ".ww.w.ww.", ".wwwwwww.", "..ww.ww..", "wwww.wwww", "..ww.ww..", ".wwwwwww.", ".ww.w.ww.", "....w...."],
  // bigorna: quem constroi e molda
  metal_representativo: ["wwwwwwww.", "wwwwwwwww", "wwwwwwww.", ".wwwwww..", "..wwww...", "...www...", "...www...", ".wwwwwww.", "wwwwwwwww"],
  // chip de silicio
  semimetal: ["..w.w.w..", ".wwwwwww.", "wwwwwwwww", ".wwkkkww.", "wwwkkkwww", ".wwkkkww.", "wwwwwwwww", ".wwwwwww.", "..w.w.w.."],
  // folha: a vida
  nao_metal: [".......ww", ".....wwww", "...wwwwww", "..wwwwwww", "..wwwwww.", "..wwwww..", ".wwww....", "wwk......", "w........"],
  // gota: agua tratada
  halogenio: ["....w....", "....w....", "...www...", "...www...", "..wwwww..", ".wwwwwww.", ".wwwwwww.", ".wwwwwww.", "..wwwww.."],
  // lampada: luz de neonio
  gas_nobre: ["..wwwww..", ".wwwwwww.", "wwwwwwwww", "wwwwwwwww", "wwwkwkwww", ".wwwkwww.", "..wwwww..", "...www...", "...kkk..."],
  // ima: os imas de neodimio
  lantanideo: ["kkk...kkk", "kkk...kkk", "www...www", "www...www", "www...www", "www...www", ".www.www.", "..wwwww..", "...www..."],
  // cristal: brilho radioativo
  actinideo: ["....w....", "...www...", "..wwwww..", ".wwwwwww.", "wwwwwwwww", ".wwwwwww.", "..wwwww..", "...www...", "....w...."],
};

// tamanho do escudo em pixels
const LARGURA = 15;
const ALTURA = 17;

// meia largura do escudo em cada linha (0 = linha vazia). topo reto com cantos
// cortados e ponta embaixo
const META = [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1];

/*******************************************************************************
 * montarEscudo
 * funcao: desenha o escudo linha a linha: contorno escuro, luz na
 * esquerda e no topo, sombra na direita e embaixo, e o icone com sombrinha.
 * recebe: cat (Categoria).
 * retorna: as linhas do desenho em texto, no formato do PixelArt.
 ******************************************************************************/
function montarEscudo(cat: Categoria): string[] {
  // diz se o pixel (x, y) fica dentro do escudo; 7 e a coluna do meio
  const dentro = (x: number, y: number) => {
    if (y < 0 || y >= ALTURA || x < 0 || x >= LARGURA) return false;
    return Math.abs(x - 7) <= META[y]!;
  };
  const icone = ICONES[cat];
  const grade: string[][] = [];
  for (let y = 0; y < ALTURA; y++) {
    const linha: string[] = [];
    for (let x = 0; x < LARGURA; x++) {
      // fora: transparente; borda: contorno; dentro: luz (l), sombra (s) ou cor (g)
      if (!dentro(x, y)) linha.push(".");
      else if (!dentro(x - 1, y) || !dentro(x + 1, y) || !dentro(x, y - 1) || !dentro(x, y + 1)) linha.push("k");
      else linha.push(x <= 2 || y <= 1 ? "l" : x >= 12 || y >= 12 ? "s" : "g");
    }
    grade.push(linha);
  }
  // icone centralizado, com sombrinha escura embaixo a direita: primeiro pinta a
  // sombra deslocada 1 pixel, depois o icone por cima
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

/*******************************************************************************
 * EMBLEMAS
 * funcao: os desenhos prontos de todos os brasoes, montados uma vez so.
 ******************************************************************************/
export const EMBLEMAS: Record<Categoria, string[]> = Object.fromEntries(
  (Object.keys(ICONES) as Categoria[]).map((c) => [c, montarEscudo(c)]),
) as Record<Categoria, string[]>;

/*******************************************************************************
 * Emblema
 * funcao: brasao da familia, um escudo pixelado na cor dela com o icone no
 * meio.
 * recebe: familia, scale (tamanho do pixel), apagado (versao cinza, para
 * familia ainda incompleta) e className.
 * retorna: o brasao em pixel art.
 ******************************************************************************/
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
  // apagado usa tons neutros; normal mistura a cor da familia com branco e preto
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
