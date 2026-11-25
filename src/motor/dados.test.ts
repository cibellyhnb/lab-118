/*******************************************************************************
 * dados.test.ts
 * funcao: confere a coerencia do elements.json (abundancias, isotopos, massas)
 * para que uma correcao de dados nao deixe o catalogo contraditorio.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import { ELEMENTOS, elementoPorZ } from "./dados";

describe("Dados do elements.json", () => {
  it("as abundâncias de cada elemento somam 100%", () => {
    for (const el of ELEMENTOS) {
      const ab = el.isotopos.flatMap((i) => (i.abundancia_pct === null ? [] : [i.abundancia_pct]));
      if (ab.length === 0) continue;
      const soma = ab.reduce((t, x) => t + x, 0);
      expect(Math.abs(soma - 100), `${el.simbolo}: soma ${soma}`).toBeLessThan(0.02);
    }
  });

  it("abundâncias de H, Li, B, C e N seguem a IAEA e a NUBASE2020", () => {
    const ab = (z: number, a: number) =>
      elementoPorZ(z)?.isotopos.find((i) => i.a === a)?.abundancia_pct;
    expect(ab(1, 2)).toBe(0.0145);
    expect(ab(3, 6)).toBe(4.85);
    expect(ab(3, 7)).toBe(95.15);
    expect(ab(5, 10)).toBe(19.65);
    expect(ab(6, 13)).toBe(1.06);
    expect(ab(7, 15)).toBe(0.3795);
  });

  it("isótopos em ordem crescente de A, sem repetição", () => {
    for (const el of ELEMENTOS) {
      const as = el.isotopos.map((i) => i.a);
      expect(as, el.simbolo).toEqual([...new Set(as)].sort((x, y) => x - y));
    }
  });

  it("estável não tem meia-vida e radioativo sempre tem", () => {
    for (const el of ELEMENTOS)
      for (const i of el.isotopos) {
        if (i.estabilidade === "estavel")
          expect(i.meia_vida, `${el.simbolo}-${i.a}`).toBeUndefined();
        else expect(i.meia_vida, `${el.simbolo}-${i.a}`).toBeTruthy();
      }
  });

  it("a massa do isótopo mais longevo é um isótopo do catálogo", () => {
    for (const el of ELEMENTOS) {
      if (el.massa_atomica?.tipo !== "isotopo_mais_longevo") continue;
      const a = el.massa_atomica.valor;
      expect(
        el.isotopos.some((i) => i.a === a),
        `${el.simbolo}: massa ${a}`,
      ).toBe(true);
    }
  });
});

describe("Superpesados", () => {
  it("isótopos vistos só em 2016 ficam fora; massas seguem o mais longevo confirmado", () => {
    const as = (z: number) => elementoPorZ(z)?.isotopos.map((i) => i.a);
    expect(as(110)).toEqual([279, 280, 281]);
    expect(as(112)).toEqual([281, 283, 285]);
    expect(as(113)).toEqual([284, 285, 286]);
    expect(as(114)).toEqual([287, 288, 289]);
    expect(elementoPorZ(110)?.massa_atomica?.valor).toBe(281);
    expect(elementoPorZ(112)?.massa_atomica?.valor).toBe(285);
    expect(elementoPorZ(114)?.massa_atomica?.valor).toBe(289);
  });
});
