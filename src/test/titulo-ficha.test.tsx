/*******************************************************************************
 * titulo-ficha.test.tsx
 * funcao principal: testa se o titulo da aba da ficha so mostra o nome do
 * elemento depois que ele foi descoberto.
 ******************************************************************************/
import { afterEach, describe, expect, it } from "vitest";

import { CHAVE, construir, progressoInicial, salvar } from "@/motor";
import { Route } from "@/routes/elemento.$z";

// roda o head da rota so com os parametros, que e tudo o que ele usa
type Head = (ctx: { params: { z: string } }) => { meta: Record<string, string>[] };
const titulo = (z: string) => {
  const head = Route.options.head as unknown as Head;
  return head({ params: { z } }).meta.find((m) => "title" in m)?.["title"];
};

describe("Título da aba da ficha", () => {
  afterEach(() => window.localStorage.removeItem(CHAVE));

  it("elemento bloqueado não mostra o nome", () => {
    expect(titulo("50")).toBe("Elemento 50 bloqueado - Lab 118");
  });

  it("elemento descoberto mostra nome e símbolo", () => {
    salvar(window.localStorage, construir(progressoInicial(), { p: 50, n: 70, e: 50 }).estado);
    expect(titulo("50")).toBe("Estanho (Sn) - Ficha do elemento - Lab 118");
  });

  it("z que não existe fica com o título genérico", () => {
    expect(titulo("999")).toBe("Ficha do elemento - Lab 118");
  });
});
