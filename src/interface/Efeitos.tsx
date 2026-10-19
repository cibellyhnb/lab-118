import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { sons, useProgresso } from "./store";

const ALVO = ".pixel-btn, a.pixel-block";

/**
 * Charme do jogo todo, sem precisar mexer em cada botão:
 * tique ao passar o mouse, toquinho ao clicar, cortininha e som ao trocar de tela.
 */
export function Efeitos() {
  const { tocar } = useProgresso();
  const caminho = useRouterState({ select: (r) => r.location.pathname });
  const primeira = useRef(true);

  useEffect(() => {
    const alvo = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(ALVO) ?? null;
      return el && !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true" ? el : null;
    };
    const entrou = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = alvo(e);
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

  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    tocar(sons.pagina);
  }, [caminho, tocar]);

  return <div key={caminho} aria-hidden className="anim-cortina pointer-events-none fixed inset-0 z-[100] bg-ink" />;
}
