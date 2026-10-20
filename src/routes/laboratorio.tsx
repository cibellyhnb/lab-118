/*******************************************************************************
 * laboratorio.tsx
 * funcao principal: rota /laboratorio. aceita ?z= na url para abrir o
 * laboratorio ja com a missao daquele elemento, e ?retomar=1 para devolver
 * o ultimo atomo montado quando o jogador volta da ficha.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Laboratorio } from "@/interface/Laboratorio";

// parametros aceitos na url
type Busca = { z?: number; retomar?: 1 };

/*******************************************************************************
 * Route
 * funcao: registra a rota /laboratorio e os metadados da pagina.
 ******************************************************************************/
export const Route = createFileRoute("/laboratorio")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    // so aceita z inteiro entre 1 e 118; o resto vira laboratorio livre
    const z = Number(s["z"]);
    if (!(Number.isInteger(z) && z >= 1 && z <= 118)) return {};
    // retomar so vale junto com um z valido
    return String(s["retomar"]) === "1" ? { z, retomar: 1 } : { z };
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
 * funcao: le o z e o retomar da url e abre o laboratorio.
 * recebe: nada.
 * retorna: o Laboratorio; a key faz ele recomecar do zero quando o z muda
 * (ganhar o retomar na mesma entrada nao remonta a tela).
 ******************************************************************************/
function Pagina() {
  const { z, retomar } = Route.useSearch();
  return <Laboratorio key={z ?? 0} alvoZ={z} retomar={retomar === 1} />;
}
