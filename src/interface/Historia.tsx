import { useEffect, useMemo, useState } from "react";
import { ELEMENTOS } from "@/motor";
import { Atomo } from "./Atomo";
import { Dialogo } from "./Dialogo";
import { Zula } from "./Zula";
import { audio, sons } from "./som";
import { useMusica } from "./useMusica";
import { useProgresso } from "./store";
import { DecorCena } from "./FundoQuimico";
import { TituloLab } from "./Titulo";

type Cena = "ceu" | "tabela" | "lab" | "atomo";
type Fala = { cena: Cena; autor: string; texto: string; humor?: "normal" | "feliz" };

const FALAS: Fala[] = [
  {
    cena: "ceu",
    autor: "NARRAÇÃO",
    texto:
      "Numa noite sem lua, o Instituto Zero acordou no escuro. Algo estranho tinha acontecido com a Tabela Periódica.",
  },
  {
    cena: "tabela",
    autor: "NARRAÇÃO",
    texto:
      "Os 118 elementos que formam tudo o que existe, da água às estrelas, foram trancados em cadeados. A tabela inteira apagou.",
  },
  {
    cena: "lab",
    autor: "ZULA",
    texto:
      "Bip! Bip! Cheguei a tempo! Eu sou o ZULA, o robô do laboratório. O Z é de número atômico, sabia?",
    humor: "feliz",
  },
  {
    cena: "lab",
    autor: "ZULA",
    texto:
      "Só um cientista de verdade consegue acender a tabela de novo. Você chegou na hora certa. Seu cargo: Cientista-Chefe!",
  },
  {
    cena: "atomo",
    autor: "ZULA",
    texto:
      "A máquina deste laboratório monta átomos a partir de 3 peças: prótons, nêutrons e elétrons. Cada elemento destrancado vira um bloco na tabela.",
  },
  {
    cena: "atomo",
    autor: "ZULA",
    texto: "Vamos começar pelo primeiro de todos: o hidrogênio. Eu te guio. Vamos ao laboratório!",
    humor: "feliz",
  },
];

function Estrelas() {
  const pts = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        x: (i * 53) % 100,
        y: (i * 37) % 70,
        s: 2 + (i % 3),
        d: (i % 7) * 0.4,
      })),
    [],
  );
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {pts.map((p, i) => (
        <span
          key={i}
          className="anim-twinkle absolute bg-cloud"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            animationDelay: `${p.d}s`,
          }}
        />
      ))}
    </div>
  );
}

function TabelaApagando({ acesa }: { acesa: boolean }) {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-[8%] mx-auto grid w-[min(92vw,760px)] gap-[3px]"
      style={{ gridTemplateColumns: "repeat(18, 1fr)", gridTemplateRows: "repeat(7, auto)" }}
    >
      {ELEMENTOS.filter((e) => e.z <= 118).map((el) => (
        <span
          key={el.z}
          className={`aspect-square border-2 border-ink ${acesa ? "" : "anim-twinkle"}`}
          style={{
            gridRow: el.posicao.linha,
            gridColumn: el.posicao.coluna,
            background: `var(--cat-${el.categoria})`,
            animationDelay: `${(el.z % 17) * 0.15}s`,
            opacity: acesa ? 1 : undefined,
          }}
        />
      ))}
    </div>
  );
}

function Fundo({ cena }: { cena: Cena }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, var(--ink) 0 55%, var(--night) 55% 80%, var(--panel) 80%)",
      }}
    >
      <DecorCena cena={cena} />
      {cena === "tabela" && <TabelaApagando acesa={false} />}
      {(cena === "lab" || cena === "atomo") && (
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[34%] border-t-[6px] border-ink bg-wood"
        >
          <div className="h-3 bg-wood-dark" />
        </div>
      )}
      {cena === "lab" && (
        <div className="absolute inset-x-0 bottom-[30%] flex justify-center">
          <Zula humor="feliz" scale={12} className="anim-bob" />
        </div>
      )}
      {cena === "atomo" && (
        <div className="absolute inset-x-0 top-[6%] mx-auto h-[46vh] w-[46vh] max-w-[90vw]">
          <Atomo p={1} n={0} e={1} status="estavel" wobbleKey={0} />
        </div>
      )}
    </div>
  );
}

export function Historia({ onFim }: { onFim: () => void }) {
  const { estado, alternarSom } = useProgresso();
  const [fase, setFase] = useState<"titulo" | "conto">("titulo");
  const [i, setI] = useState(0);
  useMusica(fase === "titulo" && !estado.config.som ? null : "historia");

  const escolher = (som: boolean) => {
    if (estado.config.som !== som) alternarSom();
    if (som) {
      void audio()?.resume();
      sons.descoberta();
    }
    setFase("conto");
  };

  useEffect(() => {
    if (fase !== "conto") return;
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onFim();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fase, onFim]);

  if (fase === "titulo") {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden bg-ink p-4 text-center">
        <DecorCena cena="titulo" />
        <div className="anim-titulo relative">
          <TituloLab className="w-[min(86vw,600px)]" />
          <p
            className="anim-entrar font-display mt-4 text-[10px] tracking-widest text-parchment sm:text-sm"
            style={{ animationDelay: "900ms" }}
          >
            CONSTRUTOR ATÔMICO
          </p>
        </div>
        <div className="anim-entrar relative" style={{ animationDelay: "1200ms" }}>
          <Zula humor="feliz" scale={9} className="anim-bob" />
        </div>
        <p className="relative max-w-sm text-lg text-parchment">
          Um jogo de montar átomos e acender a tabela periódica.{" "}
        </p>
        <div
          className="anim-entrar relative flex flex-wrap justify-center gap-3"
          style={{ animationDelay: "1600ms" }}
        >
          <button
            type="button"
            className="pixel-btn btn-gold py-4 text-sm"
            onClick={() => escolher(true)}
          >
            ▶ COM SOM
          </button>
          <button
            type="button"
            className="pixel-btn btn-parchment py-4 text-sm"
            onClick={() => escolher(false)}
          >
            SEM SOM
          </button>
        </div>
      </main>
    );
  }

  const f = FALAS[i]!;
  const ultima = i === FALAS.length - 1;
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Fundo cena={f.cena} />
      <button
        type="button"
        className="pixel-btn btn-dark absolute right-3 top-3 z-[80]"
        onClick={onFim}
      >
        PULAR ▶▶
      </button>
      <Dialogo
        key={i}
        texto={f.texto}
        autor={f.autor}
        humor={f.humor ?? "normal"}
        rotulo={ultima ? "VAMOS! ★" : "PRÓXIMO ▶"}
        onAvancar={() => (ultima ? onFim() : setI(i + 1))}
      />
    </main>
  );
}
