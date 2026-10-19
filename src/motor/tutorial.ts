import { construir } from "./progresso";
import type { Particulas, Progresso } from "./tipos";

/** O que o tutorial ensina a montar: H neutro, H-2, H⁺ e He-4 neutro. */
export const MONTAGENS_DO_TUTORIAL: Particulas[] = [
  { p: 1, n: 0, e: 1 },
  { p: 1, n: 1, e: 1 },
  { p: 1, n: 1, e: 0 },
  { p: 2, n: 2, e: 2 },
];

/**
 * Fecha o tutorial. Com `conceder`, o jogador leva para a tabela real o que montou
 * (H com 3 estrelas e He com 1). Sem `conceder` (pulou), só marca como concluído.
 * Nunca remove nada do progresso existente.
 */
export function concluirTutorial(estado: Progresso, conceder: boolean): Progresso {
  let s = estado;
  if (conceder) for (const p of MONTAGENS_DO_TUTORIAL) s = construir(s, p).estado;
  return s.tutorialConcluido ? s : { ...s, tutorialConcluido: true };
}
