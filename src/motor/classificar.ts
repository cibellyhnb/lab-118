import { elementoPorZ } from "./dados";
import type { Classificacao, Particulas, StatusNuclideo } from "./tipos";

export const LIMITE_N = 200; // REG-06
export const Z_MAX = 118; // REG-02
export const CARGA_MIN_COMUM = -3; // REG-10
export const CARGA_MAX_COMUM = 4; // REG-10

const SOBRESCRITO: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

/** "Na⁺", "O²⁻", "He²⁺" */
export function notacaoIon(simbolo: string, carga: number): string {
  if (carga === 0) return simbolo;
  const mod = Math.abs(carga);
  const num = mod === 1 ? "" : String(mod).split("").map((d) => SOBRESCRITO[d]).join("");
  return `${simbolo}${num}${carga > 0 ? "⁺" : "⁻"}`;
}

/** Limite máximo de elétrons para um dado Z (REG-06). */
export function maxEletrons(z: number): number {
  return Math.max(0, z) + 3;
}

/** Status do nuclídeo (Z, A) no catálogo (REG-07). */
export function statusNuclideo(z: number, a: number): StatusNuclideo {
  const iso = elementoPorZ(z)?.isotopos.find((i) => i.a === a);
  return iso ? iso.estabilidade : "nao_catalogado";
}

export function classificar(p: Particulas): Classificacao {
  const z = p.p;
  const n = p.n;
  const e = p.e;
  const base: Classificacao = { valido: false, z, n, e, a: z + n, carga: z - e, avisos: [] };

  // REG-01
  if (z <= 0) {
    if (n > 0 && e === 0 && z === 0) base.avisos.push("NEUTRON_LIVRE_INSTAVEL");
    return { ...base, erro: "SEM_PROTONS" };
  }
  // REG-02
  if (z > Z_MAX) return { ...base, erro: "Z_ACIMA_DE_118" };
  // REG-06
  if (n < 0 || n > LIMITE_N) return { ...base, erro: "NEUTRONS_FORA_DO_LIMITE" };
  if (e < 0 || e > maxEletrons(z)) return { ...base, erro: "ELETRONS_FORA_DO_LIMITE" };

  const el = elementoPorZ(z);
  if (!el) return { ...base, erro: "Z_ACIMA_DE_118" };

  const a = z + n; // REG-04
  const carga = z - e; // REG-04
  const especie = carga === 0 ? "atomo_neutro" : carga > 0 ? "cation" : "anion"; // REG-05
  const status = statusNuclideo(z, a); // REG-07
  const avisos: string[] = [];
  if (carga < CARGA_MIN_COMUM || carga > CARGA_MAX_COMUM) avisos.push("CARGA_RARA"); // REG-10
  if (status === "nao_catalogado") avisos.push("NUCLIDEO_NAO_CATALOGADO");
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
    notacao: carga === 0 ? `${el.simbolo}-${a}` : notacaoIon(el.simbolo, carga),
    avisos,
  };
}

/**
 * REG-11: distribuição dos elétrons nas camadas para desenho.
 * Neutro: campo camadas. Cátion: remove da camada mais externa primeiro.
 * Ânion: adiciona na mais externa até 8 (2 na primeira) e depois abre nova camada.
 */
export function distribuirCamadas(z: number, e: number): number[] {
  const el = elementoPorZ(z);
  if (!el || e <= 0) return [];
  const camadas = [...el.camadas];
  let diff = e - z;
  while (diff < 0 && camadas.length) {
    const i = camadas.length - 1;
    camadas[i] = (camadas[i] ?? 0) - 1;
    if (camadas[i] === 0) camadas.pop();
    diff++;
  }
  while (diff > 0) {
    const i = camadas.length - 1;
    const cap = i === 0 ? 2 : 8;
    if (i >= 0 && (camadas[i] ?? 0) < cap) camadas[i] = (camadas[i] ?? 0) + 1;
    else camadas.push(1);
    diff--;
  }
  return camadas;
}
