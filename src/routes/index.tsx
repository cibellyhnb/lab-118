/*******************************************************************************
 * index.tsx
 * funcao principal: rota / (tela inicial do jogo).
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Inicio } from "@/interface/Inicio";

/*******************************************************************************
 * Route
 * funcao: registra a rota / com os metadados e a tela Inicio.
 ******************************************************************************/
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lab 118 - Construtor Atômico" },
      { name: "description", content: "Jogo educativo: monte átomos e complete a tabela periódica." },
      { property: "og:title", content: "Lab 118 - Construtor Atômico" },
      { property: "og:description", content: "Monte átomos com as próprias mãos e acenda os 118 elementos da tabela periódica." },
    ],
  }),
  component: Inicio,
});
