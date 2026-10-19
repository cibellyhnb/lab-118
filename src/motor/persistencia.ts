import { progressoInicial } from "./progresso";
import type { Progresso } from "./tipos";

export const CHAVE = "construtor-atomico:progresso";

type Armazenamento = Pick<Storage, "getItem" | "setItem">;

function valido(x: unknown): x is Progresso {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o["versao"] === "number" && !!o["elementos"] && typeof o["elementos"] === "object";
}

/** Carrega o progresso. Dado corrompido vai para CHAVE + ":corrompido". */
export function carregar(arm: Armazenamento): { estado: Progresso; corrompido: boolean } {
  const bruto = arm.getItem(CHAVE);
  if (!bruto) return { estado: progressoInicial(), corrompido: false };
  try {
    const obj: unknown = JSON.parse(bruto);
    if (!valido(obj)) throw new Error("formato");
    // Migração: só existe a versão 1; campos ausentes recebem o padrão.
    const base = progressoInicial();
    return {
      estado: { ...base, ...obj, versao: 1, config: { ...base.config, ...obj.config }, quiz: { ...base.quiz, ...obj.quiz } },
      corrompido: false,
    };
  } catch {
    arm.setItem(`${CHAVE}:corrompido`, bruto);
    return { estado: progressoInicial(), corrompido: true };
  }
}

export function salvar(arm: Armazenamento, estado: Progresso): void {
  arm.setItem(CHAVE, JSON.stringify(estado));
}
