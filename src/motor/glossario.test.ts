import { describe, expect, it } from "vitest";
import { GLOSSARIO, NOME_CATEGORIA, NOME_CATEGORIA_GLOSSARIO, buscarGlossario, normalizar, termoPorId } from "./index";

describe("glossário", () => {
  it("ids únicos, textos preenchidos e categorias válidas", () => {
    const ids = GLOSSARIO.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of GLOSSARIO) {
      expect(t.termo.length).toBeGreaterThan(1);
      expect(t.definicao.length).toBeGreaterThan(20);
      expect(NOME_CATEGORIA_GLOSSARIO[t.categoria]).toBeTruthy();
    }
  });

  it("todo 'veja também' aponta para um termo que existe (e não para si mesmo)", () => {
    for (const t of GLOSSARIO) for (const v of t.ver ?? []) {
      expect(termoPorId(v), `${t.id} -> ${v}`).toBeDefined();
      expect(v).not.toBe(t.id);
    }
  });

  it("cobre as siglas do painel e todas as categorias de elemento da tabela", () => {
    for (const s of ["Z", "N", "E", "A", "q"]) expect(GLOSSARIO.some((t) => t.sigla === s)).toBe(true);
    for (const nome of Object.values(NOME_CATEGORIA)) {
      const n = normalizar(nome);
      expect(GLOSSARIO.some((t) => normalizar(t.termo).includes(n.replace("-", " ")) || normalizar(t.termo).includes(n)), nome).toBe(true);
    }
  });

  it("a busca ignora acentos e maiúsculas, acha por sigla e por sinônimo", () => {
    expect(buscarGlossario("ELETRON")[0]?.id).toBe("eletron");
    expect(buscarGlossario("isotopo")[0]?.id).toBe("isotopo");
    expect(buscarGlossario("Z")[0]?.id).toBe("numero-atomico");
    expect(buscarGlossario("familia").some((t) => t.id === "grupo")).toBe(true);
    expect(buscarGlossario("xyzxyz")).toEqual([]);
    expect(buscarGlossario("", "jogo").every((t) => t.categoria === "jogo")).toBe(true);
  });
});
