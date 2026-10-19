import bruto from "../dados/elements.json";
import type { Categoria, Elemento } from "./tipos";

export const ELEMENTOS: Elemento[] = bruto as unknown as Elemento[];

const porZ = new Map<number, Elemento>(ELEMENTOS.map((el) => [el.z, el]));

export function elementoPorZ(z: number): Elemento | undefined {
  return porZ.get(z);
}

export const NOME_CATEGORIA: Record<Categoria, string> = {
  metal_alcalino: "Metal alcalino",
  metal_alcalino_terroso: "Metal alcalino-terroso",
  metal_transicao: "Metal de transição",
  metal_representativo: "Metal representativo",
  semimetal: "Semimetal",
  nao_metal: "Não metal",
  halogenio: "Halogênio",
  gas_nobre: "Gás nobre",
  lantanideo: "Lantanídeo",
  actinideo: "Actinídeo",
};

export const SIGLA_CATEGORIA: Record<Categoria, string> = {
  metal_alcalino: "AL",
  metal_alcalino_terroso: "AT",
  metal_transicao: "MT",
  metal_representativo: "MR",
  semimetal: "SM",
  nao_metal: "NM",
  halogenio: "HA",
  gas_nobre: "GN",
  lantanideo: "LA",
  actinideo: "AC",
};
