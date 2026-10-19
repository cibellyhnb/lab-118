/*******************************************************************************
 * quiz.test.ts
 * funcao principal: testa as familias (cobertura dos 118 elementos e a
 * cerimonia pendente) e o quiz (perguntas, embaralhamento, rodadas e
 * selos).
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import {
  ELEMENTOS,
  FAMILIAS,
  PERGUNTAS,
  TAMANHO_GERAL,
  construir,
  familiaPendente,
  membros,
  montarRodada,
  perguntasDoQuiz,
  prepararPergunta,
  progressoFamilia,
  progressoInicial,
  registrarFamilia,
  registrarQuiz,
  rng,
  seloConquistado,
  seloDoResultado,
  type Progresso,
} from "./index";

/*******************************************************************************
 * descobrirTodos
 * funcao: descobre varios elementos de uma vez, montando cada um neutro
 * com n = z.
 * recebe: base (Progresso) e zs (numeros atomicos).
 * retorna: o Progresso depois de todas as montagens.
 ******************************************************************************/
function descobrirTodos(base: Progresso, zs: number[]): Progresso {
  let s = base;
  for (const z of zs) s = construir(s, { p: z, n: z, e: z }).estado;
  return s;
}

// familias da tabela e quando a cerimonia deve aparecer
describe("famílias", () => {
  it("as 10 famílias cobrem os 118 elementos, sem repetir", () => {
    const zs = FAMILIAS.flatMap((f) => membros(f.id).map((e) => e.z));
    expect(zs.length).toBe(118);
    expect(new Set(zs).size).toBe(118);
    expect(ELEMENTOS.length).toBe(118);
    for (const f of FAMILIAS) expect(f.fatos.every((x) => x.length > 20)).toBe(true);
  });

  it("completar uma família gera uma única cerimônia pendente", () => {
    let s = progressoInicial();
    expect(familiaPendente(s)).toBeNull();
    // descobre todos os halogenios menos o ultimo: ainda nao ha cerimonia
    const hal = membros("halogenio").map((e) => e.z);
    s = descobrirTodos(s, hal.slice(0, -1));
    expect(progressoFamilia(s, "halogenio")).toMatchObject({ descobertos: hal.length - 1, total: hal.length, completa: false });
    expect(familiaPendente(s)).toBeNull();
    // o ultimo completa a familia
    s = descobrirTodos(s, hal.slice(-1));
    expect(progressoFamilia(s, "halogenio").completa).toBe(true);
    expect(familiaPendente(s)).toBe("halogenio");
    s = registrarFamilia(s, "halogenio");
    expect(familiaPendente(s)).toBeNull();
    expect(registrarFamilia(s, "halogenio")).toBe(s); // idempotente
  });
});

// banco de perguntas, montagem das rodadas e selos
describe("quiz", () => {
  it("cada família tem 5 perguntas e o geral tem pelo menos 12", () => {
    for (const f of FAMILIAS) expect(perguntasDoQuiz(f.id).length, f.id).toBe(5);
    expect(perguntasDoQuiz("geral").length).toBeGreaterThanOrEqual(12);
  });

  it("perguntas bem formadas: 3 opções diferentes, texto e explicação, ids únicos", () => {
    expect(new Set(PERGUNTAS.map((p) => p.id)).size).toBe(PERGUNTAS.length);
    for (const p of PERGUNTAS) {
      expect(p.opcoes.length).toBe(3);
      expect(new Set(p.opcoes).size, p.id).toBe(3);
      expect(p.enunciado.length).toBeGreaterThan(10);
      expect(p.explicacao.length).toBeGreaterThan(10);
    }
  });

  it("embaralhar mantém a resposta certa em algum lugar e o índice aponta para ela", () => {
    // semente fixa para o embaralhamento ser sempre o mesmo
    const r = rng(7);
    for (const p of PERGUNTAS) {
      const pronta = prepararPergunta(p, r);
      expect(pronta.opcoes[pronta.correta]).toBe(p.opcoes[0]);
      expect([...pronta.opcoes].sort()).toEqual([...p.opcoes].sort());
    }
  });

  it("a rodada geral tem 8 perguntas sem repetir; a de família tem todas as 5", () => {
    const geral = montarRodada("geral", rng(1));
    expect(geral.length).toBe(TAMANHO_GERAL);
    expect(new Set(geral.map((p) => p.id)).size).toBe(TAMANHO_GERAL);
    expect(montarRodada("gas_nobre", rng(2)).length).toBe(5);
  });

  it("selos: terminar vale 1, 60% vale 2, tudo certo vale 3, e o melhor fica guardado", () => {
    expect(seloDoResultado(0, 5)).toBe(1);
    // limites: 2 de 5 (40%) ainda e 1; 3 de 5 (60%) ja e 2
    expect(seloDoResultado(2, 5)).toBe(1);
    expect(seloDoResultado(3, 5)).toBe(2);
    expect(seloDoResultado(5, 5)).toBe(3);
    let s = progressoInicial();
    expect(seloConquistado(s, "halogenio")).toBe(0);
    let r = registrarQuiz(s, "halogenio", 3, 5);
    expect(r).toMatchObject({ selo: 2, novoRecorde: true });
    s = r.estado;
    expect(s.quiz.rodadas).toBe(1);
    r = registrarQuiz(s, "halogenio", 1, 5); // pior que o anterior: nao rebaixa
    expect(r.novoRecorde).toBe(false);
    expect(seloConquistado(r.estado, "halogenio")).toBe(2);
    r = registrarQuiz(r.estado, "halogenio", 5, 5);
    expect(seloConquistado(r.estado, "halogenio")).toBe(3);
    // ao subir de selo a marca antiga e trocada, nao acumulada
    expect(r.estado.conquistas.filter((c) => c.startsWith("quiz:halogenio:")).length).toBe(1);
    expect(r.estado.quiz.melhor).toBe(100);
  });
});
