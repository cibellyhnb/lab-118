/*******************************************************************************
 * $.tsx
 * funcao principal: rota curinga. qualquer endereco que nao existe cai aqui
 * e mostra a tela de pagina nao encontrada dentro do app (com a cortina e os
 * efeitos da rota raiz), igual ao que o site publicado entrega. assim o
 * navegador nao acusa diferenca entre o html do site e a tela desenhada.
 ******************************************************************************/
import { createFileRoute } from "@tanstack/react-router";
import { NaoEncontrada } from "@/interface/NaoEncontrada";

/*******************************************************************************
 * Route
 * funcao: registra a rota curinga e o titulo da pagina.
 ******************************************************************************/
export const Route = createFileRoute("/$")({
  head: () => ({ meta: [{ title: "Página não encontrada - Lab 118" }] }),
  component: NaoEncontrada,
});
