/*******************************************************************************
 * tutorial.test.ts
 * funcao principal: testa concluirTutorial com e sem recompensa, o modo
 * treino, que nao pode mexer no progresso original, e o atomo montado que o
 * tutorial deixa para a ficha.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import {
  ATOMOS_DO_TUTORIAL,
  completarUltimoMontado,
  concluirTutorial,
  MONTAGENS_DO_TUTORIAL,
} from "./tutorial";
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

// atomo montado que o tutorial deixa registrado para a ficha comparar com a tabela
describe("átomo montado deixado pelo tutorial", () => {
  it("tutorial concluído grava H-1 e He-4 neutros para os elementos concedidos", () => {
    const s = concluirTutorial(progressoInicial(), true);
    expect(completarUltimoMontado({}, s)).toEqual({
      1: { p: 1, n: 0, e: 1 },
      2: { p: 2, n: 2, e: 2 },
    });
    expect(ATOMOS_DO_TUTORIAL[1]).toEqual(MONTAGENS_DO_TUTORIAL[0]);
  });

  it("não troca um átomo que já estava salvo", () => {
    const s = concluirTutorial(progressoInicial(), true);
    const salvo = { 1: { p: 1, n: 1, e: 0 } };
    const novo = completarUltimoMontado(salvo, s);
    expect(novo[1]).toEqual({ p: 1, n: 1, e: 0 });
    expect(novo[2]).toEqual({ p: 2, n: 2, e: 2 });
  });

  it("tutorial pulado ou nada a acrescentar: devolve o mesmo registro", () => {
    // pulou: nada descoberto, nada para gravar
    const vazio = {};
    expect(completarUltimoMontado(vazio, concluirTutorial(progressoInicial(), false))).toBe(vazio);
    // os dois ja salvos: o mesmo objeto volta, e o store nao grava de novo
    const cheio = { 1: { p: 1, n: 0, e: 1 }, 2: { p: 2, n: 2, e: 2 } };
    expect(completarUltimoMontado(cheio, concluirTutorial(progressoInicial(), true))).toBe(cheio);
  });
});
