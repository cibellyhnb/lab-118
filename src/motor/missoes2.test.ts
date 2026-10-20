/*******************************************************************************
 * missoes2.test.ts
 * funcao principal: testa as missoes M1, M2 e M3 juntas: se seguindo so as
 * missoes o jogador chega as 3 estrelas em todos os elementos, se M2 e M3
 * pedem o alvo certo, se proximoElemento acha o proximo elemento pendente e
 * se o laboratorio segue M1, M2 e M3 do mesmo elemento e para nele quando
 * as 3 estrelas saem.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import { ELEMENTOS } from "./dados";
import { classificar } from "./classificar";
import { avaliarMissao, elementoSugerido, missaoParaElemento, proximoElemento, retornoDesafioIsotopo } from "./missoes";
import { construir, contarTotais, dominado, progressoInicial } from "./progresso";
import type { Missao, Particulas, Progresso } from "./tipos";

/*******************************************************************************
 * solucao
 * funcao: monta exatamente o que a missao pede.
 * recebe: m (Missao).
 * retorna: as Particulas: neutro com n = z (M1), neutro com o n pedido (M2)
 * ou com eletrons a menos pela carga, +1 se a missao nao fixar (M3).
 ******************************************************************************/
function solucao(m: Missao): Particulas {
  const c = m.criterio;
  if (c.tipo === "DESCOBRIR") return { p: m.z, n: m.z, e: m.z };
  if (c.tipo === "ISOTOPO") return { p: m.z, n: c.n ?? 0, e: m.z };
  return { p: m.z, n: m.z, e: m.z - (c.carga ?? 1) };
}

// sequencia de missoes e o criterio de cada uma
describe("missões M1, M2 e M3", () => {
  it("todo elemento chega às 3 estrelas só seguindo as missões (118 × 3 = 354)", () => {
    let s: Progresso = progressoInicial();
    for (const el of ELEMENTOS) {
      // limite de 12 voltas so para nao travar se uma missao nunca for cumprida
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
    // C-12 ja foi registrado, entao o alvo tem que ser outro isotopo
    expect(m.criterio.tipo === "ISOTOPO" && m.criterio.a).not.toBe(12);
    s = construir(s, solucao(m)).estado;
    expect(s.elementos["6"]?.isotopos.length).toBe(2);
  });

  it("M3 usa a carga comum do elemento quando existe", () => {
    // Na-23 descobre o sodio
    let s = construir(progressoInicial(), { p: 11, n: 12, e: 11 }).estado;
    s = construir(s, { p: 11, n: 11, e: 11 }).estado; // Na-22: segundo isotopo, ganha a estrela 2
    const m = missaoParaElemento(s, 11)!;
    expect(m.tipo).toBe("M3");
    expect(m.criterio).toEqual({ tipo: "ION", z: 11, carga: 1 });
    expect(m.enunciado).toContain("Na⁺");
  });

  it("missão errada não conta: elemento ou massa trocados", () => {
    const s = construir(progressoInicial(), { p: 6, n: 6, e: 6 }).estado;
    const m = missaoParaElemento(s, 6)!;
    // nitrogenio no lugar do carbono, e depois o C-12 que ja foi feito
    expect(avaliarMissao(m, classificar({ p: 7, n: 7, e: 7 })).cumprida).toBe(false);
    expect(avaliarMissao(m, classificar({ p: 6, n: 6, e: 6 })).cumprida).toBe(false);
  });
});

/*******************************************************************************
 * dominar
 * funcao: leva os elementos pedidos ate as 3 estrelas seguindo as proprias
 * missoes, como o jogador faria.
 * recebe: s (Progresso) e zs (numeros atomicos).
 * retorna: o Progresso com esses elementos completos.
 ******************************************************************************/
function dominar(s: Progresso, zs: number[]): Progresso {
  for (const z of zs) {
    // cada elemento precisa de no maximo 3 missoes; 12 voltas so evitam laco infinito
    for (let i = 0; i < 12; i++) {
      const m = missaoParaElemento(s, z);
      if (!m) break;
      s = construir(s, solucao(m)).estado;
    }
  }
  return s;
}

// proximo elemento com missao pendente, usado pelo botao PROXIMA MISSAO do laboratorio
describe("proximoElemento", () => {
  it("pula os elementos que já têm 3 estrelas", () => {
    // He, Li e Be completos: depois do H o proximo pendente e o B
    const s = dominar(progressoInicial(), [2, 3, 4]);
    expect(dominado(s, 3)).toBe(true);
    expect(proximoElemento(s, 1)).toBe(5);
  });

  it("dá a volta do 118 para o 1", () => {
    expect(proximoElemento(progressoInicial(), 118)).toBe(1);
    // com o H completo, a volta continua ate o He
    expect(proximoElemento(dominar(progressoInicial(), [1]), 118)).toBe(2);
  });

  it("retorna null quando todos os elementos têm 3 estrelas", () => {
    const s = dominar(progressoInicial(), ELEMENTOS.map((e) => e.z));
    expect(contarTotais(s)).toEqual({ elementos: 118, estrelas: 354 });
    for (const z of [1, 60, 118]) expect(proximoElemento(s, z)).toBeNull();
  });

  it("nunca devolve o próprio zAtual", () => {
    // jogo novo: o proximo e sempre o vizinho seguinte, nunca o proprio z
    for (let z = 1; z <= 118; z++) {
      const prox = proximoElemento(progressoInicial(), z);
      expect(prox).not.toBe(z);
      expect(prox).toBe((z % 118) + 1);
    }
    // so o Nd (60) pendente: a partir dele nao ha outro, entao null em vez de 60;
    // a partir de qualquer outro elemento, o resultado e 60
    const quase = dominar(progressoInicial(), ELEMENTOS.map((e) => e.z).filter((z) => z !== 60));
    expect(proximoElemento(quase, 60)).toBeNull();
    expect(proximoElemento(quase, 10)).toBe(60);
    expect(proximoElemento(quase, 100)).toBe(60);
  });
});

// sequencia do laboratorio preso a um elemento, passando so pelos estados do progresso
describe("sequência de missões de um elemento no laboratório", () => {
  // so os elementos antes do fosforo completos, para o proximo depois dele ser o enxofre
  const antes = () => dominar(progressoInicial(), Array.from({ length: 14 }, (_, i) => i + 1));
  const estrelas = (s: Progresso) => s.elementos["15"]?.estrelas;

  it("fósforo descoberto com P-31: M1, um M2 e M3, e depois o elemento fica completo", () => {
    let s = antes();
    expect(missaoParaElemento(s, 15)?.tipo).toBe("M1");
    // descobrir com P-31, que esta no catalogo: ja conta como 1 dos 2 isotopos
    s = construir(s, { p: 15, n: 16, e: 15 }).estado;
    const m2 = missaoParaElemento(s, 15)!;
    expect(m2).toMatchObject({ tipo: "M2", z: 15, criterio: { a: 32 } });
    expect(m2.enunciado).toContain("Falta 1 isótopo do catálogo para a estrela 2");
    s = construir(s, solucao(m2)).estado;
    expect(estrelas(s)).toEqual([true, true, false]);
    const m3 = missaoParaElemento(s, 15)!;
    expect(m3).toMatchObject({ tipo: "M3", z: 15, criterio: { carga: -3 } });
    s = construir(s, solucao(m3)).estado;
    expect(estrelas(s)).toEqual([true, true, true]);
    // completo: o elemento nao tem mais missao e o laboratorio para nele; o proximo
    // elemento so vem pelo botao PROXIMA MISSAO (proximoElemento)
    expect(missaoParaElemento(s, 15)).toBeNull();
    expect(proximoElemento(s, 15)).toBe(16);
  });

  it("fósforo descoberto com P-30 (fora do catálogo): a estrela 2 pede dois isótopos", () => {
    // regra: a descoberta so registra isotopo se o nucleo estiver no catalogo
    let s = construir(antes(), { p: 15, n: 15, e: 15 }).estado;
    expect(s.elementos["15"]?.isotopos).toEqual([]);
    const primeiro = missaoParaElemento(s, 15)!;
    expect(primeiro).toMatchObject({ tipo: "M2", criterio: { a: 31 } });
    expect(primeiro.enunciado).toContain("Faltam 2 isótopos do catálogo para a estrela 2");
    s = construir(s, solucao(primeiro)).estado;
    expect(estrelas(s)).toEqual([true, false, false]);
    const segundo = missaoParaElemento(s, 15)!;
    expect(segundo).toMatchObject({ tipo: "M2", criterio: { a: 32 } });
    expect(segundo.enunciado).toContain("Falta 1 isótopo do catálogo para a estrela 2");
    s = construir(s, solucao(segundo)).estado;
    expect(missaoParaElemento(s, 15)?.tipo).toBe("M3");
  });

  it("sem elemento na url, o sugerido é o de gerarMissao e depois o primeiro com estrela faltando", () => {
    expect(elementoSugerido(progressoInicial())).toBe(1);
    // tudo descoberto, so o Nd (60) sem as outras estrelas
    const todos = ELEMENTOS.map((e) => e.z);
    let s = dominar(progressoInicial(), todos.filter((z) => z !== 60));
    s = construir(s, { p: 60, n: 82, e: 60 }).estado;
    expect(elementoSugerido(s)).toBe(60);
    expect(elementoSugerido(dominar(s, [60]))).toBeNull();
  });
});

// frase extra do retorno no desafio de isotopo: isotopo repetido ou fora do catalogo
describe("retorno do desafio de isótopo", () => {
  // litio descoberto com Li-7 (registrado); o desafio de isotopo pede o Li-6
  const s = construir(progressoInicial(), { p: 3, n: 4, e: 3 }).estado;
  const m = missaoParaElemento(s, 3)!;

  it("montar de novo o mesmo isótopo registrado avisa que é o mesmo", () => {
    expect(m).toMatchObject({ tipo: "M2", criterio: { a: 6 } });
    expect(retornoDesafioIsotopo(s, m, classificar({ p: 3, n: 4, e: 3 }))).toBe(
      "Esse é o mesmo isótopo que você já montou. Mude o número de nêutrons para montar um isótopo diferente.",
    );
    // repetir nao registra nada nem da estrela
    expect(construir(s, { p: 3, n: 4, e: 3 }).eventos).toEqual([]);
  });

  it("núcleo fora do catálogo lembra que o desafio pede um isótopo do catálogo", () => {
    // Li-13 (10 neutrons) nao esta no catalogo do litio
    expect(retornoDesafioIsotopo(s, m, classificar({ p: 3, n: 10, e: 3 }))).toBe("Este desafio pede um isótopo do catálogo: monte o Lítio-6.");
  });

  it("isótopo novo do catálogo, outro elemento ou outro desafio: sem frase extra", () => {
    expect(retornoDesafioIsotopo(s, m, classificar({ p: 3, n: 3, e: 3 }))).toBeNull();
    expect(retornoDesafioIsotopo(s, m, classificar({ p: 2, n: 2, e: 2 }))).toBeNull();
    // no desafio de ion (M3) a frase nao aparece
    const s3 = construir(s, { p: 3, n: 3, e: 3 }).estado;
    const m3 = missaoParaElemento(s3, 3)!;
    expect(m3.tipo).toBe("M3");
    expect(retornoDesafioIsotopo(s3, m3, classificar({ p: 3, n: 3, e: 3 }))).toBeNull();
  });
});
