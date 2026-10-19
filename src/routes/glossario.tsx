/*******************************************************************************
 * glossario.tsx
 * funcao principal: rota /glossario. aceita ?termo= na url para abrir ja
 * num termo especifico.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Glossario } from "@/interface/Glossario";

// parametros aceitos na url
type Busca = { termo?: string };

/*******************************************************************************
 * Route
 * funcao: registra a rota /glossario e os metadados da pagina.
 ******************************************************************************/
export const Route = createFileRoute("/glossario")({
  // so aceita termo se for texto; qualquer outra coisa e ignorada
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

/*******************************************************************************
 * Pagina
 * funcao: le o termo da url e abre o glossario nele.
 * recebe: nada. retorna: o componente Glossario.
 ******************************************************************************/
function Pagina() {
  const { termo } = Route.useSearch();
  return <Glossario termoInicial={termo} />;
}
