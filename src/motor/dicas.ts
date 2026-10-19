/*******************************************************************************
 * dicas.ts
 * funcao principal: monta as 4 dicas das missoes de descoberta (pista,
 * posicao na tabela, faixa de protons e resposta) e calcula a dificuldade de
 * cada elemento, que muda o quanto a primeira dica entrega.
 ******************************************************************************/
import { CURIOSIDADES } from "./curiosidades";
import { NOME_CATEGORIA, artigoDoElemento, elementoPorZ } from "./dados";
import type { Dica, Dificuldade, Elemento } from "./tipos";

/*******************************************************************************
 * LARGURA_FAIXA
 * funcao: tamanho da faixa de protons da dica 3. a faixa sempre tem 10
 * valores seguidos dentro de 1 a 118.
 ******************************************************************************/
export const LARGURA_FAIXA = 10;

/*******************************************************************************
 * dificuldadeDe
 * funcao: decide a dificuldade da missao de descobrir o elemento.
 * facil: tem pista escrita a mao no JSON; media: esta na Trilha essencial
 * ou tem Z <= 36; dificil: o resto (a dica ja diz o nome).
 * recebe: el (Elemento).
 * retorna: "facil", "media" ou "dificil". se o JSON tiver o campo
 * dificuldade, ele vale no lugar do calculo.
 ******************************************************************************/
export function dificuldadeDe(el: Elemento): Dificuldade {
  if (el.dificuldade) return el.dificuldade;
  if (el.ficha.pista) return "facil";
  if (el.trilha_essencial || el.z <= 36) return "media";
  return "dificil";
}

/*******************************************************************************
 * faixaProtons
 * funcao: calcula a faixa de 10 protons que contem z, para a dica 3.
 * recebe: z (numero atomico).
 * retorna: { min, max }, ex: z = 26 da { min: 21, max: 30 }.
 ******************************************************************************/
export function faixaProtons(z: number): { min: number; max: number } {
  // arredonda para o inicio da dezena (1, 11, 21...) e trava em 109 para a
  // faixa nao passar de 118
  const min = Math.min(Math.max(1, Math.floor((z - 1) / LARGURA_FAIXA) * LARGURA_FAIXA + 1), 118 - LARGURA_FAIXA + 1);
  return { min, max: min + LARGURA_FAIXA - 1 };
}

// fase do JSON escrita como aparece no texto; "desconhecido" fica vazio
const FASE: Record<Elemento["fase_ambiente"], string> = {
  solido: "sólido",
  liquido: "líquido",
  gasoso: "gasoso",
  desconhecido: "",
};

/*******************************************************************************
 * descricaoBasica
 * funcao: frase com familia, periodo, grupo e fase, usada quando o elemento
 * nao tem curiosidade cadastrada.
 * recebe: el (Elemento).
 * retorna: ex: "Gas nobre do periodo 1, grupo 18, gasoso a temperatura
 * ambiente".
 ******************************************************************************/
function descricaoBasica(el: Elemento): string {
  // grupo e fase so entram quando existem
  const grupo = el.grupo ? `, grupo ${el.grupo}` : "";
  const fase = FASE[el.fase_ambiente];
  const faseTxt = fase ? `, ${fase} à temperatura ambiente` : "";
  return `${NOME_CATEGORIA[el.categoria]} do período ${el.periodo}${grupo}${faseTxt}`;
}

/*******************************************************************************
 * massaTexto
 * funcao: frase com a massa atomica arredondada, para a dica dos dificeis.
 * recebe: el (Elemento).
 * retorna: a massa convencional, ou o numero de massa do isotopo mais
 * duradouro, ou "" se o JSON nao tiver massa.
 ******************************************************************************/
function massaTexto(el: Elemento): string {
  const m = el.massa_atomica;
  if (!m) return ""; // sem dado, sem massa: nunca inventamos valores
  const v = Math.round(m.valor);
  return m.tipo === "convencional"
    ? ` Massa atômica aproximada: ${v}.`
    : ` O isótopo mais duradouro tem número de massa ${v}.`;
}

/*******************************************************************************
 * localizacao
 * funcao: localizacao curta do elemento, usada na primeira dica.
 * recebe: el (Elemento).
 * retorna: ex: "Metal alcalino, periodo 2, grupo 1".
 ******************************************************************************/
function localizacao(el: Elemento): string {
  const grupo = el.grupo ? `, grupo ${el.grupo}` : "";
  return `${NOME_CATEGORIA[el.categoria]}, período ${el.periodo}${grupo}`;
}

/*******************************************************************************
 * dica1
 * funcao: texto da pista (nivel 1), que muda com a dificuldade.
 * recebe: el (Elemento).
 * retorna: nos dificeis, nome + localizacao + curiosidade + massa; nos
 * faceis e medios, curiosidade + localizacao, sem dizer o nome.
 ******************************************************************************/
function dica1(el: Elemento): string {
  const dif = dificuldadeDe(el);
  const curio = CURIOSIDADES[el.z];
  if (dif === "dificil") {
    // a localizacao entra no meio da frase, entao a primeira letra vira minuscula
    const base = `É ${artigoDoElemento(el.nome)} ${el.nome} (${el.simbolo}): ${localizacao(el).replace(/^./, (c) => c.toLowerCase())}.`;
    return base + (curio ? ` ${curio}` : "") + massaTexto(el);
  }
  // facil e media: curiosidade do dia a dia + familia e posicao (sem dizer o nome)
  if (curio) return `${curio} ${localizacao(el)}.`;
  // sem curiosidade cadastrada: volta para o texto antigo (pista do JSON ou descricao)
  if (dif === "facil" && el.ficha.pista) return el.ficha.pista;
  const extra = el.ficha.pista ?? el.ficha.dicas?.[0];
  return `${descricaoBasica(el)}.${extra ? ` ${extra}` : ""}`;
}

/*******************************************************************************
 * dica2
 * funcao: texto da posicao na tabela (nivel 2).
 * recebe: el (Elemento).
 * retorna: periodo e coluna; para lantanideos e actinideos, avisa que ficam
 * na linha separada embaixo da tabela.
 ******************************************************************************/
function dica2(el: Elemento): string {
  if (el.categoria === "lantanideo" || el.categoria === "actinideo") {
    const nome = el.categoria === "lantanideo" ? "lantanídeos" : "actinídeos";
    return `Fica na linha separada embaixo da tabela, com os ${nome} (período ${el.periodo}).`;
  }
  return `Fica no período ${el.periodo} (a ${el.periodo}ª linha, de cima para baixo), na coluna ${el.posicao.coluna}${el.grupo ? ` (grupo ${el.grupo})` : ""}.`;
}

/*******************************************************************************
 * dica3
 * funcao: texto da faixa de protons (nivel 3).
 * recebe: z (numero atomico).
 * retorna: ex: "Esse elemento tem entre 21 e 30 protons."
 ******************************************************************************/
function dica3(z: number): string {
  const { min, max } = faixaProtons(z);
  return `Esse elemento tem entre ${min} e ${max} prótons.`;
}

/*******************************************************************************
 * dica4
 * funcao: texto da resposta (nivel 4), com o numero exato de protons.
 * recebe: z (numero atomico).
 * retorna: a frase com a quantidade de protons, no singular quando z = 1.
 ******************************************************************************/
function dica4(z: number): string {
  return `Esse elemento tem ${z} ${z === 1 ? "próton" : "prótons"}. Coloque essa quantidade no átomo.`;
}

/*******************************************************************************
 * dicasDoElemento
 * funcao: monta as 4 dicas de um elemento. fica separada de gerarDicas para
 * os testes poderem usar elementos inventados.
 * recebe: el (Elemento).
 * retorna: lista de Dica, do nivel 1 ao 4.
 ******************************************************************************/
export function dicasDoElemento(el: Elemento): Dica[] {
  return [
    { nivel: 1, titulo: "Pista", texto: dica1(el) },
    { nivel: 2, titulo: "Posição na tabela", texto: dica2(el) },
    { nivel: 3, titulo: "Faixa de prótons", texto: dica3(el.z) },
    { nivel: 4, titulo: "Resposta", texto: dica4(el.z) },
  ];
}

/*******************************************************************************
 * gerarDicas
 * funcao: as 4 dicas da missao de descoberta, a partir do numero atomico.
 * recebe: z (number).
 * retorna: lista de Dica, ou lista vazia se o Z nao existir.
 ******************************************************************************/
export function gerarDicas(z: number): Dica[] {
  const el = elementoPorZ(z);
  return el ? dicasDoElemento(el) : [];
}
