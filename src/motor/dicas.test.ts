/*******************************************************************************
 * dicas.test.ts
 * funcao principal: testa a dificuldade de cada elemento e as 4 dicas das
 * missoes de descoberta: o que cada nivel pode ou nao revelar, a faixa de
 * protons, a massa e a ligacao com a missao.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import { ELEMENTOS, elementoPorZ } from "./dados";
import { dicasDoElemento, dificuldadeDe, faixaProtons, gerarDicas, LARGURA_FAIXA } from "./dicas";
import { avaliarMissao, missaoDescoberta } from "./missoes";
import { classificar } from "./classificar";
import { construir, progressoInicial } from "./progresso";
import type { Elemento } from "./tipos";

/*******************************************************************************
 * el
 * funcao: atalho para pegar o elemento real pelo Z.
 * recebe: z. retorna: o Elemento (o teste assume que ele existe).
 ******************************************************************************/
const el = (z: number) => elementoPorZ(z)!;
/*******************************************************************************
 * contem
 * funcao: procura um termo no texto sem ligar para maiusculas.
 * recebe: texto e termo. retorna: boolean.
 ******************************************************************************/
const contem = (texto: string, termo: string) => texto.toLowerCase().includes(termo.toLowerCase());
/*******************************************************************************
 * temSimbolo
 * funcao: procura o simbolo como palavra isolada, para nao dar falso
 * positivo com "C" dentro de "Carbono".
 * recebe: texto e simbolo. retorna: boolean.
 ******************************************************************************/
const temSimbolo = (texto: string, simbolo: string) => new RegExp(`(^|[^A-Za-zÀ-ÿ])${simbolo}([^a-zà-ÿ]|$)`).test(texto);

// regras de dificuldadeDe: facil, media, dificil e o campo que sobrescreve
describe("dificuldade", () => {
  it("fácil quando há pista autoral", () => {
    for (const z of [1, 2, 6, 8, 11, 26]) expect(dificuldadeDe(el(z))).toBe("facil");
  });
  it("média: Trilha essencial sem pista ou Z ≤ 36", () => {
    expect(dificuldadeDe(el(29))).toBe("media"); // cobre: sem pista, na Trilha essencial e com Z <= 36
    expect(dificuldadeDe(el(35))).toBe("media"); // bromo: fora da trilha, entra pelo limite Z <= 36
    expect(dificuldadeDe(el(79))).toBe("media"); // ouro: Z alto, entra so por estar na Trilha essencial
  });
  // osmio e oganessonio: sem pista, fora da trilha e com Z > 36
  it("difícil: o resto (ex.: ósmio)", () => {
    expect(dificuldadeDe(el(76))).toBe("dificil");
    expect(dificuldadeDe(el(118))).toBe("dificil");
  });
  it("o campo dificuldade do JSON sobrescreve o cálculo", () => {
    // copia do osmio (dificil pelo calculo) com o campo forcando "facil"
    const copia: Elemento = { ...el(76), dificuldade: "facil" };
    expect(dificuldadeDe(copia)).toBe("facil");
  });
});

// conteudo das dicas: o que cada nivel revela, rodando sobre os 118 elementos reais
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
    // caso concreto: o cobre termina com a localizacao curta
    expect(gerarDicas(29)[0]!.texto).toMatch(/conduz muito bem a eletricidade.* Metal de transição, período 4, grupo 11\.$/);
  });
  it("difícil: contém o nome e o símbolo", () => {
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "dificil")) {
      const t = gerarDicas(e.z)[0]!.texto;
      expect(contem(t, e.nome)).toBe(true);
      expect(t).toContain(`(${e.simbolo})`);
    }
    // caso concreto: o osmio comeca com nome e simbolo e traz a curiosidade
    expect(gerarDicas(76)[0]!.texto).toMatch(/^É o Ósmio \(Os\): metal de transição, período 6, grupo 8\. .*densos/);
  });
  it("massa atômica só aparece quando o dado existe (nunca é inventada)", () => {
    // tres copias do osmio: sem massa, com massa convencional e com a massa do
    // isotopo mais longevo (189,5 arredonda para 190)
    const sem: Elemento = { ...el(76), massa_atomica: null };
    const com: Elemento = { ...el(76), massa_atomica: { valor: 190.23, tipo: "convencional" } };
    const instavel: Elemento = { ...el(76), massa_atomica: { valor: 189.5, tipo: "isotopo_mais_longevo" } };
    expect(dicasDoElemento(sem)[0]!.texto).not.toMatch(/[Mm]assa/);
    expect(dicasDoElemento(com)[0]!.texto).toContain("Massa atômica aproximada: 190.");
    expect(dicasDoElemento(instavel)[0]!.texto).toContain("número de massa 190");
    // nos dados reais, sem massa tabelada a dica dificil nao cita massa
    for (const e of ELEMENTOS.filter((x) => dificuldadeDe(x) === "dificil" && !x.massa_atomica)) {
      expect(gerarDicas(e.z)[0]!.texto).not.toMatch(/[Mm]assa/);
    }
  });
  // inclui as pontas: z perto de 1 e de 118 nao podem sair da tabela
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
      // o espaco depois do Z evita casar "1" dentro de "11"
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
      // n = z sempre da um atomo neutro valido, mesmo que o nuclideo nao seja catalogado
      const sol = classificar({ p: e.z, n: e.z, e: e.z });
      expect(avaliarMissao(m, sol).cumprida).toBe(true);
    }
  });
  it("dicas não alteram o progresso (não existe penalidade no motor)", () => {
    // pede uma dica e depois constroi algo invalido: o estado tem que ser o mesmo objeto
    const s = progressoInicial();
    gerarDicas(1);
    expect(construir(s, { p: 0, n: 0, e: 0 }).estado).toBe(s);
  });
});
