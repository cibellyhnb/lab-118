/*******************************************************************************
 * tutorial.tsx
 * funcao principal: rota /tutorial, com a historia de abertura e o treino
 * guiado.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { Tutorial } from "@/interface/Tutorial";

/*******************************************************************************
 * Route
 * funcao: registra a rota /tutorial com os metadados e a tela Tutorial.
 ******************************************************************************/
export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial - Lab 118" },
      { name: "description", content: "Conheça o ZETA e aprenda a montar seu primeiro átomo: o hidrogênio." },
    ],
  }),
  component: Tutorial,
});
