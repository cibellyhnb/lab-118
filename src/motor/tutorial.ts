/*******************************************************************************
 * tutorial.ts
 * funcao principal: diz o que o tutorial ensina a montar e fecha o tutorial,
 * passando para o progresso real o que o jogador montou nele.
 ******************************************************************************/
import { construir } from "./progresso";
import type { Particulas, Progresso } from "./tipos";

/*******************************************************************************
 * MONTAGENS_DO_TUTORIAL
 * funcao: as montagens do tutorial, em ordem: H neutro, H-2, H+ e He-4
 * neutro.
 ******************************************************************************/
export const MONTAGENS_DO_TUTORIAL: Particulas[] = [
  { p: 1, n: 0, e: 1 },
  { p: 1, n: 1, e: 1 },
  { p: 1, n: 1, e: 0 },
  { p: 2, n: 2, e: 2 },
];

/*******************************************************************************
 * concluirTutorial
 * funcao: fecha o tutorial. com conceder, o jogador leva para a tabela real
 * o que montou (H com 3 estrelas e He com 1); sem conceder (pulou), so
 * marca como concluido. nunca apaga nada do progresso que ja existia.
 * recebe: estado (Progresso) e conceder (boolean).
 * retorna: o novo Progresso com tutorialConcluido = true.
 ******************************************************************************/
export function concluirTutorial(estado: Progresso, conceder: boolean): Progresso {
  let s = estado;
  // repete as montagens do tutorial pelo mesmo caminho do laboratorio
  if (conceder) for (const p of MONTAGENS_DO_TUTORIAL) s = construir(s, p).estado;
  return s.tutorialConcluido ? s : { ...s, tutorialConcluido: true };
}
