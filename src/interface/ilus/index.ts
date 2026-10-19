import { AJUSTES2 } from "./ajustes2";
import { AJUSTES } from "./ajustes";
import { ILUSTRACOES } from "./mapa";
import { PARTE1 } from "./parte1";
import { PARTE2 } from "./parte2";
import { PARTE3 } from "./parte3";

const SPRITES: Record<string, string[]> = { ...PARTE1, ...PARTE2, ...PARTE3, ...AJUSTES, ...AJUSTES2 };

export { PALETA_ILUS } from "./paleta";

/** Desenho (linhas de pixels) e legenda do elemento, ou null se ele não tiver ilustração. */
export function ilustracaoDe(z: number): { rows: string[]; rotulo: string } | null {
  const i = ILUSTRACOES[z];
  const rows = i ? SPRITES[i.sprite] : undefined;
  if (!i || !rows) return null;
  const larg = Math.max(...rows.map((r) => r.length));
  return { rows: rows.map((r) => r.padEnd(larg, ".")), rotulo: i.rotulo };
}
