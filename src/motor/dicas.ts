import { CURIOSIDADES } from "./curiosidades";
import { NOME_CATEGORIA, elementoPorZ } from "./dados";
import type { Dica, Dificuldade, Elemento } from "./tipos";

/** Faixas de prótons têm sempre 10 valores consecutivos dentro de 1 a 118. */
export const LARGURA_FAIXA = 10;

/**
 * Dificuldade da missão de descobrir o elemento.
 * - fácil: tem pista autoral do dia a dia no JSON;
 * - média: está na Trilha essencial (sem pista autoral) ou tem Z ≤ 36;
 * - difícil: todos os outros (a dica já diz o nome).
 * O campo `dificuldade` no JSON sobrescreve o cálculo.
 */
export function dificuldadeDe(el: Elemento): Dificuldade {
  if (el.dificuldade) return el.dificuldade;
  if (el.ficha.pista) return "facil";
  if (el.trilha_essencial || el.z <= 36) return "media";
  return "dificil";
}

/** Faixa [min, max] com 10 prótons que contém z. */
export function faixaProtons(z: number): { min: number; max: number } {
  const min = Math.min(Math.max(1, Math.floor((z - 1) / LARGURA_FAIXA) * LARGURA_FAIXA + 1), 118 - LARGURA_FAIXA + 1);
  return { min, max: min + LARGURA_FAIXA - 1 };
}

const FASE: Record<Elemento["fase_ambiente"], string> = {
  solido: "sólido",
  liquido: "líquido",
  gasoso: "gasoso",
  desconhecido: "",
};

function descricaoBasica(el: Elemento): string {
  const grupo = el.grupo ? `, grupo ${el.grupo}` : "";
  const fase = FASE[el.fase_ambiente];
  const faseTxt = fase ? `, ${fase} à temperatura ambiente` : "";
  return `${NOME_CATEGORIA[el.categoria]} do período ${el.periodo}${grupo}${faseTxt}`;
}

function massaTexto(el: Elemento): string {
  const m = el.massa_atomica;
  if (!m) return ""; // sem dado, sem massa: nunca inventamos valores
  const v = Math.round(m.valor);
  return m.tipo === "convencional"
    ? ` Massa atômica aproximada: ${v}.`
    : ` O isótopo mais duradouro tem número de massa ${v}.`;
}

/** "Metal alcalino, período 2, grupo 1": a localização curta usada na primeira dica. */
function localizacao(el: Elemento): string {
  const grupo = el.grupo ? `, grupo ${el.grupo}` : "";
  return `${NOME_CATEGORIA[el.categoria]}, período ${el.periodo}${grupo}`;
}

function dica1(el: Elemento): string {
  const dif = dificuldadeDe(el);
  const curio = CURIOSIDADES[el.z];
  if (dif === "dificil") {
    const base = `É o ${el.nome} (${el.simbolo}): ${localizacao(el).replace(/^./, (c) => c.toLowerCase())}.`;
    return base + (curio ? ` ${curio}` : "") + massaTexto(el);
  }
  // fácil e média: curiosidade do dia a dia + família e posição (sem dizer o nome)
  if (curio) return `${curio} ${localizacao(el)}.`;
  // sem curiosidade cadastrada: texto antigo
  if (dif === "facil" && el.ficha.pista) return el.ficha.pista;
  const extra = el.ficha.pista ?? el.ficha.dicas?.[0];
  return `${descricaoBasica(el)}.${extra ? ` ${extra}` : ""}`;
}

function dica2(el: Elemento): string {
  if (el.categoria === "lantanideo" || el.categoria === "actinideo") {
    const nome = el.categoria === "lantanideo" ? "lantanídeos" : "actinídeos";
    return `Fica na linha separada embaixo da tabela, com os ${nome} (período ${el.periodo}).`;
  }
  return `Fica no período ${el.periodo} (a ${el.periodo}ª linha, de cima para baixo), na coluna ${el.posicao.coluna}${el.grupo ? ` (grupo ${el.grupo})` : ""}.`;
}

function dica3(z: number): string {
  const { min, max } = faixaProtons(z);
  return `Esse elemento tem entre ${min} e ${max} prótons.`;
}

function dica4(z: number): string {
  return `Esse elemento tem ${z} ${z === 1 ? "próton" : "prótons"}. Coloque essa quantidade no átomo.`;
}

/** As 4 dicas (função pura) de um elemento. Separada de gerarDicas para poder testar com elementos sintéticos. */
export function dicasDoElemento(el: Elemento): Dica[] {
  return [
    { nivel: 1, titulo: "Pista", texto: dica1(el) },
    { nivel: 2, titulo: "Posição na tabela", texto: dica2(el) },
    { nivel: 3, titulo: "Faixa de prótons", texto: dica3(el.z) },
    { nivel: 4, titulo: "Resposta", texto: dica4(el.z) },
  ];
}

/** As 4 dicas de uma missão de descoberta, a partir do número atômico. */
export function gerarDicas(z: number): Dica[] {
  const el = elementoPorZ(z);
  return el ? dicasDoElemento(el) : [];
}
