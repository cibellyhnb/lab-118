import { describe, expect, it } from "vitest";
import { classificar, distribuirCamadas } from "./classificar";
import { ELEMENTOS } from "./dados";
import { construir, progressoInicial } from "./progresso";
import { avaliarMissao, gerarMissao, missaoDescoberta } from "./missoes";
import { carregar, CHAVE, salvar } from "./persistencia";

const c = (p: number, n: number, e: number) => classificar({ p, n, e });

describe("Seção 15 - casos do motor", () => {
  it("1,0,1 H-1 neutro estável", () => {
    const r = c(1, 0, 1);
    expect(r.elemento?.nome).toBe("Hidrogênio");
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo).toEqual({ rotulo: "H-1", status: "estavel" });
  });
  it("1,1,1 H-2 estável", () => expect(c(1, 1, 1).nuclideo).toEqual({ rotulo: "H-2", status: "estavel" }));
  it("1,2,1 H-3 radioativo", () => expect(c(1, 2, 1).nuclideo?.status).toBe("radioativo"));
  it("1,0,0 H⁺ núcleo nu", () => {
    const r = c(1, 0, 0);
    expect(r.valido).toBe(true);
    expect(r.especie).toBe("cation");
    expect(r.carga).toBe(1);
    expect(r.notacao).toBe("H⁺");
  });
  it("1,0,2 H⁻", () => {
    const r = c(1, 0, 2);
    expect(r.especie).toBe("anion");
    expect(r.carga).toBe(-1);
    expect(r.notacao).toBe("H⁻");
  });
  it("2,2,2 He-4", () => {
    const r = c(2, 2, 2);
    expect(r.elemento?.nome).toBe("Hélio");
    expect(r.nuclideo).toEqual({ rotulo: "He-4", status: "estavel" });
  });
  it("2,1,2 He-3", () => expect(c(2, 1, 2).nuclideo).toEqual({ rotulo: "He-3", status: "estavel" }));
  it("6,6,6 C-12", () => {
    const r = c(6, 6, 6);
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo).toEqual({ rotulo: "C-12", status: "estavel" });
  });
  it("6,8,6 C-14 radioativo", () => expect(c(6, 8, 6).nuclideo).toEqual({ rotulo: "C-14", status: "radioativo" }));
  it("6,6,5 C⁺", () => {
    const r = c(6, 6, 5);
    expect(r.especie).toBe("cation");
    expect(r.notacao).toBe("C⁺");
  });
  it("6,30,6 não catalogado", () => {
    const r = c(6, 30, 6);
    expect(r.especie).toBe("atomo_neutro");
    expect(r.nuclideo?.status).toBe("nao_catalogado");
  });
  it("8,8,10 O²⁻", () => {
    const r = c(8, 8, 10);
    expect(r.notacao).toBe("O²⁻");
    expect(r.carga).toBe(-2);
    expect(r.especie).toBe("anion");
  });
  it("11,12,10 Na⁺ Na-23 estável", () => {
    const r = c(11, 12, 10);
    expect(r.notacao).toBe("Na⁺");
    expect(r.nuclideo).toEqual({ rotulo: "Na-23", status: "estavel" });
  });
  it("17,18,18 Cl⁻ Cl-35", () => {
    const r = c(17, 18, 18);
    expect(r.notacao).toBe("Cl⁻");
    expect(r.nuclideo).toEqual({ rotulo: "Cl-35", status: "estavel" });
  });
  it("26,30,24 Fe²⁺ Fe-56", () => {
    const r = c(26, 30, 24);
    expect(r.notacao).toBe("Fe²⁺");
    expect(r.nuclideo).toEqual({ rotulo: "Fe-56", status: "estavel" });
  });
  it("118,176,118 Og A=294", () => {
    const r = c(118, 176, 118);
    expect(r.elemento?.simbolo).toBe("Og");
    expect(r.especie).toBe("atomo_neutro");
    expect(r.a).toBe(294);
  });
  it("0,1,0 REG-01 com aviso de nêutron livre", () => {
    const r = c(0, 1, 0);
    expect(r.valido).toBe(false);
    expect(r.erro).toBe("SEM_PROTONS");
    expect(r.avisos).toContain("NEUTRON_LIVRE_INSTAVEL");
  });
  it("119,0,119 REG-02", () => expect(c(119, 0, 119).erro).toBe("Z_ACIMA_DE_118"));
  it("1,0,5 REG-06", () => expect(c(1, 0, 5).erro).toBe("ELETRONS_FORA_DO_LIMITE"));
  it("REG-06 nêutrons acima de 200", () => expect(c(6, 201, 6).erro).toBe("NEUTRONS_FORA_DO_LIMITE"));
});

describe("Regras", () => {
  it("REG-03: só Z define o elemento", () => {
    for (let n = 0; n < 20; n++) for (let e = 0; e <= 9; e++) expect(c(6, n, e).elemento?.simbolo).toBe("C");
  });
  it("REG-04: A = Z + N e carga 0 sse E = Z (propriedade)", () => {
    for (let z = 1; z <= 118; z += 3)
      for (let n = 0; n <= 200; n += 17)
        for (let e = 0; e <= z + 3; e++) {
          const r = c(z, n, e);
          expect(r.a).toBe(z + n);
          expect(r.carga === 0).toBe(e === z);
        }
  });
  it("REG-10: carga rara", () => {
    expect(c(8, 8, 3).avisos).toContain("CARGA_RARA");
    expect(c(8, 8, 4).avisos).not.toContain("CARGA_RARA");
  });
  it("REG-11: camadas", () => {
    expect(distribuirCamadas(11, 11)).toEqual([2, 8, 1]);
    expect(distribuirCamadas(11, 10)).toEqual([2, 8]);
    expect(distribuirCamadas(8, 10)).toEqual([2, 8]);
    expect(distribuirCamadas(1, 2)).toEqual([2]);
    expect(distribuirCamadas(2, 3)).toEqual([2, 1]);
    expect(distribuirCamadas(1, 0)).toEqual([]);
  });
});

describe("Progresso e estrelas (RF-01 a RF-03)", () => {
  it("descoberta só com átomo neutro e variantes anteriores passam a contar", () => {
    let s = progressoInicial();
    const r1 = construir(s, { p: 1, n: 0, e: 0 });
    s = r1.estado;
    expect(s.elementos["1"]?.estrelas).toEqual([false, false, false]);
    expect(s.elementos["1"]?.ions).toEqual([1]);
    const r2 = construir(s, { p: 1, n: 0, e: 1 });
    expect(r2.eventos.map((e) => e.tipo)).toContain("ELEMENTO_DESCOBERTO");
    expect(r2.estado.elementos["1"]?.estrelas).toEqual([true, false, true]);
    const r3 = construir(r2.estado, { p: 1, n: 1, e: 1 });
    expect(r3.estado.elementos["1"]?.estrelas).toEqual([true, true, true]);
  });
  it("não catalogado não registra isótopo", () => {
    const r = construir(progressoInicial(), { p: 6, n: 30, e: 6 });
    expect(r.estado.elementos["6"]?.isotopos).toEqual([]);
    expect(r.estado.elementos["6"]?.estrelas[0]).toBe(true);
  });
  it("aplicar o mesmo build duas vezes não duplica nada", () => {
    const a = construir(progressoInicial(), { p: 6, n: 6, e: 6 });
    const b = construir(a.estado, { p: 6, n: 6, e: 6 });
    expect(b.eventos).toEqual([]);
    expect(b.estado).toEqual(a.estado);
  });
  it("entrada inválida não altera estado", () => {
    const s = progressoInicial();
    expect(construir(s, { p: 0, n: 1, e: 0 }).estado).toBe(s);
  });
});

describe("Missão M1", () => {
  it("toda missão de descoberta tem solução aceita pelo motor", () => {
    for (const el of ELEMENTOS) {
      const m = missaoDescoberta(el.z);
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
    }
  });
});

describe("Validação dos dados", () => {
  it("118 z únicos, camadas somam z, posições únicas", () => {
    expect(new Set(ELEMENTOS.map((e) => e.z)).size).toBe(118);
    for (const e of ELEMENTOS) expect(e.camadas.reduce((x, y) => x + y, 0)).toBe(e.z);
    expect(new Set(ELEMENTOS.map((e) => `${e.posicao.linha}:${e.posicao.coluna}`)).size).toBe(118);
  });
  it("contagem por categoria", () => {
    const cont: Record<string, number> = {};
    for (const e of ELEMENTOS) cont[e.categoria] = (cont[e.categoria] ?? 0) + 1;
    expect(cont).toEqual({
      metal_alcalino: 6, metal_alcalino_terroso: 6, metal_transicao: 38, metal_representativo: 12,
      semimetal: 6, nao_metal: 7, halogenio: 6, gas_nobre: 7, lantanideo: 15, actinideo: 15,
    });
  });
  it("valência = última camada nos grupos 1, 2 e 13-18", () => {
    for (const e of ELEMENTOS) {
      const principal = e.grupo !== null && (e.grupo <= 2 || e.grupo >= 13);
      expect(e.eletrons_valencia).toBe(principal ? e.camadas.at(-1) : null);
    }
  });
  it("isótopos com A ≥ z; Z 1-10 com catálogo e ao menos 1 estável", () => {
    for (const e of ELEMENTOS) for (const i of e.isotopos) expect(i.a).toBeGreaterThanOrEqual(e.z);
    for (const e of ELEMENTOS.slice(0, 10)) {
      expect(e.isotopos.some((i) => i.estabilidade === "estavel")).toBe(true);
      expect(e.massa_atomica).not.toBeNull();
    }
  });
});

describe("Persistência", () => {
  const mem = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };
  it("salva e carrega", () => {
    const a = mem();
    const s = construir(progressoInicial(), { p: 1, n: 0, e: 1 }).estado;
    salvar(a, s);
    expect(carregar(a).estado).toEqual(s);
  });
  it("dado corrompido vira cópia e recomeça", () => {
    const a = mem();
    a.setItem(CHAVE, "{lixo");
    const r = carregar(a);
    expect(r.corrompido).toBe(true);
    expect(a.m.get(`${CHAVE}:corrompido`)).toBe("{lixo");
    expect(r.estado.elementos).toEqual({});
  });
  it("versão antiga sem campos recebe padrão", () => {
    const a = mem();
    a.setItem(CHAVE, JSON.stringify({ versao: 1, elementos: {} }));
    expect(carregar(a).estado.config.som).toBe(false);
  });
});
