import { createFileRoute } from "@tanstack/react-router";
import { Tutorial } from "@/interface/Tutorial";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial - Lab 118" },
      { name: "description", content: "Conheça o ZETA e aprenda a montar seu primeiro átomo: o hidrogênio." },
    ],
  }),
  component: Tutorial,
});
