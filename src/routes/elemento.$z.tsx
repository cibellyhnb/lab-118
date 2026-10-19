import { createFileRoute } from "@tanstack/react-router";
import { elementoPorZ } from "@/motor";
import { Ficha } from "@/interface/Ficha";

export const Route = createFileRoute("/elemento/$z")({
  head: ({ params }) => {
    const el = elementoPorZ(Number(params.z));
    const t = el ? `${el.nome} (${el.simbolo}) - Ficha do elemento` : "Ficha do elemento";
    return {
      meta: [
        { title: `${t} - Lab 118` },
        { name: "description", content: el ? `Ficha do ${el.nome}: isótopos, massa atômica, família e suas variantes.` : "Ficha do elemento." },
        { property: "og:title", content: t },
        { property: "og:description", content: "Consulte o elemento que você descobriu no Lab 118." },
      ],
    };
  },
  component: Pagina,
});

function Pagina() {
  const { z } = Route.useParams();
  return <Ficha z={Number(z)} />;
}
