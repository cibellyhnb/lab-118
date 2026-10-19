/*******************************************************************************
 * dados.ts
 * funcao principal: carrega o elements.json com os 118 elementos e oferece a
 * busca por numero atomico e os nomes e siglas de cada familia.
 ******************************************************************************/
import bruto from "../dados/elements.json";
import type { Categoria, Elemento } from "./tipos";

/*******************************************************************************
 * ELEMENTOS
 * funcao: lista com todos os elementos, na ordem do JSON (Z crescente).
 ******************************************************************************/
export const ELEMENTOS: Elemento[] = bruto as unknown as Elemento[];

// mapa Z -> elemento, montado uma vez so para a busca ser direta
const porZ = new Map<number, Elemento>(ELEMENTOS.map((el) => [el.z, el]));

/*******************************************************************************
 * elementoPorZ
 * funcao: acha o elemento pelo numero atomico.
 * recebe: z (number).
 * retorna: o Elemento, ou undefined se o Z nao existir.
 ******************************************************************************/
export function elementoPorZ(z: number): Elemento | undefined {
  return porZ.get(z);
}

// nomes de elemento que pedem artigo feminino, em minusculas
const NOMES_FEMININOS = new Set(["prata", "platina"]);

/*******************************************************************************
 * artigoDoElemento
 * funcao: artigo definido que acompanha o nome do elemento. quase todos sao
 * masculinos ("o ferro"); so a prata e a platina pedem "a". as contracoes
 * saem dele: "d" + artigo da do/da.
 * recebe: nome (string, com ou sem maiuscula).
 * retorna: "o" ou "a".
 ******************************************************************************/
export function artigoDoElemento(nome: string): "o" | "a" {
  return NOMES_FEMININOS.has(nome.toLowerCase()) ? "a" : "o";
}

/*******************************************************************************
 * NOME_CATEGORIA
 * funcao: nome de cada familia do jeito que aparece para o jogador.
 ******************************************************************************/
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

/*******************************************************************************
 * SIGLA_CATEGORIA
 * funcao: sigla de duas letras de cada familia, usada na legenda do mapa.
 ******************************************************************************/
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
