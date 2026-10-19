/*******************************************************************************
 * Final.tsx
 * funcao principal: cena de encerramento quando o jogador descobre os 118
 * elementos: a tabela acende, fogos estouram e o Zula agradece.
 ******************************************************************************/
import { useEffect, useMemo, useRef, useState } from "react";
import { ELEMENTOS, FAMILIAS, contarTotais, progressoFamilia } from "@/motor";
import { Confete } from "./Celebracao";
import { Dialogo } from "./Dialogo";
import { catStyle } from "./comuns";
import { TituloLab } from "./Titulo";
import { sons, useProgresso } from "./store";

// cores das faiscas dos fogos
const CORES = ["#ffd24a", "#ff7a59", "#6fd3ff", "#9be36b", "#c59bff", "#ff8ac4"];

// um fogo na tela: id para a key e posicao em % da tela
type Fogo = { id: number; x: number; y: number; cor: string };

/*******************************************************************************
 * Estouro
 * funcao: uma explosao de 16 faiscas pixeladas.
 * recebe: x e y (posicao em % da tela) e cor.
 * retorna: as faiscas animadas (decorativas).
 ******************************************************************************/
function Estouro({ x, y, cor }: { x: number; y: number; cor: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {Array.from({ length: 16 }, (_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        // faiscas alternam entre perto e longe; uma em cada 4 e quase branca
        const dist = 60 + (i % 2) * 28;
        return (
          <span
            key={i}
            className="anim-faisca absolute block h-1.5 w-1.5"
            style={{ background: i % 4 === 0 ? "#fff6d6" : cor, ["--dx" as string]: `${Math.cos(ang) * dist}px`, ["--dy" as string]: `${Math.sin(ang) * dist + 18}px` }}
          />
        );
      })}
    </div>
  );
}

/*******************************************************************************
 * Final
 * funcao: final do jogo, em fases: 1) a tabela acende elemento por
 * elemento, com notinhas subindo; 2) flash, confete, fogos e uma onda de
 * brilho; 3) o Zula agradece e mostra o que o jogador conquistou.
 * recebe: onFechar (volta para o mapa).
 * retorna: a cena em tela cheia.
 ******************************************************************************/
export function Final({ onFechar }: { onFechar: () => void }) {
  const { estado, tocar } = useProgresso();
  const tot = contarTotais(estado);
  const familias = FAMILIAS.filter((f) => progressoFamilia(estado, f.id).completa).length;
  const lista = useMemo(() => [...ELEMENTOS].sort((a, b) => a.z - b.z), []);
  const [revelados, setRevelados] = useState(0);
  const [fase, setFase] = useState<1 | 2 | 3>(1); // 1 acendendo, 2 explosao, 3 dialogo
  const [pagina, setPagina] = useState(0);
  // contador dos ids dos fogos; fica numa ref para nao voltar a 1 quando o efeito
  // reinicia na passagem da fase 2 para a 3 (ids repetidos viravam keys duplicadas)
  const ultimoFogo = useRef(0);
  const [fogos, setFogos] = useState<Fogo[]>([]);

  // fase 1: acende um elemento a cada 40 ms
  useEffect(() => {
    if (fase !== 1) return;
    const id = window.setInterval(() => {
      setRevelados((n) => (n >= lista.length ? n : n + 1));
    }, 40);
    return () => window.clearInterval(id);
  }, [fase, lista.length]);

  // nota de cada elemento aceso: quando revelados passa de n para n + 1, toca a nota n.
  // fica fora do setRevelados porque o StrictMode roda esse callback duas vezes.
  // so na fase 1: o PULAR (que vai direto para a fase 3) e o recomeco em 0 nao tocam nada
  useEffect(() => {
    if (fase !== 1 || revelados === 0) return;
    tocar(() => sons.nota(revelados - 1));
  }, [revelados, fase, tocar]);

  // todos acesos: meio segundo depois passa para a fase 2
  useEffect(() => {
    if (fase === 1 && revelados >= lista.length) {
      const t = window.setTimeout(() => setFase(2), 500);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [fase, revelados, lista.length]);

  // fase 2: fanfarra e, 2,6 s depois, o dialogo
  useEffect(() => {
    if (fase !== 2) return;
    tocar(sons.fanfarra);
    const t = window.setTimeout(() => setFase(3), 2600);
    return () => window.clearTimeout(t);
  }, [fase, tocar]);

  // fases 2 e 3: solta um fogo a cada 750 ms ate a cena fechar
  useEffect(() => {
    if (fase < 2) return;
    const solta = () => {
      const n = ++ultimoFogo.current;
      const f: Fogo = { id: n, x: 8 + ((n * 37) % 84), y: 8 + ((n * 23) % 38), cor: CORES[n % CORES.length]! };
      // a explosao dura 1100 ms e sai um fogo a cada 750 ms: guardando so o anterior
      // e o novo, cada fogo sai do DOM logo depois de terminar
      setFogos((l) => [...l.slice(-1), f]);
      tocar(sons.estouro);
    };
    solta();
    const id = window.setInterval(solta, 750);
    return () => window.clearInterval(id);
  }, [fase, tocar]);

  // PULAR acende tudo e vai direto para o dialogo
  const pular = () => {
    setRevelados(lista.length);
    setFase(3);
  };

  // falas do Zula, uma por pagina
  const paginas = [
    "Você conseguiu! Os 118 elementos estão acesos, do Hidrogênio ao Oganessônio. Olha só como o laboratório ficou lindo!",
    "Sabe o que você montou? A água, o ar, o seu celular, as estrelas e até você são feitos dessas mesmas peças. Tudo o que existe vem dessa tabelinha.",
    "Você começou sem saber nada e agora monta até átomos gigantes. Foi muito bom aprender com você por aqui.",
    "Obrigado por ajudar o Lab 118 a acender. Esse laboratório agora é todo seu!",
  ];
  const ultima = pagina === paginas.length - 1;

  return (
    <div role="dialog" aria-modal="true" aria-label="Final do jogo: tabela completa" className="fixed inset-0 z-[65] overflow-hidden" style={{ background: "var(--ink)" }}>
      {/* flash e confete a partir da fase 2 */}
      {fase >= 2 && <div aria-hidden className="anim-flash pointer-events-none fixed inset-0 bg-cloud" />}
      {fase >= 2 && <Confete />}

      {/* estrelinhas ao fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 34 }, (_, i) => (
          <span
            key={i}
            className="anim-twinkle absolute block bg-cloud"
            style={{ left: `${(i * 41 + 9) % 98}%`, top: `${(i * 59 + 5) % 90}%`, width: i % 3 === 0 ? 4 : 2, height: i % 3 === 0 ? 4 : 2, animationDelay: `${(i % 7) * 300}ms` }}
          />
        ))}
      </div>

      {/* fogos de artificio */}
      {fogos.map((f) => (
        <Estouro key={f.id} x={f.x} y={f.y} cor={f.cor} />
      ))}

      {/* botao de pular a animacao */}
      {fase < 3 && (
        <button type="button" className="pixel-btn btn-parchment absolute right-3 top-3 z-10 text-xs" onClick={pular}>
          PULAR ▶▶
        </button>
      )}

      <div className="relative flex h-full flex-col items-center gap-3 px-3 pt-[3vh]">
        {/* titulo: contador enquanto acende, depois o nome do jogo */}
        <div className="flex h-[17vh] flex-col items-center justify-center gap-2 text-center">
          {fase === 1 ? (
            <>
              <p className="font-display text-[10px] text-parchment sm:text-xs">ACENDENDO O LABORATÓRIO…</p>
              <p className="font-display text-xl text-gold sm:text-3xl">
                {revelados}/{lista.length}
              </p>
            </>
          ) : (
            <div className="anim-slide-up flex flex-col items-center gap-2">
              <p className="font-display text-[10px] text-gold sm:text-xs">★ TABELA COMPLETA ★</p>
              <h2 className="font-display text-2xl leading-none text-gold sm:text-5xl" style={{ textShadow: "4px 4px 0 var(--wood-dark)" }}>
                <TituloLab className="w-[min(70vw,380px)]" />
              </h2>
            </div>
          )}
        </div>

        {/* a tabela se acendendo */}
        <div
          className="grid gap-[3px]"
          style={{ width: "min(94vw, 84vh)", gridTemplateColumns: "repeat(18, minmax(0,1fr))", gridTemplateRows: "repeat(7, auto) 12px auto auto" }}
          aria-hidden
        >
          {lista.map((el, i) => {
            const aceso = i < revelados;
            return (
              <span
                key={el.z}
                className={`pixel-block block-open flex aspect-square items-center justify-center ${aceso ? "anim-pop" : "opacity-0"} ${fase >= 2 ? "anim-onda" : ""}`}
                style={{
                  ...catStyle(el.categoria),
                  gridRow: el.posicao.linha,
                  gridColumn: el.posicao.coluna,
                  // na fase 2 o brilho anda em onda pela diagonal
                  ...(fase >= 2 ? { animationDelay: `${(el.posicao.linha + el.posicao.coluna) * 80}ms` } : {}),
                }}
              >
                <span className="font-display text-[7px] sm:text-[10px] lg:text-xs">{el.simbolo}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* dialogo final; na ultima pagina mostra os totais e os botoes */}
      {fase >= 3 && (
        <Dialogo
          texto={paginas[pagina]!}
          humor="feliz"
          rotulo="PRÓXIMO ▶"
          onAvancar={ultima ? undefined : () => setPagina((p) => p + 1)}
          extra={
            ultima ? (
              <div className="flex flex-col gap-2">
                <p className="font-display text-[9px] text-wood-dark sm:text-[10px]">
                  {tot.elementos}/118 ELEMENTOS · {tot.estrelas}/354 ★ · {familias}/{FAMILIAS.length} FAMÍLIAS
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  {/* VER DE NOVO zera tudo e recomeca da fase 1 */}
                  <button type="button" className="pixel-btn btn-parchment" onClick={() => { setPagina(0); setRevelados(0); setFogos([]); setFase(1); }}>
                    VER DE NOVO
                  </button>
                  <button type="button" className="pixel-btn btn-gold" onClick={onFechar}>
                    VOLTAR AO MAPA ▶
                  </button>
                </div>
              </div>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
