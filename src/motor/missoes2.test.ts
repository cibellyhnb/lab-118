import { describe, expect, it } from "vitest";
import { ELEMENTOS } from "./dados";
import { classificar } from "./classificar";
import { avaliarMissao, missaoParaElemento } from "./missoes";
import { construir, contarTotais, dominado, progressoInicial } from "./progresso";
import type { Missao, Particulas, Progresso } from "./tipos";

/** Monta exatamente o que a missão pede. */
function solucao(m: Missao): Particulas {
  const c = m.criterio;
  if (c.tipo === "DESCOBRIR") return { p: m.z, n: m.z, e: m.z };
  if (c.tipo === "ISOTOPO") return { p: m.z, n: c.n ?? 0, e: m.z };
  return { p: m.z, n: m.z, e: m.z - (c.carga ?? 1) };
}

describe("missões M1, M2 e M3", () => {
  it("todo elemento chega às 3 estrelas só seguindo as missões (118 × 3 = 354)", () => {
    let s: Progresso = progressoInicial();
    for (const el of ELEMENTOS) {
      for (let i = 0; i < 12; i++) {
        const m = missaoParaElemento(s, el.z);
        if (!m) break;
        const sol = solucao(m);
        const cl = classificar(sol);
        expect(cl.valido, `${el.nome} ${m.id} ${JSON.stringify(sol)}`).toBe(true);
        expect(avaliarMissao(m, cl).cumprida, `${el.nome} ${m.id}`).toBe(true);
        s = construir(s, sol).estado;
      }
      expect(dominado(s, el.z), `${el.nome} dominado`).toBe(true);
      expect(missaoParaElemento(s, el.z)).toBeNull();
    }
    expect(contarTotais(s)).toEqual({ elementos: 118, estrelas: 354 });
  });

  it("M2 pede um isótopo que o jogador ainda não registrou", () => {
    let s = construir(progressoInicial(), { p: 6, n: 6, e: 6 }).estado; // C-12
    const m = missaoParaElemento(s, 6)!;
    expect(m.tipo).toBe("M2");
    expect(m.criterio).toMatchObject({ tipo: "ISOTOPO", z: 6 });
    expect(m.criterio.tipo === "ISOTOPO" && m.criterio.a).not.toBe(12);
    s = construir(s, solucao(m)).estado;
    expect(s.elementos["6"]?.isotopos.length).toBe(2);
  });

  it("M3 usa a carga comum do elemento quando existe", () => {
    let s = construir(progressoInicial(), { p: 11, n: 12, e: 11 }).estado;
    s = construir(s, { p: 11, n: 11, e: 11 }).estado; // Na-22 (estrela 2 em 2 isótopos)
    const m = missaoParaElemento(s, 11)!;
    expect(m.tipo).toBe("M3");
    expect(m.criterio).toEqual({ tipo: "ION", z: 11, carga: 1 });
    expect(m.enunciado).toContain("Na⁺");
  });

  it("missão errada não conta: elemento ou massa trocados", () => {
    const s = construir(progressoInicial(), { p: 6, n: 6, e: 6 }).estado;
    const m = missaoParaElemento(s, 6)!;
    expect(avaliarMissao(m, classificar({ p: 7, n: 7, e: 7 })).cumprida).toBe(false);
    expect(avaliarMissao(m, classificar({ p: 6, n: 6, e: 6 })).cumprida).toBe(false);
  });
});
