/*******************************************************************************
 * quiz.tsx
 * funcao principal: rota /quiz. aceita ?familia= na url para abrir direto
 * o quiz de uma familia.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Quiz } from "@/interface/Quiz";

// parametros aceitos na url
type Busca = { familia?: string };

/*******************************************************************************
 * Route
 * funcao: registra a rota /quiz e os metadados da pagina.
 ******************************************************************************/
export const Route = createFileRoute("/quiz")({
  // so aceita familia se for texto; o Quiz confere se ela existe
  validateSearch: (s: Record<string, unknown>): Busca => (typeof s["familia"] === "string" ? { familia: s["familia"] } : {}),
  head: () => ({
    meta: [
      { title: "Quiz - Lab 118" },
      { name: "description", content: "Teste o que você aprendeu sobre átomos, isótopos, íons e as famílias da tabela periódica." },
      { property: "og:title", content: "Quiz - Lab 118" },
      { property: "og:description", content: "Perguntas rápidas e amigáveis sobre os elementos que você descobriu." },
    ],
  }),
  component: Pagina,
});

/*******************************************************************************
 * Pagina
 * funcao: le a familia da url e abre o quiz.
 * recebe: nada. retorna: o componente Quiz.
 ******************************************************************************/
function Pagina() {
  const { familia } = Route.useSearch();
  return <Quiz familiaInicial={familia} />;
}
