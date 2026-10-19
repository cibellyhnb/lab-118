/*******************************************************************************
 * elemento.$z.tsx
 * funcao principal: rota /elemento/$z, que mostra a ficha do elemento de
 * numero atomico z.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { elementoPorZ } from "@/motor";
import { Ficha } from "@/interface/Ficha";

/*******************************************************************************
 * Route
 * funcao: registra a rota /elemento/$z. o titulo e a descricao usam o nome
 * do elemento quando o z existe.
 ******************************************************************************/
export const Route = createFileRoute("/elemento/$z")({
  head: ({ params }) => {
    // z vem da url como texto
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

/*******************************************************************************
 * Pagina
 * funcao: le o z da url e abre a ficha.
 * recebe: nada. retorna: o componente Ficha do elemento.
 ******************************************************************************/
function Pagina() {
  const { z } = Route.useParams();
  return <Ficha z={Number(z)} />;
}
