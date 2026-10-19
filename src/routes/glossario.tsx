import { createFileRoute } from "@tanstack/react-router";
import { Glossario } from "@/interface/Glossario";

type Busca = { termo?: string };

export const Route = createFileRoute("/glossario")({
  validateSearch: (s: Record<string, unknown>): Busca => (typeof s["termo"] === "string" ? { termo: s["termo"] } : {}),
  head: () => ({
    meta: [
      { title: "Glossário - Lab 118" },
      { name: "description", content: "Próton, isótopo, íon, número de massa e outros termos do jogo explicados de forma simples." },
      { property: "og:title", content: "Glossário - Lab 118" },
      { property: "og:description", content: "Tire suas dúvidas sobre os termos usados no jogo." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { termo } = Route.useSearch();
  return <Glossario termoInicial={termo} />;
}
