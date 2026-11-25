/*******************************************************************************
 * dados.test.ts
 * funcao: confere a coerencia do elements.json (abundancias, isotopos, massas)
 * para que uma correcao de dados nao deixe o catalogo contraditorio.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import { ELEMENTOS, elementoPorZ } from "./dados";
import { APLICACOES } from "./aplicacoes";
import { CURIOSIDADES } from "./curiosidades";
import { GLOSSARIO } from "./glossario";
import { ILUSTRACOES } from "@/interface/ilus/mapa";
import { PALETA_ILUS, ilustracaoDe } from "@/interface/ilus";

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

describe("Isótopos citados nos textos", () => {
  it("todo isótopo citado pelo nome (ex: iodo-131) está no catálogo", () => {
    const porNome = new Map(ELEMENTOS.map((e) => [e.nome.toLowerCase(), e]));
    const textos = [
      ...Object.values(APLICACOES).flat(),
      ...Object.values(CURIOSIDADES),
      ...GLOSSARIO.map((g) => g.definicao),
    ];
    let citados = 0;
    for (const t of textos)
      for (const m of t.toLowerCase().matchAll(/([a-záéíóúâêôãõç]+)-(\d{1,3})(m?)\b/g)) {
        const el = porNome.get(m[1] ?? "");
        if (!el) continue;
        citados++;
        // "99m" e um estado excitado: o isotopo base (Tc-99) precisa estar no catalogo
        expect(
          el.isotopos.some((i) => i.a === Number(m[2])),
          `${m[0]} em: ${t}`,
        ).toBe(true);
      }
    expect(citados).toBeGreaterThan(10);
  });
});

describe("Íons comuns", () => {
  it("polônio, protactínio, netúnio e plutônio têm seus íons comuns", () => {
    expect(elementoPorZ(84)?.ions_comuns).toEqual([2, 4]);
    expect(elementoPorZ(91)?.ions_comuns).toEqual([5]);
    expect(elementoPorZ(93)?.ions_comuns).toEqual([3, 4]);
    expect(elementoPorZ(94)?.ions_comuns).toEqual([3, 4]);
  });
  // a ordem importa (o desafio do ion pede a primeira carga), entao so confere repeticao e zero
  it("íons comuns sem repetição e sem carga 0", () => {
    for (const el of ELEMENTOS) {
      const q = el.ions_comuns;
      expect(q.includes(0), el.simbolo).toBe(false);
      expect(new Set(q).size, el.simbolo).toBe(q.length);
    }
  });
});

describe("Fase à temperatura ambiente", () => {
  it("astato é sólido só previsto; frâncio continua desconhecido", () => {
    // ninguem viu astato em quantidade; para o francio as estimativas de fusao vao de 8 a 27 °C
    expect(elementoPorZ(85)?.fase_ambiente).toBe("solido");
    expect(elementoPorZ(85)?.fase_prevista).toBe(true);
    expect(elementoPorZ(87)?.fase_ambiente).toBe("desconhecido");
  });
});

describe("Coerência entre glossário e catálogo", () => {
  it("o glossário não dá isótopo estável a quem o catálogo diz não ter (ex: bismuto)", () => {
    // todos do bismuto (83) em diante, alem do tecnecio e do promecio, so tem isotopos radioativos
    const semEstavel = ELEMENTOS.filter((e) =>
      e.isotopos.every((i) => i.estabilidade !== "estavel"),
    ).map((e) => e.z);
    expect(semEstavel).toEqual([43, 61, ...Array.from({ length: 118 - 82 }, (_, i) => 83 + i)]);
    const radioativo = GLOSSARIO.find((g) => g.id === "radioativo");
    expect(radioativo?.duvida).toContain("a partir do bismuto (Z ≥ 83)");
  });
});

describe("Ilustrações", () => {
  it("todo elemento ilustrado tem desenho 16 × 16 só com cores da paleta", () => {
    for (let z = 1; z <= 118; z++) {
      if (!ILUSTRACOES[z]) continue;
      const il = ilustracaoDe(z);
      expect(il, `Z ${z}: sprite ${ILUSTRACOES[z]?.sprite}`).not.toBeNull();
      expect(il?.rows.length, `Z ${z}`).toBe(16);
      for (const linha of il?.rows ?? []) {
        expect(linha.length, `Z ${z}`).toBe(16);
        for (const c of linha)
          if (c !== ".") expect(PALETA_ILUS[c], `Z ${z}: cor ${c}`).toBeDefined();
      }
    }
  });
});
