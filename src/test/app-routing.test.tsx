/*******************************************************************************
 * app-routing.test.tsx
 * funcao principal: testa se a rota / encontra uma pagina de verdade em vez
 * de cair na tela de nao encontrado.
 ******************************************************************************/
import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// so casa as rotas, sem rodar loaders nem renderizar: loaders podem precisar de
// servidor ou rede que o teste nao tem, e o jsdom nunca carrega as folhas de estilo
// que o React espera
describe("App routing", () => {
  // se so casar a rota raiz, o / estaria caindo no not found
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
