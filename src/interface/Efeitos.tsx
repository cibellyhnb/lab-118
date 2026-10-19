/*******************************************************************************
 * Efeitos.tsx
 * funcao principal: efeitos globais do jogo: sons ao passar o mouse e ao
 * clicar nos botoes, e cortina com som ao trocar de tela.
 ******************************************************************************/
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { sons, useProgresso } from "./store";

// seletor dos elementos que ganham som: botoes e blocos-link da tabela
const ALVO = ".pixel-btn, a.pixel-block";

/*******************************************************************************
 * Efeitos
 * funcao: da charme ao jogo todo sem mexer em cada botao: tique ao passar
 * o mouse, toquinho ao clicar, cortininha e som ao trocar de tela.
 * recebe: nada.
 * retorna: a cortina, que reaparece a cada troca de tela.
 ******************************************************************************/
export function Efeitos() {
  const { tocar } = useProgresso();
  const caminho = useRouterState({ select: (r) => r.location.pathname });
  // na primeira tela nao toca o som de troca
  const primeira = useRef(true);

  // um ouvinte so no document pega todos os botoes (delegacao de eventos)
  useEffect(() => {
    // acha o botao sob o evento, ignorando os desativados
    const alvo = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(ALVO) ?? null;
      return el && !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true" ? el : null;
    };
    const entrou = (e: PointerEvent) => {
      // no toque nao existe "passar por cima"
      if (e.pointerType === "touch") return;
      const el = alvo(e);
      // so toca ao entrar no botao, nao ao andar entre os filhos dele
      if (el && !el.contains(e.relatedTarget as Node | null)) tocar(sons.hover);
    };
    const clicou = (e: MouseEvent) => {
      if (alvo(e)) tocar(sons.clique);
    };
    document.addEventListener("pointerover", entrou);
    document.addEventListener("click", clicou);
    return () => {
      document.removeEventListener("pointerover", entrou);
      document.removeEventListener("click", clicou);
    };
  }, [tocar]);

  // som a cada troca de tela
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    tocar(sons.pagina);
  }, [caminho, tocar]);

  // a key muda com a rota, entao a div e recriada e a animacao da cortina recomeca
  return <div key={caminho} aria-hidden className="anim-cortina pointer-events-none fixed inset-0 z-[100] bg-ink" />;
}
