/*******************************************************************************
 * useMusica.ts
 * funcao principal: hook que liga a musica de fundo de uma tela e segue o
 * botao de som do jogador.
 ******************************************************************************/
import { useEffect } from "react";
import { audio } from "./som";
import { musica, type Trilha } from "./musica";
import { useProgresso } from "./store";

/*******************************************************************************
 * useMusica
 * funcao: toca a trilha enquanto o componente que chamou estiver na tela;
 * respeita o botao SOM/MUDO.
 * recebe: trilha (Trilha), ou null para nao tocar nada.
 * retorna: nada.
 ******************************************************************************/
export function useMusica(trilha: Trilha | null) {
  const { estado } = useProgresso();
  const ligada = estado.config.som;

  // acompanha o botao de som
  useEffect(() => {
    musica.definirLigada(ligada);
  }, [ligada]);

  // troca de trilha: comeca a tocar e para quando o componente sai da tela
  useEffect(() => {
    if (!trilha) return;
    musica.iniciar(trilha);
    musica.definirLigada(ligada);
    // navegadores so liberam audio depois de um toque ou tecla (e podem suspender
    // de novo depois): a cada toque, se nao estiver rodando, tenta outra vez
    const liberar = () => {
      const a = audio();
      if (a && a.state !== "running") void a.resume();
    };
    window.addEventListener("pointerdown", liberar);
    window.addEventListener("keydown", liberar);
    document.addEventListener("visibilitychange", liberar);
    liberar();
    // limpeza: tira os ouvintes e para a musica
    return () => {
      window.removeEventListener("pointerdown", liberar);
      window.removeEventListener("keydown", liberar);
      document.removeEventListener("visibilitychange", liberar);
      musica.parar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trilha]);
}
