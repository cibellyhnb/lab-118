import { createFileRoute } from "@tanstack/react-router";
import { Quiz } from "@/interface/Quiz";

type Busca = { familia?: string };

export const Route = createFileRoute("/quiz")({
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

function Pagina() {
  const { familia } = Route.useSearch();
  return <Quiz familiaInicial={familia} />;
}
