/*******************************************************************************
 * classificar.ts
 * funcao principal: recebe as particulas montadas no laboratorio (protons,
 * neutrons, eletrons) e diz o que foi formado: atomo neutro, cation ou anion,
 * qual e o isotopo e se ele esta no catalogo. so regras, sem nada de tela.
 ******************************************************************************/
import { elementoPorZ } from "./dados";
import type { Classificacao, Particulas, StatusNuclideo } from "./tipos";

/*******************************************************************************
 * LIMITE_N, Z_MAX, CARGA_MIN_COMUM, CARGA_MAX_COMUM
 * funcao: limites das regras do documento de design. LIMITE_N e o maximo de
 * neutrons (REG-06), Z_MAX o maior numero atomico (REG-02) e as cargas comuns
 * marcam a faixa fora da qual o ion ganha o aviso CARGA_RARA (REG-10), a
 * menos que a carga esteja nos ions_comuns do elemento.
 ******************************************************************************/
export const LIMITE_N = 200; // REG-06
export const Z_MAX = 118; // REG-02
export const CARGA_MIN_COMUM = -3; // REG-10
export const CARGA_MAX_COMUM = 4; // REG-10

// troca cada digito pelo seu sobrescrito, para escrever a carga do ion
const SOBRESCRITO: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

/*******************************************************************************
 * notacaoIon
 * funcao: monta o texto do ion no formato da quimica, ex: "Na⁺", "O²⁻".
 * recebe: simbolo (string) e carga (number, positiva ou negativa).
 * retorna: o simbolo sozinho se a carga for 0, ou simbolo + expoente + sinal.
 ******************************************************************************/
export function notacaoIon(simbolo: string, carga: number): string {
  if (carga === 0) return simbolo;
  const mod = Math.abs(carga);
  // carga 1 nao escreve o numero, so o sinal (Na⁺ e nao Na¹⁺)
  const num = mod === 1 ? "" : String(mod).split("").map((d) => SOBRESCRITO[d]).join("");
  return `${simbolo}${num}${carga > 0 ? "⁺" : "⁻"}`;
}

/*******************************************************************************
 * maxEletrons
 * funcao: limite de eletrons que o laboratorio aceita para um elemento
 * (REG-06): o numero de protons mais 3.
 * recebe: z (number), o numero atomico.
 * retorna: o maximo de eletrons permitido (nunca menos que 3).
 ******************************************************************************/
export function maxEletrons(z: number): number {
  return Math.max(0, z) + 3;
}

/*******************************************************************************
 * statusNuclideo
 * funcao: procura o nuclideo (Z, A) na lista de isotopos do elemento (REG-07).
 * recebe: z (numero atomico) e a (numero de massa).
 * retorna: "estavel" ou "radioativo" se estiver no catalogo, senao
 * "nao_catalogado".
 ******************************************************************************/
export function statusNuclideo(z: number, a: number): StatusNuclideo {
  const iso = elementoPorZ(z)?.isotopos.find((i) => i.a === a);
  return iso ? iso.estabilidade : "nao_catalogado";
}

/*******************************************************************************
 * classificar
 * funcao: aplica as regras REG-01 a REG-10 na montagem do jogador e descreve
 * o resultado: elemento, especie (neutro, cation, anion), nuclideo, notacao
 * e avisos.
 * recebe: p (Particulas), com a quantidade de protons, neutrons e eletrons.
 * retorna: uma Classificacao; se algo violar uma regra, valido = false e o
 * campo erro diz qual foi.
 ******************************************************************************/
export function classificar(p: Particulas): Classificacao {
  const z = p.p;
  const n = p.n;
  const e = p.e;
  // resposta base, usada nos retornos de erro
  const base: Classificacao = { valido: false, z, n, e, a: z + n, carga: z - e, avisos: [] };

  // REG-01: sem protons nao existe elemento
  if (z <= 0) {
    // so neutrons, sem nada mais: avisa que o neutron livre e instavel
    if (n > 0 && e === 0 && z === 0) base.avisos.push("NEUTRON_LIVRE_INSTAVEL");
    return { ...base, erro: "SEM_PROTONS" };
  }
  // REG-02: a tabela vai so ate o 118
  if (z > Z_MAX) return { ...base, erro: "Z_ACIMA_DE_118" };
  // REG-06: limites de neutrons e de eletrons
  if (n < 0 || n > LIMITE_N) return { ...base, erro: "NEUTRONS_FORA_DO_LIMITE" };
  if (e < 0 || e > maxEletrons(z)) return { ...base, erro: "ELETRONS_FORA_DO_LIMITE" };

  // se o Z nao estiver nos dados, trata como fora da tabela
  const el = elementoPorZ(z);
  if (!el) return { ...base, erro: "Z_ACIMA_DE_118" };

  const a = z + n; // REG-04
  const carga = z - e; // REG-04
  const especie = carga === 0 ? "atomo_neutro" : carga > 0 ? "cation" : "anion"; // REG-05
  const status = statusNuclideo(z, a); // REG-07
  const avisos: string[] = [];
  // REG-10: carga fora da faixa comum e rara, exceto se for um ion comum do proprio
  // elemento (ex: Nb⁵⁺ e Ta⁵⁺)
  if ((carga < CARGA_MIN_COMUM || carga > CARGA_MAX_COMUM) && !el.ions_comuns.includes(carga)) avisos.push("CARGA_RARA");
  if (status === "nao_catalogado") avisos.push("NUCLIDEO_NAO_CATALOGADO");
  // nenhum eletron: so o nucleo
  if (e === 0) avisos.push("NUCLEO_NU");

  return {
    valido: true,
    z,
    n,
    e,
    a,
    carga,
    elemento: { z: el.z, simbolo: el.simbolo, nome: el.nome, categoria: el.categoria },
    especie,
    nuclideo: { rotulo: `${el.simbolo}-${a}`, status },
    // neutro aparece como "Na-23"; ion aparece como "Na⁺"
    notacao: carga === 0 ? `${el.simbolo}-${a}` : notacaoIon(el.simbolo, carga),
    avisos,
  };
}

/*******************************************************************************
 * distribuirCamadas
 * funcao: distribui os eletrons nas camadas para o desenho do atomo (REG-11).
 * no neutro usa as camadas do JSON; no cation tira da camada mais externa
 * primeiro; no anion poe na mais externa ate 8 (2 na primeira) e depois abre
 * uma camada nova.
 * recebe: z (numero atomico) e e (quantidade de eletrons).
 * retorna: lista com quantos eletrons ficam em cada camada, de dentro para
 * fora. lista vazia se o elemento nao existir ou nao houver eletrons.
 ******************************************************************************/
export function distribuirCamadas(z: number, e: number): number[] {
  const el = elementoPorZ(z);
  if (!el || e <= 0) return [];
  const camadas = [...el.camadas];
  // diff < 0: faltam eletrons (cation); diff > 0: sobram (anion)
  let diff = e - z;
  // cation: tira um por vez da ultima camada e apaga a camada se ela esvaziar
  while (diff < 0 && camadas.length) {
    const i = camadas.length - 1;
    camadas[i] = (camadas[i] ?? 0) - 1;
    if (camadas[i] === 0) camadas.pop();
    diff++;
  }
  // anion: completa a ultima camada e, quando ela enche, abre outra
  while (diff > 0) {
    const i = camadas.length - 1;
    const cap = i === 0 ? 2 : 8;
    if (i >= 0 && (camadas[i] ?? 0) < cap) camadas[i] = (camadas[i] ?? 0) + 1;
    else camadas.push(1);
    diff--;
  }
  return camadas;
}
