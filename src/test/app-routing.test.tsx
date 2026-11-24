/*******************************************************************************
 * app-routing.test.tsx
 * funcao principal: testa se a rota / encontra uma pagina de verdade em vez
 * de cair na tela de nao encontrado, se cada pagina do jogo casa com a sua
 * rota e se enderecos que nao existem caem na rota curinga.
 ******************************************************************************/
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// so casa as rotas, sem rodar loaders nem renderizar: loaders podem precisar de
// servidor ou rede que o teste nao tem, e o jsdom nunca carrega as folhas de estilo
// que o React espera
describe("App routing", () => {
  // se so casar a rota raiz, o / estaria caindo no not found
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  // cada pagina do jogo casa com a propria rota, e nao com a curinga
  it.each([
    ["/mapa", "/mapa"],
    ["/laboratorio", "/laboratorio"],
    ["/elemento/6", "/elemento/$z"],
    ["/quiz", "/quiz"],
    ["/glossario", "/glossario"],
    ["/tutorial", "/tutorial"],
  ])("matches %s to its own route", (caminho, rota) => {
    const router = createRouter({ routeTree });

    expect(router.matchRoutes(caminho).at(-1)?.routeId).toBe(rota);
  });

  // endereco que nao existe cai na rota curinga /$, dentro da raiz (com a cortina e
  // os efeitos), e nao no notFoundComponent da raiz
  it.each(["/nao-existe", "/elemento", "/mapa/xyz"])(
    "matches %s to the catch-all route",
    (caminho) => {
      const router = createRouter({ routeTree });

      expect(router.matchRoutes(caminho).at(-1)?.routeId).toBe("/$");
    },
  );
});
