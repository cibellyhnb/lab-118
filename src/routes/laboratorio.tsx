/*******************************************************************************
 * laboratorio.tsx
 * funcao principal: rota /laboratorio. aceita ?z= na url para abrir o
 * laboratorio ja com a missao daquele elemento.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Laboratorio } from "@/interface/Laboratorio";

// parametros aceitos na url
type Busca = { z?: number };

/*******************************************************************************
 * Route
 * funcao: registra a rota /laboratorio e os metadados da pagina.
 ******************************************************************************/
export const Route = createFileRoute("/laboratorio")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    // so aceita z inteiro entre 1 e 118; o resto vira laboratorio livre
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

/*******************************************************************************
 * Pagina
 * funcao: le o z da url e abre o laboratorio.
 * recebe: nada.
 * retorna: o Laboratorio; a key faz ele recomecar do zero quando o z muda.
 ******************************************************************************/
function Pagina() {
  const { z } = Route.useSearch();
  return <Laboratorio key={z ?? 0} alvoZ={z} />;
}
