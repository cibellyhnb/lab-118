/*******************************************************************************
 * motor.test.ts
 * funcao principal: testa o motor do jogo: casos da secao 15 do documento
 * de design, regras REG-xx, progresso e estrelas, missao M1, validacao do
 * elements.json e salvar/carregar o progresso.
 ******************************************************************************/
import { describe, expect, it } from "vitest";
import {
  classificar,
  distribuirCamadas,
  notacaoIon,
  notacaoNuclideo,
  textoCarga,
} from "./classificar";
import { ELEMENTOS, isotopoReferencia } from "./dados";
import { construir, progressoInicial } from "./progresso";
import { avaliarMissao, gerarMissao, missaoDescoberta } from "./missoes";
import { carregar, CHAVE, salvar } from "./persistencia";
import type { Progresso } from "./tipos";

/*******************************************************************************
 * c
 * funcao: atalho para classificar uma montagem.
 * recebe: p, n, e. retorna: a Classificacao.
 ******************************************************************************/
const c = (p: number, n: number, e: number) => classificar({ p, n, e });

// classificacao de montagens: elemento, especie, nuclideo e erros. cada nome traz
// p,n,e e o resultado esperado
describe("classificação de montagens: elemento, espécie, nuclídeo e erros", () => {
  it("1,0,1 H-1 neutro estável", () => {
    const r = c(1, 0, 1);
    expect(r.elemento?.nome).toBe("Hidrogênio");
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo).toEqual({ rotulo: "H-1", status: "estavel" });
  });
  it("1,1,1 H-2 estável", () =>
    expect(c(1, 1, 1).nuclideo).toEqual({ rotulo: "H-2", status: "estavel" }));
  it("1,2,1 H-3 radioativo", () => expect(c(1, 2, 1).nuclideo?.status).toBe("radioativo"));
  // proton sozinho ainda e valido: vira cation, nao erro
  it("1,0,0 H⁺ núcleo nu", () => {
    const r = c(1, 0, 0);
    expect(r.valido).toBe(true);
    expect(r.especie).toBe("cation");
    expect(r.carga).toBe(1);
    expect(r.notacao).toBe("¹H⁺");
  });
  it("1,0,2 H⁻", () => {
    const r = c(1, 0, 2);
    expect(r.especie).toBe("anion");
    expect(r.carga).toBe(-1);
    expect(r.notacao).toBe("¹H⁻");
  });
  it("2,2,2 He-4", () => {
    const r = c(2, 2, 2);
    expect(r.elemento?.nome).toBe("Hélio");
    expect(r.nuclideo).toEqual({ rotulo: "He-4", status: "estavel" });
  });
  it("2,1,2 He-3", () =>
    expect(c(2, 1, 2).nuclideo).toEqual({ rotulo: "He-3", status: "estavel" }));
  it("6,6,6 C-12", () => {
    const r = c(6, 6, 6);
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo).toEqual({ rotulo: "C-12", status: "estavel" });
    // notacao dos livros: massa sobrescrita a esquerda, sem carga no atomo neutro
    expect(r.notacao).toBe("¹²C");
  });
  it("6,8,6 C-14 radioativo", () =>
    expect(c(6, 8, 6).nuclideo).toEqual({ rotulo: "C-14", status: "radioativo" }));
  it("6,6,5 C⁺", () => {
    const r = c(6, 6, 5);
    expect(r.especie).toBe("cation");
    expect(r.notacao).toBe("¹²C⁺");
  });
  // C-36 nao existe no catalogo, mas a montagem continua valida
  it("6,30,6 não catalogado", () => {
    const r = c(6, 30, 6);
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo?.status).toBe("nao_catalogado");
  });
  it("8,8,10 O²⁻", () => {
    const r = c(8, 8, 10);
    expect(r.notacao).toBe("¹⁶O²⁻");
    expect(r.carga).toBe(-2);
    expect(r.especie).toBe("anion");
  });
  it("11,12,10 Na⁺ Na-23 estável", () => {
    const r = c(11, 12, 10);
    expect(r.notacao).toBe("²³Na⁺");
    expect(r.nuclideo).toEqual({ rotulo: "Na-23", status: "estavel" });
  });
  it("17,18,18 Cl⁻ Cl-35", () => {
    const r = c(17, 18, 18);
    expect(r.notacao).toBe("³⁵Cl⁻");
    expect(r.nuclideo).toEqual({ rotulo: "Cl-35", status: "estavel" });
  });
  it("26,30,24 Fe²⁺ Fe-56", () => {
    const r = c(26, 30, 24);
    expect(r.notacao).toBe("⁵⁶Fe²⁺");
    expect(r.nuclideo).toEqual({ rotulo: "Fe-56", status: "estavel" });
  });
  // limite de cima da tabela
  it("118,176,118 Og A=294", () => {
    const r = c(118, 176, 118);
    expect(r.elemento?.simbolo).toBe("Og");
    expect(r.especie).toBe("atomo_neutro");
    expect(r.a).toBe(294);
  });
  // REG-01: sem protons e erro; so neutron ganha ainda o aviso de neutron livre
  it("0,1,0 REG-01 com aviso de nêutron livre", () => {
    const r = c(0, 1, 0);
    expect(r.valido).toBe(false);
    expect(r.erro).toBe("SEM_PROTONS");
    expect(r.avisos).toContain("NEUTRON_LIVRE_INSTAVEL");
  });
  // REG-02: um proton alem do 118
  it("119,0,119 REG-02", () => expect(c(119, 0, 119).erro).toBe("Z_ACIMA_DE_118"));
  // REG-06: o maximo para Z = 1 e 4 eletrons (Z + 3), entao 5 passa do limite
  it("1,0,5 REG-06", () => expect(c(1, 0, 5).erro).toBe("ELETRONS_FORA_DO_LIMITE"));
  // REG-06: LIMITE_N e 200, entao 201 passa do limite
  it("REG-06 nêutrons acima de 200", () =>
    expect(c(6, 201, 6).erro).toBe("NEUTRONS_FORA_DO_LIMITE"));
});

// regras gerais testadas em varias combinacoes
describe("Regras", () => {
  it("REG-03: só Z define o elemento", () => {
    // varia neutrons e eletrons com 6 protons: sempre carbono (9 e o maximo de eletrons)
    for (let n = 0; n < 20; n++)
      for (let e = 0; e <= 9; e++) expect(c(6, n, e).elemento?.simbolo).toBe("C");
  });
  it("REG-04: A = Z + N e carga 0 sse E = Z (propriedade)", () => {
    // varre a tabela de 3 em 3, neutrons de 17 em 17 e todos os eletrons permitidos
    for (let z = 1; z <= 118; z += 3)
      for (let n = 0; n <= 200; n += 17)
        for (let e = 0; e <= z + 3; e++) {
          const r = c(z, n, e);
          expect(r.a).toBe(z + n);
          expect(r.carga === 0).toBe(e === z);
        }
  });
  it("notação: carga, íon e nuclídeo", () => {
    expect(textoCarga(0)).toBe("");
    expect(textoCarga(1)).toBe("⁺");
    expect(textoCarga(-2)).toBe("²⁻");
    expect(textoCarga(10)).toBe("¹⁰⁺");
    expect(notacaoIon("Na", 0)).toBe("Na");
    expect(notacaoIon("Na", 1)).toBe("Na⁺");
    expect(notacaoNuclideo("Og", 294, 0)).toBe("²⁹⁴Og");
    expect(notacaoNuclideo("U", 238, 6)).toBe("²³⁸U⁶⁺");
  });
  it("REG-10: carga rara", () => {
    // oxigenio com 3 eletrons tem carga +5, acima do maximo comum (+4); com 4 eletrons, +4 ainda vale
    expect(c(8, 8, 3).avisos).toContain("CARGA_RARA");
    expect(c(8, 8, 4).avisos).not.toContain("CARGA_RARA");
  });
  // carga +5 passa do maximo comum, mas e um ion comum do niobio: sem aviso
  it("REG-10: Nb⁵⁺ não é carga rara porque está nos íons comuns", () => {
    const r = c(41, 52, 36);
    expect(r.carga).toBe(5);
    expect(r.notacao).toBe("⁹³Nb⁵⁺");
    expect(r.avisos).not.toContain("CARGA_RARA");
  });
  it("gás nobre com elétron a mais ganha o aviso de ânion instável", () => {
    expect(c(2, 2, 3).avisos).toContain("ANION_GAS_NOBRE");
    expect(c(10, 10, 11).avisos).toContain("ANION_GAS_NOBRE");
    // cation de gas nobre e anion de outro elemento: sem aviso
    expect(c(2, 2, 1).avisos).not.toContain("ANION_GAS_NOBRE");
    expect(c(17, 18, 18).avisos).not.toContain("ANION_GAS_NOBRE");
  });
  it("REG-11: camadas", () => {
    // neutro, cation que esvazia a camada, anion que completa 8, anion na primeira
    // camada (cap 2), anion que abre camada nova e sem eletrons
    expect(distribuirCamadas(11, 11)).toEqual([2, 8, 1]);
    expect(distribuirCamadas(11, 10)).toEqual([2, 8]);
    expect(distribuirCamadas(8, 10)).toEqual([2, 8]);
    expect(distribuirCamadas(1, 2)).toEqual([2]);
    expect(distribuirCamadas(2, 3)).toEqual([2, 1]);
    expect(distribuirCamadas(1, 0)).toEqual([]);
  });
});

// como construir() registra variantes e da estrelas
describe("Progresso e estrelas (RF-01 a RF-03)", () => {
  it("descoberta só com átomo neutro, e variantes só contam depois dela", () => {
    let s = progressoInicial();
    // primeiro o ion H+: o hidrogenio nao foi descoberto, entao nada e registrado
    const r1 = construir(s, { p: 1, n: 0, e: 0 });
    expect(r1.eventos).toEqual([]);
    expect(r1.estado).toBe(s);
    // depois o H neutro: descobre e registra so o proprio isotopo, sem estrela 3
    const r2 = construir(s, { p: 1, n: 0, e: 1 });
    expect(r2.eventos.map((e) => e.tipo)).toEqual([
      "ELEMENTO_DESCOBERTO",
      "ESTRELA_GANHA",
      "ISOTOPO_REGISTRADO",
    ]);
    expect(r2.estado.elementos["1"]).toEqual({
      estrelas: [true, false, false],
      isotopos: [1],
      ions: [],
    });
    // H-2 e o segundo isotopo: estrela 2
    const r3 = construir(r2.estado, { p: 1, n: 1, e: 1 });
    expect(r3.estado.elementos["1"]?.estrelas).toEqual([true, true, false]);
    // agora o ion H+ vale a estrela 3
    s = construir(r3.estado, { p: 1, n: 0, e: 0 }).estado;
    expect(s.elementos["1"]).toEqual({ estrelas: [true, true, true], isotopos: [1, 2], ions: [1] });
  });
  it("isótopo ou íon antes da descoberta não dá estrelas de uma vez", () => {
    // Li-7 com 2 eletrons (Li+): nao conta
    let s = construir(progressoInicial(), { p: 3, n: 4, e: 2 }).estado;
    expect(s.elementos["3"]).toBeUndefined();
    // Li-7 neutro: so a estrela 1
    s = construir(s, { p: 3, n: 4, e: 3 }).estado;
    expect(s.elementos["3"]?.estrelas).toEqual([true, false, false]);
  });
  it("save antigo com variantes registradas antes da descoberta: a contagem recomeça", () => {
    const antigo = {
      ...progressoInicial(),
      elementos: { "3": { estrelas: [false, false, false], isotopos: [6, 7], ions: [1] } },
    } as Progresso;
    const r = construir(antigo, { p: 3, n: 4, e: 3 });
    expect(r.estado.elementos["3"]).toEqual({
      estrelas: [true, false, false],
      isotopos: [7],
      ions: [],
    });
  });
  it("não catalogado não registra isótopo nem descobre o elemento", () => {
    // C-36 nao esta no catalogo: nao descobre o carbono e nao entra na lista de isotopos
    const r = construir(progressoInicial(), { p: 6, n: 30, e: 6 });
    expect(r.eventos).toEqual([]);
    expect(r.estado.elementos["6"]).toBeUndefined();
    // Li-3 (litio sem neutrons) tambem nao descobre
    expect(construir(progressoInicial(), { p: 3, n: 0, e: 3 }).eventos).toEqual([]);
    // com um nucleo do catalogo (C-12) descobre e registra o isotopo
    const ok = construir(r.estado, { p: 6, n: 6, e: 6 });
    expect(ok.estado.elementos["6"]?.estrelas[0]).toBe(true);
    expect(ok.estado.elementos["6"]?.isotopos).toEqual([12]);
  });
  it("todo elemento tem um isótopo de referência no catálogo, e ele descobre o elemento", () => {
    for (const el of ELEMENTOS) {
      const ref = isotopoReferencia(el);
      expect(ref, el.nome).not.toBeNull();
      expect(el.isotopos.some((i) => i.a === ref!.a)).toBe(true);
      const r = construir(progressoInicial(), { p: el.z, n: ref!.a - el.z, e: el.z });
      expect(
        r.eventos.map((e) => e.tipo),
        el.nome,
      ).toContain("ELEMENTO_DESCOBERTO");
    }
    // natural: o mais abundante; sintetico: o numero de massa da tabela
    expect(isotopoReferencia(ELEMENTOS[0]!)?.a).toBe(1);
    expect(isotopoReferencia(ELEMENTOS[91]!)?.a).toBe(238);
    expect(isotopoReferencia(ELEMENTOS[42]!)?.a).toBe(97);
  });
  it("ânion de gás nobre não é registrado nem dá a estrela do íon", () => {
    let s = construir(progressoInicial(), { p: 2, n: 2, e: 2 }).estado; // He-4
    const r = construir(s, { p: 2, n: 2, e: 3 }); // He⁻
    expect(r.eventos).toEqual([]);
    expect(r.estado.elementos["2"]?.ions).toEqual([]);
    s = construir(r.estado, { p: 2, n: 2, e: 1 }).estado; // He⁺
    expect(s.elementos["2"]?.ions).toEqual([1]);
    expect(s.elementos["2"]?.estrelas[2]).toBe(true);
  });
  it("aplicar o mesmo build duas vezes não duplica nada", () => {
    const a = construir(progressoInicial(), { p: 6, n: 6, e: 6 });
    const b = construir(a.estado, { p: 6, n: 6, e: 6 });
    expect(b.eventos).toEqual([]);
    expect(b.estado).toEqual(a.estado);
  });
  it("entrada inválida não altera estado", () => {
    const s = progressoInicial();
    // toBe: tem que ser o mesmo objeto, nao so igual
    expect(construir(s, { p: 0, n: 1, e: 0 }).estado).toBe(s);
  });
});

// missoes de descoberta e as pistas do JSON
describe("Missão M1", () => {
  it("toda missão de descoberta tem solução aceita pelo motor", () => {
    for (const el of ELEMENTOS) {
      const m = missaoDescoberta(el.z);
      // usa o primeiro isotopo do catalogo; sem catalogo, n = z
      const sol = c(el.z, el.isotopos[0] ? el.isotopos[0].a - el.z : el.z, el.z);
      expect(avaliarMissao(m, sol).cumprida).toBe(true);
    }
  });
  it("gerarMissao sugere H primeiro", () => expect(gerarMissao(progressoInicial(), 1)?.z).toBe(1));
  it("pista sem nome nem símbolo e até 120 caracteres", () => {
    for (const el of ELEMENTOS) {
      const p = el.ficha.pista;
      if (!p) continue;
      expect(p.length).toBeLessThanOrEqual(120);
      expect(p.toLowerCase()).not.toContain(el.nome.toLowerCase());
      // simbolo como palavra isolada, para "C" dentro de "Combustivel" nao contar
      expect(p, el.simbolo).not.toMatch(new RegExp(`(^|[^A-Za-zÀ-ÿ])${el.simbolo}([^a-zà-ÿ]|$)`));
    }
  });
});

// conferencia do elements.json
describe("Validação dos dados", () => {
  it("118 z únicos, camadas somam z, posições únicas", () => {
    expect(new Set(ELEMENTOS.map((e) => e.z)).size).toBe(118);
    for (const e of ELEMENTOS) expect(e.camadas.reduce((x, y) => x + y, 0)).toBe(e.z);
    expect(new Set(ELEMENTOS.map((e) => `${e.posicao.linha}:${e.posicao.coluna}`)).size).toBe(118);
  });
  // quantidade esperada de elementos em cada familia
  it("contagem por categoria", () => {
    const cont: Record<string, number> = {};
    for (const e of ELEMENTOS) cont[e.categoria] = (cont[e.categoria] ?? 0) + 1;
    expect(cont).toEqual({
      metal_alcalino: 6,
      metal_alcalino_terroso: 6,
      metal_transicao: 38,
      metal_representativo: 12,
      semimetal: 6,
      nao_metal: 7,
      halogenio: 6,
      gas_nobre: 7,
      lantanideo: 15,
      actinideo: 15,
    });
  });
  // fora dos grupos principais, eletrons_valencia tem que ser null
  it("valência = última camada nos grupos 1, 2 e 13-18", () => {
    for (const e of ELEMENTOS) {
      const principal = e.grupo !== null && (e.grupo <= 2 || e.grupo >= 13);
      expect(e.eletrons_valencia).toBe(principal ? e.camadas.at(-1) : null);
    }
  });
  it("isótopos com A ≥ z; Z 1-10 com catálogo e ao menos 1 estável", () => {
    for (const e of ELEMENTOS) for (const i of e.isotopos) expect(i.a).toBeGreaterThanOrEqual(e.z);
    // os 10 primeiros sao a base do jogo: precisam de isotopo estavel e massa
    for (const e of ELEMENTOS.slice(0, 10)) {
      expect(e.isotopos.some((i) => i.estabilidade === "estavel")).toBe(true);
      expect(e.massa_atomica).not.toBeNull();
    }
  });
});

// salvar e carregar usando um armazenamento falso em memoria
describe("Persistência", () => {
  /*****************************************************************************
   * mem
   * funcao: armazenamento falso no lugar do localStorage, guardado num Map.
   * recebe: nada.
   * retorna: getItem, setItem e o proprio Map (m), para o teste olhar dentro.
   ****************************************************************************/
  const mem = () => {
    const m = new Map<string, string>();
    return {
      getItem: (k: string) => m.get(k) ?? null,
      setItem: (k: string, v: string) => void m.set(k, v),
      m,
    };
  };
  it("salva e carrega", () => {
    const a = mem();
    const s = construir(progressoInicial(), { p: 1, n: 0, e: 1 }).estado;
    salvar(a, s);
    expect(carregar(a).estado).toEqual(s);
  });
  it("dado corrompido vira cópia e recomeça", () => {
    const a = mem();
    // JSON quebrado na chave do progresso
    a.setItem(CHAVE, "{lixo");
    const r = carregar(a);
    expect(r.corrompido).toBe(true);
    expect(a.m.get(`${CHAVE}:corrompido`)).toBe("{lixo");
    expect(r.estado.elementos).toEqual({});
  });
  it("versão antiga sem campos recebe padrão", () => {
    const a = mem();
    // progresso salvo antes de existirem config e quiz
    a.setItem(CHAVE, JSON.stringify({ versao: 1, elementos: {} }));
    expect(carregar(a).estado.config.som).toBe(false);
  });
});
