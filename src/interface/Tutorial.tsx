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

type Montagem = Parameters<Guia["onConstruir"]>[0];

type Passo = {
  texto: string;
  alvo: string[];
  humor?: Humor;
  /** Se existir, o passo avança sozinho quando a condição for cumprida. Sem ela, mostra o botão. */
  auto?: (v: Particulas, m: Montagem | null) => boolean;
  /** Aviso extra quando o jogador passa do ponto. */
  dica?: (v: Particulas) => string | null;
  rotulo?: string;
  confete?: boolean;
};

const igual = (m: Montagem | null, p: number, n: number, e: number) =>
  !!m && m.particulas.p === p && m.particulas.n === n && m.particulas.e === e && m.classificacao.valido;

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

type Ret = { top: number; left: number; w: number; h: number };

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

/** Escurece a tela, deixando um "buraco" iluminado em volta dos alvos. Cliques fora dele são bloqueados. */
function Foco({ alvos }: { alvos: string[] }) {
  const [ret, setRet] = useState<Ret | null>(null);
  const chave = alvos.join("|");

  useEffect(() => {
    let vivo = true;
    let ajustado = false;
    let ant = "";
    const laco = () => {
      if (!vivo) return;
      const n = achar(alvos);
      if (n && !ajustado) {
        // rola a página para o alvo ficar visível, acima da caixa de diálogo (que ocupa ~230px embaixo)
        ajustado = true;
        const excesso = n.top + n.h - (window.innerHeight - 230);
        if (excesso > 0) window.scrollBy(0, Math.min(excesso, Math.max(0, n.top - 10)));
        else if (n.top < 10) window.scrollBy(0, n.top - 10);
      }
      const s = n ? `${n.top},${n.left},${n.w},${n.h}` : "";
      if (s !== ant) {
        ant = s;
        setRet(n);
      }
      requestAnimationFrame(laco);
    };
    laco();
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
      <div className="fixed inset-x-0 top-0 z-[60]" style={{ height: ret.top, background: escuro }} />
      <div className="fixed inset-x-0 z-[60]" style={{ top: fundo, bottom: 0, background: escuro }} />
      <div className="fixed left-0 z-[60]" style={{ top: ret.top, height: ret.h, width: ret.left, background: escuro }} />
      <div className="fixed right-0 z-[60]" style={{ top: ret.top, height: ret.h, left: dir, background: escuro }} />
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

function Guiado() {
  const { concluirTutorial, tocar } = useProgresso();
  const navegar = useNavigate();
  useMusica("laboratorio");
  const [passo, setPasso] = useState(0);
  const [v, setV] = useState<Particulas>({ p: 0, n: 0, e: 0 });
  const [montagem, setMontagem] = useState<Montagem | null>(null);
  const passoRef = useRef(passo);
  passoRef.current = passo;

  const p = PASSOS[passo]!;

  const avancar = useCallback(() => {
    setMontagem(null);
    setPasso((x) => Math.min(PASSOS.length - 1, x + 1));
  }, []);

  useEffect(() => {
    if (!p.auto || !p.auto(v, montagem)) return;
    tocar(sons.acerto);
    const id = window.setTimeout(avancar, 650);
    return () => window.clearTimeout(id);
  }, [v, montagem, p, avancar, tocar]);

  useEffect(() => {
    if (p.confete) tocar(sons.descoberta);
  }, [p, tocar]);

  const terminar = (conceder: boolean) => {
    concluirTutorial(conceder);
    void navegar({ to: "/" });
  };

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
        onAvancar={p.auto ? undefined : ultimo ? () => terminar(true) : avancar}
        extra={dica ? <p className="font-display text-[9px] text-proton">{dica}</p> : undefined}
      />
    </>
  );
}

export function Tutorial() {
  const [fase, setFase] = useState<"historia" | "lab">("historia");
  if (fase === "historia") return <Historia onFim={() => setFase("lab")} />;
  return <Guiado />;
}
