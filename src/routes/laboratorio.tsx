import { createFileRoute } from "@tanstack/react-router";
import { Laboratorio } from "@/interface/Laboratorio";

type Busca = { z?: number };

export const Route = createFileRoute("/laboratorio")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const z = Number(s["z"]);
    return Number.isInteger(z) && z >= 1 && z <= 118 ? { z } : {};
  },
  head: () => ({
    meta: [
      { title: "Laboratório - Lab 118" },
      { name: "description", content: "Arraste prótons, nêutrons e elétrons, veja o átomo mudar e aperte Construir." },
      { property: "og:title", content: "Laboratório - Lab 118" },
      { property: "og:description", content: "Monte átomos, isótopos e íons em um laboratório em pixel art." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { z } = Route.useSearch();
  return <Laboratorio key={z ?? 0} alvoZ={z} />;
}
