import { useEffect } from "react";
import { audio } from "./som";
import { musica, type Trilha } from "./musica";
import { useProgresso } from "./store";

/** Toca a trilha enquanto o componente existe; respeita o botão SOM/MUDO. */
export function useMusica(trilha: Trilha | null) {
  const { estado } = useProgresso();
  const ligada = estado.config.som;

  useEffect(() => {
    musica.definirLigada(ligada);
  }, [ligada]);

  useEffect(() => {
    if (!trilha) return;
    musica.iniciar(trilha);
    musica.definirLigada(ligada);
    // navegadores só liberam áudio após um toque/tecla (e podem suspendê-lo de novo depois): a cada toque, se não estiver rodando, tenta de novo
    const liberar = () => {
      const a = audio();
      if (a && a.state !== "running") void a.resume();
    };
    window.addEventListener("pointerdown", liberar);
    window.addEventListener("keydown", liberar);
    document.addEventListener("visibilitychange", liberar);
    liberar();
    return () => {
      window.removeEventListener("pointerdown", liberar);
      window.removeEventListener("keydown", liberar);
      document.removeEventListener("visibilitychange", liberar);
      musica.parar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trilha]);
}
