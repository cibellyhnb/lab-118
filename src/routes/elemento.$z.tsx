/*******************************************************************************
 * elemento.$z.tsx
 * funcao principal: rota /elemento/$z, que mostra a ficha do elemento de
 * numero atomico z.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { carregar, descoberto, elementoPorZ, nomeComArtigo } from "@/motor";
import { Ficha } from "@/interface/Ficha";

/*******************************************************************************
 * liberado
 * funcao: diz se o jogador ja descobriu o elemento, lendo o progresso salvo.
 * fora do navegador ou com o armazenamento bloqueado, conta como bloqueado.
 * recebe: z (number). retorna: boolean.
 ******************************************************************************/
function liberado(z: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return descoberto(carregar(window.localStorage).estado, z);
  } catch {
    return false;
  }
}

/*******************************************************************************
 * Route
 * funcao: registra a rota /elemento/$z. o titulo e a descricao usam o nome
 * do elemento so quando ele ja foi descoberto, para a aba do navegador nao
 * entregar a resposta de um elemento bloqueado.
 ******************************************************************************/
export const Route = createFileRoute("/elemento/$z")({
  head: ({ params }) => {
    // z vem da url como texto
    const z = Number(params.z);
    const el = elementoPorZ(z);
    const aberto = el !== undefined && liberado(z);
    const t = !el
      ? "Ficha do elemento"
      : aberto
        ? `${el.nome} (${el.simbolo}) - Ficha do elemento`
        : `Elemento ${z} bloqueado`;
    return {
      meta: [
        { title: `${t} - Lab 118` },
        {
          name: "description",
          content:
            el && aberto
              ? `Ficha d${nomeComArtigo(el.nome)}: isótopos, massa atômica, família e suas variantes.`
              : "Ficha do elemento.",
        },
        { property: "og:title", content: t },
        {
          property: "og:description",
          content: "Consulte o elemento que você descobriu no Lab 118.",
        },
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
