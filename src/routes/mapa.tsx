/*******************************************************************************
 * mapa.tsx
 * funcao principal: rota /mapa, a tabela periodica com o progresso do
 * jogador.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Mapa } from "@/interface/Mapa";

/*******************************************************************************
 * Route
 * funcao: registra a rota /mapa com os metadados e a tela Mapa.
 ******************************************************************************/
export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa - Lab 118" },
      { name: "description", content: "Monte átomos com prótons, nêutrons e elétrons e desbloqueie os 118 elementos da tabela periódica." },
      { property: "og:title", content: "Mapa - Lab 118" },
      { property: "og:description", content: "Complete a tabela periódica construindo cada átomo com as próprias mãos." },
    ],
  }),
  component: Mapa,
});
