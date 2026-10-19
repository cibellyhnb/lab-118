import { describe, expect, it } from "vitest";
import { ELEMENTOS, elementoPorZ } from "./dados";
import { dicasDoElemento, dificuldadeDe, faixaProtons, gerarDicas, LARGURA_FAIXA } from "./dicas";
import { avaliarMissao, missaoDescoberta } from "./missoes";
import { classificar } from "./classificar";
import { construir, progressoInicial } from "./progresso";
import type { Elemento } from "./tipos";

const el = (z: number) => elementoPorZ(z)!;
const contem = (texto: string, termo: string) => texto.toLowerCase().includes(termo.toLowerCase());
/** Procura o símbolo como palavra isolada (evita falso positivo de "C" dentro de "Carbono"). */
const temSimbolo = (texto: string, simbolo: string) => new RegExp(`(^|[^A-Za-zÀ-ÿ])${simbolo}([^a-zà-ÿ]|$)`).test(texto);

describe("dificuldade", () => {
  it("fácil quando há pista autoral", () => {
    for (const z of [1, 2, 6, 8, 11, 26]) expect(dificuldadeDe(el(z))).toBe("facil");
  });
  it("média: Trilha essencial sem pista ou Z ≤ 36", () => {
    expect(dificuldadeDe(el(29))).toBe("media"); // cobre, Trilha essencial? (Cu está na trilha)
    expect(dificuldadeDe(el(35))).toBe("media"); // bromo, Z ≤ 36
    expect(dificuldadeDe(el(79))).toBe("media"); // ouro, Trilha essencial
  });
  it("difícil: o resto (ex.: ósmio)", () => {
    expect(dificuldadeDe(el(76))).toBe("dificil");
    expect(dificuldadeDe(el(118))).toBe("dificil");
  });
  it("o campo dificuldade do JSON sobrescreve o cálculo", () => {
    const copia: Elemento = { ...el(76), dificuldade: "facil" };
    expect(dificuldadeDe(copia)).toBe("facil");
  });
});

describe("gerarDicas (função pura)", () => {
  it("fácil: nunca contém o nome nem o símbolo", () => {
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "facil" && x.ficha.pista)) {
      const t = gerarDicas(e.z)[0]!.texto;
      expect(contem(t, e.nome)).toBe(false);
      expect(temSimbolo(t, e.simbolo)).toBe(false);
    }
  });
  it("média: descreve família, período e estado, sem o nome do elemento", () => {
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "media")) {
      const t = gerarDicas(e.z)[0]!.texto;
      expect(contem(t, e.nome)).toBe(false);
      expect(t).toContain(`período ${e.periodo}`);
    }
    expect(gerarDicas(29)[0]!.texto).toMatch(/conduz muito bem a eletricidade.* Metal de transição, período 4, grupo 11\.$/);
  });
  it("difícil: contém o nome e o símbolo", () => {
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "dificil")) {
      const t = gerarDicas(e.z)[0]!.texto;
      expect(contem(t, e.nome)).toBe(true);
      expect(t).toContain(`(${e.simbolo})`);
    }
    expect(gerarDicas(76)[0]!.texto).toMatch(/^É o Ósmio \(Os\): metal de transição, período 6, grupo 8\. .*densos/);
  });
  it("massa atômica só aparece quando o dado existe (nunca é inventada)", () => {
    const sem: Elemento = { ...el(76), massa_atomica: null };
    const com: Elemento = { ...el(76), massa_atomica: { valor: 190.23, tipo: "convencional" } };
    const instavel: Elemento = { ...el(76), massa_atomica: { valor: 189.5, tipo: "isotopo_mais_longevo" } };
    expect(dicasDoElemento(sem)[0]!.texto).not.toMatch(/[Mm]assa/);
    expect(dicasDoElemento(com)[0]!.texto).toContain("Massa atômica aproximada: 190.");
    expect(dicasDoElemento(instavel)[0]!.texto).toContain("número de massa 190");
    // nos dados reais, sem massa tabelada a dica difícil não cita massa
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "dificil" && !x.massa_atomica)) {
      expect(gerarDicas(e.z)[0]!.texto).not.toMatch(/[Mm]assa/);
    }
  });
  it("faixa de prótons: sempre contém o Z e tem largura 10", () => {
    for (let z = 1; z <= 118; z++) {
      const f = faixaProtons(z);
      expect(f.max - f.min + 1).toBe(LARGURA_FAIXA);
      expect(z).toBeGreaterThanOrEqual(f.min);
      expect(z).toBeLessThanOrEqual(f.max);
      expect(f.min).toBeGreaterThanOrEqual(1);
      expect(f.max).toBeLessThanOrEqual(118);
    }
  });
  it("os 118 elementos geram 4 níveis, e o nível 4 revela o Z certo", () => {
    for (const e of ELEMENTOS) {
      const d = gerarDicas(e.z);
      expect(d.map((x) => x.nivel)).toEqual([1, 2, 3, 4]);
      for (const x of d) expect(x.texto.length).toBeGreaterThan(5);
      expect(d[3]!.texto).toContain(`${e.z} `);
      const f = faixaProtons(e.z);
      expect(d[2]!.texto).toContain(`entre ${f.min} e ${f.max}`);
    }
  });
  it("nível 2 trata lantanídeos e actinídeos (linha separada)", () => {
    expect(gerarDicas(58)[1]!.texto).toContain("lantanídeos");
    expect(gerarDicas(92)[1]!.texto).toContain("actinídeos");
    expect(gerarDicas(29)[1]!.texto).toContain("período 4");
  });
  it("a missão carrega as 4 dicas e continua com solução aceita", () => {
    for (const e of ELEMENTOS) {
      const m = missaoDescoberta(e.z);
      expect(m.dicas).toHaveLength(4);
      expect(m.enunciado).toContain(m.dicas[0]!);
      const sol = classificar({ p: e.z, n: e.z, e: e.z });
      expect(avaliarMissao(m, sol).cumprida).toBe(true);
    }
  });
  it("dicas não alteram o progresso (não existe penalidade no motor)", () => {
    const s = progressoInicial();
    gerarDicas(1);
    expect(construir(s, { p: 0, n: 0, e: 0 }).estado).toBe(s);
  });
});
