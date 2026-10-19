/*******************************************************************************
 * tutorial.test.ts
 * funcao principal: testa concluirTutorial com e sem recompensa e o modo
 * treino, que nao pode mexer no progresso original.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import { concluirTutorial, MONTAGENS_DO_TUTORIAL } from "./tutorial";
import { construir, progressoInicial } from "./progresso";

// fechamento do tutorial e o progresso de treino
describe("tutorial", () => {
  // as montagens do tutorial (H, H-2, H+, He-4) dao 3 estrelas ao H e 1 ao He
  it("concluir com recompensa: H com 3 estrelas, He com 1, tutorialConcluido", () => {
    const s = concluirTutorial(progressoInicial(), true);
    expect(s.tutorialConcluido).toBe(true);
    expect(s.elementos["1"]?.estrelas).toEqual([true, true, true]);
    expect(s.elementos["2"]?.estrelas).toEqual([true, false, false]);
  });
  it("pular só marca como concluído, sem tocar nos elementos", () => {
    const s = concluirTutorial(progressoInicial(), false);
    expect(s.tutorialConcluido).toBe(true);
    expect(s.elementos).toEqual({});
  });
  it("é idempotente e preserva o progresso existente", () => {
    // jogador que ja tinha o carbono: concluir duas vezes da o mesmo resultado e o C fica
    const antes = construir(progressoInicial(), { p: 6, n: 6, e: 6 }).estado;
    const a = concluirTutorial(antes, true);
    const b = concluirTutorial(a, true);
    expect(b).toEqual(a);
    expect(a.elementos["6"]?.estrelas[0]).toBe(true);
  });
  it("modo treino: o motor puro não altera o estado original", () => {
    const original = progressoInicial();
    // roda as montagens numa copia; o original tem que continuar vazio
    let sandbox = original;
    for (const p of MONTAGENS_DO_TUTORIAL) sandbox = construir(sandbox, p).estado;
    expect(original.elementos).toEqual({});
    expect(original.tutorialConcluido).toBe(false);
    expect(sandbox.elementos["1"]?.estrelas).toEqual([true, true, true]);
  });
});
