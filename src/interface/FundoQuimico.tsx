/*******************************************************************************
 * FundoQuimico.tsx
 * funcao principal: enfeites de fundo das telas: frascos, ceu estrelado,
 * formulas flutuando, atomo girando, predio do Instituto Zero, as cenas
 * montadas com eles e a mini tabela do progresso.
 ******************************************************************************/
import { useMemo } from "react";
import { ELEMENTOS } from "@/motor";
import { PixelArt } from "./PixelArt";
import { catStyle } from "./comuns";
import { useProgresso } from "./store";

// ----- pecas de pixel art -----
// k = contorno do vidro, w = vidro, l = liquido, h = brilho do liquido
const ERLEN = ["...kkkkk...", "...kwwwk...", "...kwwwk...", "...kwwwk...", "..kwwwwwk..", "..kwwwwwk..", ".kwwllllwk.", ".kwllhllwk.", "kwwlllllwwk", "kwlllhlllwk", "kwlllllllwk", "kwwlllllwwk", ".kkkkkkkkk."];
const TUBO = ["kkkkk", "kwwwk", "kwwwk", "kwwwk", "kllhk", "kllhk", "kllhk", "kllhk", ".klhk", ".kkk."];
const BECHER = ["kkkkkkkkk", "kwwwwwwwk", "kwwwwwwwk", "kllllllhk", "kllllllhk", "kllhlllhk", "kllllllhk", "kllllllhk", "kkkkkkkkk"];
const FORMAS = { erlen: ERLEN, tubo: TUBO, becher: BECHER };

/*******************************************************************************
 * Frasco
 * funcao: um frasco de vidro com liquido colorido e bolhas subindo.
 * recebe: forma ("erlen", "tubo" ou "becher"), cor do liquido, scale e
 * bolhas (liga as bolhas).
 * retorna: o frasco em pixel art.
 ******************************************************************************/
export function Frasco({ forma, cor, scale = 4, bolhas = true }: { forma: keyof typeof FORMAS; cor: string; scale?: number; bolhas?: boolean }) {
  const rows = FORMAS[forma];
  const larg = Math.max(...rows.map((r) => r.length)) * scale;
  return (
    <span className="relative inline-block" style={{ width: larg }}>
      <PixelArt
        rows={rows}
        scale={scale}
        palette={{ k: "color-mix(in oklab, var(--sky-light) 70%, var(--ink))", w: "color-mix(in oklab, var(--sky-light) 40%, transparent)", l: cor, h: `color-mix(in oklab, ${cor} 55%, white)` }}
      />
      {bolhas &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            aria-hidden
            className="anim-bolha absolute block bg-cloud"
            style={{ left: `${30 + i * 20}%`, top: "35%", width: scale, height: scale, animationDelay: `${i * 0.9}s`, animationDuration: `${2.4 + i * 0.5}s` }}
          />
        ))}
    </span>
  );
}

// cores de liquido usadas em sequencia nas fileiras
const LIQUIDOS = ["var(--cat-halogenio)", "var(--cat-metal_alcalino)", "var(--cat-gas_nobre)", "var(--cat-nao_metal)", "var(--cat-metal_transicao)", "var(--cat-semimetal)"];

/*******************************************************************************
 * FileiraFrascos
 * funcao: um grupo de frascos em fila, alternando forma e cor.
 * recebe: n (quantos frascos), scale e desde (desloca a sequencia de formas
 * e cores, para fileiras vizinhas nao ficarem iguais).
 * retorna: a fileira.
 ******************************************************************************/
export function FileiraFrascos({ n = 3, scale = 4, desde = 0 }: { n?: number; scale?: number; desde?: number }) {
  const formas: (keyof typeof FORMAS)[] = ["erlen", "tubo", "becher", "tubo", "erlen"];
  return (
    <div className="flex items-end gap-2">
      {Array.from({ length: n }, (_, i) => (
        <Frasco key={i} forma={formas[(i + desde) % formas.length]!} cor={LIQUIDOS[(i + desde * 2) % LIQUIDOS.length]!} scale={scale} />
      ))}
    </div>
  );
}

// ----- ceu -----
/*******************************************************************************
 * CeuEstrelado
 * funcao: 70 estrelinhas piscando, duas estrelas cadentes e, se pedir,
 * faixas de aurora.
 * recebe: aurora (boolean).
 * retorna: a camada de ceu (decorativa).
 ******************************************************************************/
export function CeuEstrelado({ aurora = false }: { aurora?: boolean }) {
  // posicoes calculadas sem sorteio, para o ceu ser sempre igual
  const pts = useMemo(
    () => Array.from({ length: 70 }, (_, i) => ({ x: (i * 53 + 7) % 100, y: (i * 37 + 3) % 78, s: 2 + (i % 3), d: (i % 9) * 0.35 })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {aurora && (
        <>
          <div
            className="anim-aurora absolute -inset-x-[10%] top-[4%] h-[26%]"
            style={{ background: "repeating-linear-gradient(100deg, transparent 0 9%, color-mix(in oklab, var(--cat-halogenio) 6%, transparent) 9% 15%, transparent 15% 24%, color-mix(in oklab, var(--cat-gas_nobre) 7%, transparent) 24% 31%)" }}
          />
          <div
            className="anim-aurora absolute -inset-x-[10%] top-[14%] h-[18%]"
            style={{ animationDelay: "-5s", animationDirection: "alternate-reverse", background: "repeating-linear-gradient(100deg, transparent 0 12%, color-mix(in oklab, var(--cat-nao_metal) 5%, transparent) 12% 17%, transparent 17% 30%)" }}
          />
        </>
      )}
      {pts.map((p, i) => (
        <span key={i} className="anim-twinkle absolute bg-cloud" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, animationDelay: `${p.d}s` }} />
      ))}
      {/* estrelas cadentes */}
      {[0, 1].map((i) => (
        <span key={i} className="anim-cadente absolute block h-[3px] w-[70px] bg-cloud" style={{ left: `${30 + i * 40}%`, top: `${6 + i * 10}%`, animationDelay: `${i * 5.5 + 1}s`, boxShadow: "14px 0 0 color-mix(in oklab, white 55%, transparent), 28px 0 0 color-mix(in oklab, white 30%, transparent)" }} />
      ))}
    </div>
  );
}

// ----- formulas flutuando -----
// texto, posicao x (%), atraso (s) e duracao (s) de cada formula
const FORMULAS: { t: React.ReactNode; x: number; d: number; dur: number }[] = [
  { t: <>H<sub>2</sub>O</>, x: 6, d: 0, dur: 16 },
  { t: <>CO<sub>2</sub></>, x: 17, d: 5, dur: 19 },
  { t: "NaCl", x: 29, d: 9, dur: 17 },
  { t: <>O<sub>2</sub></>, x: 41, d: 2, dur: 21 },
  { t: <>CH<sub>4</sub></>, x: 54, d: 11, dur: 18 },
  { t: <>NH<sub>3</sub></>, x: 66, d: 7, dur: 20 },
  { t: <>H<sub>2</sub>SO<sub>4</sub></>, x: 77, d: 13, dur: 22 },
  { t: <>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></>, x: 88, d: 4, dur: 19 },
  { t: "E=mc²", x: 47, d: 15, dur: 23 },
];

/*******************************************************************************
 * Formulas
 * funcao: formulas quimicas subindo devagar no fundo.
 * recebe: nada. retorna: a camada de formulas (decorativa).
 ******************************************************************************/
export function Formulas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FORMULAS.map((f, i) => (
        <span
          key={i}
          className="anim-flutuar font-display absolute bottom-0 text-[9px] text-sky-light sm:text-[11px]"
          // atraso negativo: a formula ja aparece no meio do caminho
          style={{ left: `${f.x}%`, animationDelay: `${-f.d}s`, animationDuration: `${f.dur}s` }}
        >
          {f.t}
        </span>
      ))}
    </div>
  );
}

// ----- atomo orbitando -----
/*******************************************************************************
 * AtomoFundo
 * funcao: atomo decorativo com tres orbitas elipticas e um eletron
 * andando em cada uma.
 * recebe: className.
 * retorna: o <svg> do atomo.
 ******************************************************************************/
export function AtomoFundo({ className = "" }: { className?: string }) {
  // caminho da elipse, para o animateMotion seguir
  const caminho = "M -150 0 a 150 52 0 1 0 300 0 a 150 52 0 1 0 -300 0";
  return (
    <svg aria-hidden viewBox="-170 -170 340 340" shapeRendering="crispEdges" className={`pointer-events-none ${className}`}>
      {[0, 60, 120].map((rot, i) => (
        <g key={rot} transform={`rotate(${rot})`}>
          <ellipse rx="150" ry="52" fill="none" stroke="var(--sky-light)" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="10 8" />
          <rect x="-6" y="-6" width="12" height="12" fill={i === 0 ? "var(--gold)" : i === 1 ? "var(--cat-halogenio)" : "var(--cat-metal_alcalino)"}>
            <animateMotion dur={`${6 + i * 1.5}s`} repeatCount="indefinite" path={caminho} />
          </rect>
        </g>
      ))}
      {/* nucleo: quatro quadradinhos e um no meio */}
      {[[-8, -8, "var(--proton)"], [0, -8, "var(--neutron, var(--sky-light))"], [-8, 0, "var(--neutron, var(--sky-light))"], [0, 0, "var(--proton)"], [-4, -4, "var(--gold)"]].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width="8" height="8" fill={c as string} stroke="var(--ink)" strokeWidth="1" />
      ))}
    </svg>
  );
}

// ----- predio do Instituto Zero -----
/*******************************************************************************
 * Predio
 * funcao: silhueta de predios no pe da tela, com janelas acesas e algumas
 * piscando.
 * recebe: nada. retorna: o <svg> dos predios (decorativo).
 ******************************************************************************/
export function Predio() {
  const blocos = useMemo(() => {
    const larg = [7, 5, 9, 6, 11, 5, 8, 7, 6, 10, 5, 8];
    const alt = [9, 14, 11, 17, 12, 8, 15, 10, 13, 9, 16, 11];
    // empilha os blocos da esquerda para a direita, com 1 de espaco entre eles
    let x = 0;
    return larg.map((w, i) => {
      const b = { x, w, h: alt[i]! };
      x += w + 1;
      return b;
    });
  }, []);
  const total = blocos.reduce((s, b) => s + b.w + 1, 0);
  return (
    <svg aria-hidden viewBox={`0 0 ${total} 20`} preserveAspectRatio="xMidYMax slice" shapeRendering="crispEdges" className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] w-full">
      {blocos.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={20 - b.h} width={b.w} height={b.h} fill="color-mix(in oklab, var(--ink) 55%, var(--night))" />
          <rect x={b.x} y={20 - b.h} width={b.w} height="1" fill="var(--panel)" />
          {Array.from({ length: Math.floor((b.h - 2) / 2) }, (_, r) =>
            Array.from({ length: Math.floor((b.w - 1) / 2) }, (_, c) => {
              // escolhe as janelas acesas por conta, sem sorteio
              const acesa = (i * 7 + r * 3 + c * 5) % 4 === 0;
              return acesa ? (
                <rect key={`${r}-${c}`} x={b.x + 1 + c * 2} y={20 - b.h + 2 + r * 2} width="1" height="1" fill="var(--gold)" className={(i + r + c) % 5 === 0 ? "anim-twinkle" : ""} style={{ animationDelay: `${(i + r) * 0.4}s` }} />
              ) : null;
            }),
          )}
        </g>
      ))}
    </svg>
  );
}

// ----- cenas -----
export type CenaDecor = "titulo" | "ceu" | "tabela" | "lab" | "atomo";

/*******************************************************************************
 * Prateleira
 * funcao: prateleira de madeira com frascos, presa num dos lados da tela.
 * recebe: lado ("esq" ou "dir"), topo (posicao vertical), n e desde.
 * retorna: a prateleira (decorativa).
 ******************************************************************************/
function Prateleira({ lado, topo, n, desde }: { lado: "esq" | "dir"; topo: string; n: number; desde: number }) {
  return (
    <div aria-hidden className="absolute z-[1]" style={{ top: topo, [lado === "esq" ? "left" : "right"]: "4%" }}>
      <FileiraFrascos n={n} scale={5} desde={desde} />
      <div className="mt-0 h-4 border-[3px] border-ink bg-wood" style={{ boxShadow: "inset 0 -3px 0 var(--wood-dark)" }} />
    </div>
  );
}

/*******************************************************************************
 * DecorCena
 * funcao: enfeites de fundo de cada cena. fica atras do resto: o chao e os
 * personagens continuam sendo da propria cena.
 * recebe: cena ("titulo", "ceu", "tabela", "lab" ou "atomo").
 * retorna: as camadas de fundo daquela cena.
 ******************************************************************************/
export function DecorCena({ cena }: { cena: CenaDecor }) {
  return (
    <>
      <CeuEstrelado />
      {cena !== "lab" && <Formulas />}
      {cena === "ceu" && <Predio />}
      {/* tela inicial: atomo grande, bancada e frascos dos dois lados */}
      {cena === "titulo" && (
        <>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <AtomoFundo className="anim-bob h-[min(84vh,84vw)] w-[min(84vh,84vw)] opacity-45" />
          </div>
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-[1] h-[12vh] border-t-[6px] border-ink bg-wood" style={{ boxShadow: "inset 0 6px 0 var(--wood-dark)" }} />
          <div aria-hidden className="absolute bottom-[calc(12vh+3px)] left-[5%] z-[1]">
            <FileiraFrascos n={3} scale={8} />
          </div>
          <div aria-hidden className="absolute bottom-[calc(12vh+3px)] right-[5%] z-[1]">
            <FileiraFrascos n={3} scale={8} desde={3} />
          </div>
        </>
      )}
      {/* laboratorio: janela, frascos na bancada e prateleiras */}
      {cena === "lab" && (
        <>
          {/* janela com o ceu da noite */}
          <div aria-hidden className="absolute left-1/2 top-[7%] z-[1] h-[22vh] w-[min(44vw,300px)] -translate-x-1/2 border-[6px] border-ink bg-ink" style={{ boxShadow: "0 0 0 4px var(--wood), 0 0 0 7px var(--ink)" }}>
            <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(to bottom, var(--ink), var(--night))" }}>
              <CeuEstrelado aurora={false} />
              <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-ink" />
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-ink" />
            </div>
          </div>
          <div aria-hidden className="absolute bottom-[calc(34%+6px)] left-[10%] z-[1]">
            <FileiraFrascos n={3} scale={8} desde={1} />
          </div>
          <div aria-hidden className="absolute bottom-[calc(34%+6px)] right-[10%] z-[1]">
            <FileiraFrascos n={3} scale={8} desde={4} />
          </div>
          <Prateleira lado="esq" topo="14%" n={3} desde={0} />
          <Prateleira lado="esq" topo="34%" n={2} desde={2} />
          <Prateleira lado="dir" topo="12%" n={3} desde={3} />
          <Prateleira lado="dir" topo="34%" n={2} desde={1} />
        </>
      )}
    </>
  );
}

// ----- mini tabela do progresso -----
/*******************************************************************************
 * MiniTabela
 * funcao: tabela em miniatura; os elementos ja descobertos acendem e
 * brilham em onda.
 * recebe: className.
 * retorna: a grade com os 118 quadradinhos.
 ******************************************************************************/
export function MiniTabela({ className = "" }: { className?: string }) {
  const { estado } = useProgresso();
  return (
    <div
      aria-hidden
      className={`grid gap-[2px] ${className}`}
      // 7 linhas, uma linha fina de folga e as 2 linhas de lantanideos e actinideos
      style={{ gridTemplateColumns: "repeat(18, minmax(0,1fr))", gridTemplateRows: "repeat(7, auto) 6px auto auto" }}
    >
      {ELEMENTOS.map((el) => {
        const aceso = !!estado.elementos[String(el.z)]?.estrelas[0];
        return (
          <span
            key={el.z}
            className={`aspect-square ${aceso ? "anim-onda" : ""}`}
            style={{
              ...catStyle(el.categoria),
              gridRow: el.posicao.linha,
              gridColumn: el.posicao.coluna,
              background: aceso ? "var(--cat)" : "color-mix(in oklab, var(--cat) 22%, var(--ink))",
              // atraso pela diagonal faz o brilho andar em onda
              animationDelay: `${(el.posicao.linha + el.posicao.coluna) * 90}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
