/*******************************************************************************
 * tutorial.ts
 * funcao principal: diz o que o tutorial ensina a montar e fecha o tutorial,
 * passando para o progresso real o que o jogador montou nele, inclusive o
 * atomo montado que a ficha usa para comparar com a tabela.
 ******************************************************************************/
import { construir, descoberto } from "./progresso";
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
 * ATOMOS_DO_TUTORIAL
 * funcao: o atomo que o tutorial ensina para cada elemento que ele
 * concede, indexado pelo Z: H neutro (1, 0, 1) e He-4 neutro (2, 2, 2).
 ******************************************************************************/
export const ATOMOS_DO_TUTORIAL: Record<number, Particulas> = {
  1: { p: 1, n: 0, e: 1 },
  2: { p: 2, n: 2, e: 2 },
};

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

/*******************************************************************************
 * completarUltimoMontado
 * funcao: acrescenta ao ultimo atomo montado de cada elemento o atomo que o
 * tutorial ensinou, para os elementos que o tutorial deixou descobertos e
 * que ainda nao tem atomo salvo. nunca troca um atomo que ja existia.
 * recebe: ultimo (ultimo atomo montado por Z) e estado (Progresso depois do
 * concluirTutorial).
 * retorna: o registro novo, ou o mesmo objeto se nao houver o que acrescentar.
 ******************************************************************************/
export function completarUltimoMontado(ultimo: Record<number, Particulas>, estado: Progresso): Record<number, Particulas> {
  let novo = ultimo;
  for (const [chave, atomo] of Object.entries(ATOMOS_DO_TUTORIAL)) {
    const z = Number(chave);
    // so elementos descobertos e sem atomo salvo
    if (ultimo[z] || !descoberto(estado, z)) continue;
    novo = { ...novo, [z]: atomo };
  }
  return novo;
}
