/*******************************************************************************
 * Tutorial.tsx
 * funcao principal: tutorial do jogo: primeiro a historia de abertura, depois
 * o laboratorio guiado passo a passo pelo Zula, com a tela escurecida em
 * volta do que o jogador deve mexer.
 ******************************************************************************/
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Particulas } from "@/motor";
import { Confete } from "./Celebracao";
import { Dialogo } from "./Dialogo";
import { Historia } from "./Historia";
import { Laboratorio, type Guia } from "./Laboratorio";
import type { Humor } from "./Zula";
import { sons, useProgresso } from "./store";
import { useMusica } from "./useMusica";

// o que o laboratorio manda para o tutorial a cada CONSTRUIR
type Montagem = Parameters<Guia["onConstruir"]>[0];

// um passo do tutorial; alvo lista os data-tut que ficam iluminados
type Passo = {
  texto: string;
  alvo: string[];
  humor?: Humor;
  // se existir, o passo avanca sozinho quando a condicao for cumprida; sem ela, mostra o botao
  auto?: (v: Particulas, m: Montagem | null) => boolean;
  // aviso extra quando o jogador passa do ponto
  dica?: (v: Particulas) => string | null;
  rotulo?: string;
  confete?: boolean;
};

// confere se a ultima montagem construida tem exatamente p, n, e e foi valida
const igual = (m: Montagem | null, p: number, n: number, e: number) =>
  !!m && m.particulas.p === p && m.particulas.n === n && m.particulas.e === e && m.classificacao.valido;

/*******************************************************************************
 * PASSOS
 * funcao: os passos do tutorial, em ordem: painel, proton, eletron,
 * construir o H, neutron (deuterio), ion H+ e o desafio do helio.
 ******************************************************************************/
const PASSOS: Passo[] = [
  {
    texto: "Este é o laboratório! No painel você acompanha o que está montando: nome, símbolo e os números do átomo. Por enquanto ele mostra '?', porque a bancada está vazia.",
    alvo: ["painel"],
  },
  {
    texto: "Vamos começar pelo PRÓTON, a peça vermelha. Arraste-o até o átomo, ou aperte o botão +. Coloque exatamente 1.",
    alvo: ["col-p"],
    auto: (v) => v.p === 1 && v.n === 0 && v.e === 0,
    dica: (v) => (v.p > 1 ? "Passou um pouco! Aperte − até sobrar 1 próton." : null),
  },
  {
    texto: "Olha só: apareceu HIDROGÊNIO! O número de prótons (Z) decide qual elemento é. 1 próton é hidrogênio, 2 é hélio, 3 é lítio... (O painel diz 'cátion' porque ainda não há elétron. Já já arrumamos isso!)",
    alvo: ["painel"],
    humor: "feliz",
  },
  {
    texto: "Agora o ELÉTRON, a peça azul. Um átomo neutro tem tantos elétrons quanto prótons: as cargas + e − se anulam. Coloque 1 elétron.",
    alvo: ["col-e"],
    auto: (v) => v.p === 1 && v.n === 0 && v.e === 1,
    dica: (v) => (v.e > 1 ? "Elétrons demais! Aperte − até sobrar 1." : null),
  },
  {
    texto: "Átomo neutro de hidrogênio pronto! Aperte ★ CONSTRUIR para registrar a sua descoberta.",
    alvo: ["construir"],
    auto: (_, m) => igual(m, 1, 0, 1),
  },
  {
    texto: "DESCOBERTA! O hidrogênio entrou na sua tabela e você ganhou a primeira ESTRELA. Cada elemento tem 3 estrelas: átomo, isótopo e íon. Vamos atrás das outras duas!",
    alvo: [],
    humor: "feliz",
    confete: true,
  },
  {
    texto: "Agora o NÊUTRON, a peça cinza. Ele fica no núcleo, não tem carga e muda a MASSA do átomo. Coloque 1 nêutron.",
    alvo: ["col-n"],
    auto: (v) => v.p === 1 && v.n === 1 && v.e === 1,
    dica: (v) => (v.n > 1 ? "Só 1 nêutron por enquanto. Aperte − uma vez." : null),
  },
  {
    texto: "Repare: a massa (A) virou 2. Continua sendo hidrogênio, só ficou mais pesado! Isso é um ISÓTOPO (este se chama deutério). Aperte CONSTRUIR.",
    alvo: ["construir"],
    auto: (_, m) => igual(m, 1, 1, 1),
  },
  {
    texto: "Terceira estrela: o ÍON. Tire o elétron com o botão −. Sem ele, sobra carga positiva.",
    alvo: ["col-e"],
    auto: (v) => v.p === 1 && v.e === 0,
  },
  {
    texto: "Carga +1! Elétrons mudam a carga, não o elemento. Esse é o íon H⁺. Aperte CONSTRUIR.",
    alvo: ["construir"],
    auto: (_, m) => !!m && m.classificacao.valido && m.particulas.p === 1 && m.particulas.e === 0,
  },
  {
    texto: "Desafio final: monte o HÉLIO neutro! Ele tem 2 prótons, 2 nêutrons e 2 elétrons. Ajuste os contadores e aperte CONSTRUIR.",
    alvo: ["particulas", "construir"],
    auto: (_, m) => igual(m, 2, 2, 2),
    dica: (v) => (v.p === 2 && v.n === 2 && v.e === 2 ? "Isso! Agora é só apertar CONSTRUIR." : null),
  },
  {
    texto: "Missão cumprida, Cientista-Chefe! Regra de ouro: PRÓTONS definem o elemento, NÊUTRONS o isótopo e ELÉTRONS o íon. Já deixei o hidrogênio e o hélio na sua tabela. Os outros 116 cadeados são seus!",
    alvo: [],
    humor: "feliz",
    confete: true,
    rotulo: "IR PARA A TABELA ★",
  },
];

// retangulo na tela (posicao e tamanho em pixels)
type Ret = { top: number; left: number; w: number; h: number };

/*******************************************************************************
 * achar
 * funcao: acha os elementos marcados com data-tut e calcula um retangulo
 * que envolve todos eles, com 6 px de folga.
 * recebe: alvos (valores de data-tut).
 * retorna: o retangulo, ou null se nenhum alvo estiver na tela.
 ******************************************************************************/
function achar(alvos: string[]): Ret | null {
  let t = Infinity;
  let l = Infinity;
  let b = -Infinity;
  let r = -Infinity;
  for (const a of alvos) {
    const el = document.querySelector<HTMLElement>(`[data-tut="${a}"]`);
    if (!el) continue;
    const q = el.getBoundingClientRect();
    t = Math.min(t, q.top);
    l = Math.min(l, q.left);
    b = Math.max(b, q.bottom);
    r = Math.max(r, q.right);
  }
  if (!Number.isFinite(t)) return null;
  const m = 6;
  return { top: Math.max(0, t - m), left: Math.max(0, l - m), w: r - l + 2 * m, h: b - t + 2 * m };
}

/*******************************************************************************
 * Foco
 * funcao: escurece a tela, deixando um "buraco" iluminado em volta dos
 * alvos. cliques fora dele sao bloqueados.
 * recebe: alvos (valores de data-tut).
 * retorna: quatro faixas escuras em volta do buraco, a moldura dourada e a
 * seta; sem alvo, a tela inteira escura.
 ******************************************************************************/
function Foco({ alvos }: { alvos: string[] }) {
  const [ret, setRet] = useState<Ret | null>(null);
  // texto que so muda quando a lista de alvos muda, para usar nas deps do efeito
  const chave = alvos.join("|");

  useEffect(() => {
    let vivo = true;
    let ajustado = false;
    let ant = "";
    // a cada quadro, recalcula onde estao os alvos (a tela pode rolar ou mudar de tamanho)
    const laco = () => {
      if (!vivo) return;
      const n = achar(alvos);
      if (n && !ajustado) {
        // rola a pagina uma vez para o alvo ficar visivel, acima da caixa de dialogo
        // (que ocupa ~230px embaixo)
        ajustado = true;
        const excesso = n.top + n.h - (window.innerHeight - 230);
        if (excesso > 0) window.scrollBy(0, Math.min(excesso, Math.max(0, n.top - 10)));
        else if (n.top < 10) window.scrollBy(0, n.top - 10);
      }
      // so atualiza o estado se o retangulo mudou, para nao redesenhar a toa
      const s = n ? `${n.top},${n.left},${n.w},${n.h}` : "";
      if (s !== ant) {
        ant = s;
        setRet(n);
      }
      requestAnimationFrame(laco);
    };
    laco();
    // limpeza: para o laco
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const escuro = "color-mix(in oklab, var(--ink) 72%, transparent)";
  if (!ret) return <div aria-hidden className="fixed inset-0 z-[60]" style={{ background: escuro }} />;
  const fundo = ret.top + ret.h;
  const dir = ret.left + ret.w;
  return (
    <div aria-hidden>
      {/* faixas escuras: em cima, embaixo, a esquerda e a direita do buraco */}
      <div className="fixed inset-x-0 top-0 z-[60]" style={{ height: ret.top, background: escuro }} />
      <div className="fixed inset-x-0 z-[60]" style={{ top: fundo, bottom: 0, background: escuro }} />
      <div className="fixed left-0 z-[60]" style={{ top: ret.top, height: ret.h, width: ret.left, background: escuro }} />
      <div className="fixed right-0 z-[60]" style={{ top: ret.top, height: ret.h, left: dir, background: escuro }} />
      {/* moldura dourada e seta apontando para o alvo */}
      <div className="anim-shine pointer-events-none fixed z-[61] border-[4px] border-gold" style={{ top: ret.top, left: ret.left, width: ret.w, height: ret.h }} />
      <span
        className="font-display anim-arrow pointer-events-none fixed z-[61] text-xl text-gold"
        style={{ top: Math.max(0, ret.top - 34), left: ret.left + ret.w / 2 - 10, textShadow: "2px 2px 0 var(--ink)" }}
      >
        ▼
      </span>
    </div>
  );
}

/*******************************************************************************
 * Guiado
 * funcao: laboratorio do tutorial com os passos do Zula. passos com auto
 * avancam sozinhos quando o jogador faz o que foi pedido.
 * recebe: nada.
 * retorna: o laboratorio em modo treino, o foco, o dialogo e o botao de
 * pular.
 ******************************************************************************/
function Guiado() {
  const { concluirTutorial, tocar } = useProgresso();
  const navegar = useNavigate();
  useMusica("laboratorio");
  const [passo, setPasso] = useState(0);
  // particulas atuais e ultima montagem construida, vindas do laboratorio
  const [v, setV] = useState<Particulas>({ p: 0, n: 0, e: 0 });
  const [montagem, setMontagem] = useState<Montagem | null>(null);
  const passoRef = useRef(passo);
  passoRef.current = passo;

  const p = PASSOS[passo]!;

  // vai para o proximo passo e esquece a montagem anterior
  const avancar = useCallback(() => {
    setMontagem(null);
    setPasso((x) => Math.min(PASSOS.length - 1, x + 1));
  }, []);

  // condicao do passo cumprida: som de acerto e avanca depois de 650 ms
  useEffect(() => {
    if (!p.auto || !p.auto(v, montagem)) return;
    tocar(sons.acerto);
    const id = window.setTimeout(avancar, 650);
    return () => window.clearTimeout(id);
  }, [v, montagem, p, avancar, tocar]);

  // passos de comemoracao tocam o som de descoberta
  useEffect(() => {
    if (p.confete) tocar(sons.descoberta);
  }, [p, tocar]);

  // fecha o tutorial: concluindo (leva H e He para a tabela real e vai para o mapa)
  // ou pulando (volta para a tela inicial)
  const terminar = (conceder: boolean) => {
    concluirTutorial(conceder);
    void navegar({ to: conceder ? "/mapa" : "/" });
  };

  // ligacao com o laboratorio
  const guia: Guia = {
    onMudar: setV,
    onConstruir: (r) => setMontagem(r),
  };

  const dica = p.dica?.(v) ?? null;
  const ultimo = passo === PASSOS.length - 1;

  return (
    <>
      <Laboratorio guia={guia} />
      <Foco alvos={p.alvo} />
      {p.confete && <Confete />}
      <button type="button" className="pixel-btn btn-dark fixed right-3 top-3 z-[80] text-[9px]" onClick={() => terminar(false)}>
        PULAR TUTORIAL
      </button>
      <Dialogo
        key={passo}
        texto={p.texto}
        humor={p.humor ?? "normal"}
        rotulo={p.rotulo ?? "PRÓXIMO ▶"}
        // passo com auto nao tem botao; o ultimo passo conclui o tutorial
        onAvancar={p.auto ? undefined : ultimo ? () => terminar(true) : avancar}
        extra={dica ? <p className="font-display text-[9px] text-proton">{dica}</p> : undefined}
      />
    </>
  );
}

/*******************************************************************************
 * Tutorial
 * funcao: tela do tutorial: mostra a historia e, quando ela acaba ou e
 * pulada, o laboratorio guiado.
 * recebe: nada. retorna: Historia ou Guiado.
 ******************************************************************************/
export function Tutorial() {
  const [fase, setFase] = useState<"historia" | "lab">("historia");
  if (fase === "historia") return <Historia onFim={() => setFase("lab")} />;
  return <Guiado />;
}
