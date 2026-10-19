/*******************************************************************************
 * Laboratorio.tsx
 * funcao principal: tela do laboratorio, onde o jogador monta o atomo
 * (arrastando particulas ou usando os contadores), le o painel e aperta
 * CONSTRUIR para registrar descobertas, isotopos e ions. tambem roda dentro
 * do tutorial, com um progresso de treino.
 ******************************************************************************/
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  LIMITE_N,
  NOME_CATEGORIA,
  avaliarMissao,
  classificar,
  construir as construirMotor,
  artigoDoElemento,
  descoberto,
  elementoPorZ,
  familiaPendente,
  gerarMissao,
  maxEletrons,
  missaoParaElemento,
  progressoInicial,
  type Categoria,
  type Classificacao,
  type Evento,
  type Particulas,
} from "@/motor";
import { Atomo } from "./Atomo";
import { Celebracao, Confete } from "./Celebracao";
import { CerimoniaFamilia } from "./CerimoniaFamilia";
import { Dicas } from "./Dicas";
import { NOME_PARTICULA, ParticleSprite, type TipoParticula } from "./Particula";
import { Stars, TopBar } from "./comuns";
import { sons, useProgresso } from "./store";

// maximo de protons no contador
const MAX_P = 118;

// texto para cada codigo de erro do motor
const MSG_ERRO: Record<string, string> = {
  SEM_PROTONS: "Sem prótons não há elemento. Adicione ao menos 1 próton.",
  Z_ACIMA_DE_118: "Ainda não conhecemos elementos com tantos prótons.",
  ELETRONS_FORA_DO_LIMITE: "Elétrons demais para esse número de prótons.",
  NEUTRONS_FORA_DO_LIMITE: "Nêutrons demais para o laboratório.",
};
// nomes do status do nuclideo e da especie, como aparecem no painel
const MSG_STATUS = { estavel: "Estável", radioativo: "Radioativo", nao_catalogado: "Não catalogado" } as const;
const ROTULO_ESPECIE = { atomo_neutro: "Átomo neutro", cation: "Cátion (carga positiva)", anion: "Ânion (carga negativa)" } as const;

/*******************************************************************************
 * Guia
 * funcao: modo tutorial. com guia, o laboratorio usa um progresso de
 * treino (nao mexe no jogo salvo) e avisa o tutorial de cada mudanca e de
 * cada construcao.
 ******************************************************************************/
export type Guia = {
  onMudar: (v: Particulas) => void;
  onConstruir: (r: { classificacao: Classificacao; eventos: Evento[]; particulas: Particulas }) => void;
};

// etiqueta de cada tipo de missao
const ROTULO_MISSAO = { M1: "DESCOBRIR", M2: "ISÓTOPO", M3: "ÍON" } as const;

// mensagens mostradas depois de construir; o tom muda a cor do painel
type Feedback = { tom: "bom" | "info" | "aviso"; linhas: string[] };

/*******************************************************************************
 * LabScene
 * funcao: cenario atras do atomo: parede, janela, prateleiras com frascos
 * e bancada, tudo em pixels.
 * recebe: nada. retorna: o <svg> do cenario (decorativo).
 ******************************************************************************/
function LabScene() {
  return (
    <svg aria-hidden viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" shapeRendering="crispEdges">
      <rect width="160" height="90" fill="var(--panel)" />
      <rect y="0" width="160" height="2" fill="var(--ink)" />
      {/* listras da parede */}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 10} y="0" width="1" height="62" fill="var(--night)" opacity="0.5" />
      ))}
      {/* janela */}
      <rect x="10" y="8" width="34" height="26" fill="var(--ink)" />
      <rect x="12" y="10" width="30" height="22" fill="var(--sky)" />
      <rect x="12" y="22" width="30" height="10" fill="var(--sky-light)" />
      <rect x="26" y="10" width="2" height="22" fill="var(--ink)" />
      <rect x="12" y="20" width="30" height="2" fill="var(--ink)" />
      <rect x="15" y="13" width="7" height="2" fill="var(--cloud)" />
      <rect x="9" y="34" width="36" height="2" fill="var(--wood-dark)" />
      {/* prateleiras */}
      {[16, 34].map((y) => (
        <g key={y}>
          <rect x="112" y={y} width="42" height="2" fill="var(--wood)" />
          <rect x="112" y={y + 2} width="42" height="1" fill="var(--wood-dark)" />
        </g>
      ))}
      {/* frascos: [x, y, cor do liquido]; tampa, vidro e liquido */}
      {[
        [115, 10, "var(--proton)"],
        [123, 8, "var(--cat-nao_metal)"],
        [132, 11, "var(--electron)"],
        [142, 9, "var(--gold)"],
        [117, 28, "var(--cat-gas_nobre)"],
        [127, 29, "var(--cat-halogenio)"],
        [138, 27, "var(--cat-metal_alcalino)"],
      ].map(([x, y, c], i) => (
        <g key={i}>
          <rect x={Number(x) + 1} y={Number(y) - 2} width="2" height="2" fill="var(--parchment-shade)" />
          <rect x={Number(x)} y={Number(y)} width="4" height={16 - (Number(y) % 8) - (Number(y) > 20 ? 0 : 0)} fill="var(--ink)" />
          <rect x={Number(x) + 1} y={Number(y) + 2} width="2" height={12 - (Number(y) % 8)} fill={String(c)} />
        </g>
      ))}
      {/* bancada */}
      <rect y="62" width="160" height="3" fill="var(--ink)" />
      <rect y="65" width="160" height="5" fill="var(--wood)" />
      <rect y="70" width="160" height="20" fill="var(--wood-dark)" />
      {/* frestas da madeira da bancada */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={i * 20 + 6} y="72" width="1" height="18" fill="var(--ink)" opacity="0.4" />
      ))}
    </svg>
  );
}

/*******************************************************************************
 * Contador
 * funcao: botoes - e + com um campo numerico para uma particula. segurar
 * o botao repete de 5 em 5; Shift + clique ou Shift + seta tambem soma 5.
 * recebe: tipo (particula), valor, max e onChange (novo valor, ja inteiro e
 * limitado entre 0 e max).
 * retorna: os controles da particula.
 ******************************************************************************/
function Contador({
  tipo,
  valor,
  max,
  onChange,
}: {
  tipo: TipoParticula;
  valor: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const timer = useRef<number | null>(null);
  // marca se o clique veio de um toque longo, para nao somar de novo no onClick
  const longo = useRef(false);
  // corta a parte decimal (colar "0.5" vira 0) e troca NaN por 0 antes de limitar
  const clamp = (v: number) => Math.max(0, Math.min(max, Math.trunc(v) || 0));
  const parar = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  };
  // para o timer se o componente sair da tela
  useEffect(() => parar, []);
  // valor mais novo para o setInterval, que nao ve o valor atualizado
  const valorRef = useRef(valor);
  valorRef.current = valor;

  // monta o botao de somar (delta 1) ou tirar (delta -1)
  const botao = (delta: 1 | -1, rotulo: string) => (
    <button
      type="button"
      className="pixel-btn btn-parchment w-8 px-0 text-sm lg:w-10"
      aria-label={`${delta > 0 ? "Adicionar" : "Remover"} ${NOME_PARTICULA[tipo].toLowerCase()} (Shift: 5)`}
      // segurou 450 ms: passa a repetir de 5 em 5 a cada 180 ms
      onPointerDown={() => {
        longo.current = false;
        timer.current = window.setTimeout(() => {
          longo.current = true;
          timer.current = window.setInterval(() => onChange(clamp(valorRef.current + delta * 5)), 180);
        }, 450) as unknown as number;
      }}
      onPointerUp={parar}
      onPointerLeave={parar}
      onClick={(ev) => {
        if (longo.current) return;
        onChange(clamp(valor + delta * (ev.shiftKey ? 5 : 1)));
      }}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="flex items-center gap-1 lg:gap-2">
      {botao(-1, "−")}
      <input
        type="number"
        min={0}
        max={max}
        value={valor}
        // texto invalido vira 0
        onChange={(ev) => onChange(clamp(Number(ev.target.value) || 0))}
        // setas tratadas aqui para o Shift funcionar e o limite ser respeitado
        onKeyDown={(ev) => {
          if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
            ev.preventDefault();
            onChange(clamp(valor + (ev.key === "ArrowUp" ? 1 : -1) * (ev.shiftKey ? 5 : 1)));
          }
        }}
        aria-label={`Quantidade de ${NOME_PARTICULA[tipo].toLowerCase()}s`}
        className="font-display w-12 border-[3px] border-ink bg-cloud px-1 py-2 text-center text-xs text-ink lg:w-16"
      />
      {botao(1, "+")}
    </div>
  );
}

/*******************************************************************************
 * Laboratorio
 * funcao: tela do laboratorio.
 * recebe: alvoZ (elemento da missao pedida pela url, opcional) e guia (so no
 * tutorial).
 * retorna: a tela com missao, palco do atomo, controles, painel de leitura,
 * e as janelas de descoberta e de cerimonia de familia.
 ******************************************************************************/
export function Laboratorio({ alvoZ, guia }: { alvoZ?: number | undefined; guia?: Guia | undefined }) {
  const store = useProgresso();
  // no tutorial, tudo acontece num progresso de treino separado do jogo salvo
  const [treino, setTreino] = useState(progressoInicial);
  const estado = guia ? treino : store.estado;
  const tocar = store.tocar;
  // construir de verdade (store) ou no treino (tutorial)
  const construir = (pt: Particulas) => {
    if (!guia) return store.construir(pt);
    const r = construirMotor(treino, pt);
    setTreino(r.estado);
    return { classificacao: r.classificacao, eventos: r.eventos };
  };
  const guiaRef = useRef(guia);
  guiaRef.current = guia;
  // quantidade de cada particula no atomo
  const [p, setP] = useState(0);
  const [n, setN] = useState(0);
  const [e, setE] = useState(0);
  // muda a cada particula nova, para o nucleo balancar
  const [wobble, setWobble] = useState(0);
  // particula sendo arrastada e a posicao do ponteiro
  const [drag, setDrag] = useState<{ tipo: TipoParticula; x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [celebrar, setCelebrar] = useState<{ z: number; msg: string } | null>(null);
  const [animarEstrelas, setAnimar] = useState<number[]>([]);
  // area do atomo, onde soltar a particula conta
  const palco = useRef<HTMLDivElement>(null);

  const [cerimonia, setCerimonia] = useState<Categoria | null>(null);
  // mensagem de missao M2/M3 cumprida e o confete que vem junto
  const [cumprida, setCumprida] = useState<string | null>(null);
  const [festa, setFesta] = useState(false);
  // missao atual: a do elemento pedido na url ou a proxima sugerida; nenhuma no tutorial
  const missao = guia ? null : (alvoZ ? missaoParaElemento(estado, alvoZ) : null) ?? gerarMissao(estado, 0);
  // quando o ultimo elemento de uma familia e descoberto, a cerimonia aparece depois do
  // cartao de "novo elemento" (por isso espera celebrar ficar null)
  const pendente = guia || celebrar || cerimonia ? null : familiaPendente(estado);
  useEffect(() => {
    if (!pendente) return;
    setCerimonia(pendente);
    store.registrarFamilia(pendente);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendente]);
  // leitura ao vivo do que esta montado, antes mesmo de construir
  const c = classificar({ p, n, e });
  const elVivo = c.elemento ? elementoPorZ(c.z) : undefined;

  // toda mudanca de contador (botao +, digitacao ou arrastar) que aumenta a quantidade
  // faz o mesmo som e animacao
  const mudar = (t: TipoParticula, atual: number, novo: number, set: (n: number) => void) => {
    if (novo > atual) {
      tocar(() => sons.soltar(t));
      setWobble((w) => w + 1);
    }
    set(novo);
  };

  // soma uma particula (soltar no palco ou Enter no botao), respeitando os limites
  const adicionar = useCallback(
    (tipo: TipoParticula) => {
      if (tipo === "p") setP((v) => Math.min(MAX_P, v + 1));
      if (tipo === "n") setN((v) => Math.min(LIMITE_N, v + 1));
      if (tipo === "e") setE((v) => Math.min(maxEletrons(p), v + 1));
      setWobble((w) => w + 1);
      tocar(() => sons.soltar(tipo));
    },
    [p, tocar],
  );

  // avisa o tutorial a cada mudanca
  useEffect(() => {
    guiaRef.current?.onMudar({ p, n, e });
  }, [p, n, e]);

  // REG-06: se os protons diminuirem, corta os eletrons que passarem do limite
  useEffect(() => {
    if (e > maxEletrons(p)) setE(maxEletrons(p));
  }, [p, e]);

  // arrastar com eventos de ponteiro (mouse e toque): segue o ponteiro e, ao soltar
  // dentro do palco, adiciona a particula
  useEffect(() => {
    if (!drag) return;
    const mover = (ev: PointerEvent) => setDrag((d) => (d ? { ...d, x: ev.clientX, y: ev.clientY } : d));
    const soltar = (ev: PointerEvent) => {
      const r = palco.current?.getBoundingClientRect();
      if (r && ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) adicionar(drag.tipo);
      setDrag(null);
    };
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar, { once: true });
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
  }, [drag, adicionar]);

  /*****************************************************************************
   * aoConstruir
   * funcao: botao CONSTRUIR. registra a montagem, confere a missao, mostra o
   * retorno, anima as estrelas ganhas e abre a celebracao se descobriu um
   * elemento novo.
   * recebe: nada. retorna: nada.
   ****************************************************************************/
  const aoConstruir = () => {
    tocar(sons.construir);
    // guarda se ja era descoberto antes, para o texto do retorno
    const antes = c.valido ? descoberto(estado, c.z) : false;
    const missaoAntes = missao;
    const r = construir({ p, n, e });
    // M2 e M3 sao conferidas aqui; a M1 aparece na celebracao de descoberta
    if (missaoAntes && missaoAntes.tipo !== "M1") {
      const av = avaliarMissao(missaoAntes, r.classificacao);
      if (av.cumprida) {
        setCumprida(av.mensagem);
        setFesta(true);
        window.setTimeout(() => setFesta(false), 1600);
        tocar(sons.estrela);
      }
    }
    guia?.onConstruir({ ...r, particulas: { p, n, e } });
    setFeedback(montarFeedback(r.classificacao, r.eventos, antes));
    // quais estrelas (1, 2 ou 3) foram ganhas agora
    const estrelas = r.eventos.flatMap((ev) => (ev.tipo === "ESTRELA_GANHA" ? [ev.estrela] : []));
    setAnimar(estrelas);
    if (estrelas.length) tocar(sons.estrela);
    const desc = r.eventos.find((ev) => ev.tipo === "ELEMENTO_DESCOBERTO");
    // descobriu elemento: som, vibracao no celular e cartao de celebracao (fora do tutorial)
    if (desc) {
      tocar(sons.descoberta);
      if (navigator.vibrate) navigator.vibrate(60);
      const nome = r.classificacao.elemento?.nome ?? "";
      let msg = `Você montou ${nome} com ${r.classificacao.z} ${r.classificacao.z === 1 ? "próton" : "prótons"}: o número de prótons define o elemento.`;
      // descobriu outro elemento que nao era o da missao
      if (missao && missao.z !== desc.z) msg = `Você descobriu ${nome} por acaso. A missão ainda está de pé.`;
      else if (missao) msg = avaliarMissao(missao, r.classificacao).mensagem + " " + msg;
      if (!guia) setCelebrar({ z: desc.z, msg });
    }
  };

  /*****************************************************************************
   * montarFeedback
   * funcao: monta as frases do painel de retorno depois de construir.
   * recebe: cl (Classificacao), eventos e jaDescoberto (se o elemento ja
   * estava descoberto antes).
   * retorna: Feedback com o tom (bom, info ou aviso) e as linhas de texto.
   ****************************************************************************/
  function montarFeedback(cl: Classificacao, eventos: Evento[], jaDescoberto: boolean): Feedback {
    // montagem invalida: so a mensagem de erro (e o aviso do neutron livre)
    if (!cl.valido) {
      const l = [MSG_ERRO[cl.erro ?? ""] ?? ""];
      if (cl.avisos.includes("NEUTRON_LIVRE_INSTAVEL")) l.push("Um nêutron sozinho é instável: dura em média alguns minutos.");
      return { tom: "aviso", linhas: l };
    }
    const nome = cl.elemento?.nome ?? "";
    const l: string[] = [];
    // uma frase para cada coisa nova registrada
    for (const ev of eventos) {
      if (ev.tipo === "ISOTOPO_REGISTRADO") l.push(`Isótopo registrado: ${nome}-${ev.a}.`);
      if (ev.tipo === "ION_REGISTRADO") l.push(`Íon registrado: ${cl.notacao}.`);
      if (ev.tipo === "ESTRELA_GANHA" && ev.estrela === 2) l.push("Estrela do isótopo! Nêutrons mudam a massa, não o elemento.");
      if (ev.tipo === "ESTRELA_GANHA" && ev.estrela === 3) l.push("Estrela do íon! Elétrons mudam a carga, não o elemento.");
    }
    // ion de elemento ainda nao descoberto: lembra que a descoberta pede atomo neutro;
    // atomo neutro de outro elemento ja conhecido: repete a dica da missao
    if (cl.especie !== "atomo_neutro" && !jaDescoberto && !eventos.some((x) => x.tipo === "ELEMENTO_DESCOBERTO"))
      l.push(`Isso é um íon de ${nome.toLowerCase()}. Monte o átomo neutro para descobrir o elemento.`);
    else if (missao && cl.especie === "atomo_neutro" && cl.z !== missao.z && jaDescoberto) l.push(avaliarMissao(missao, cl).mensagem);
    if (cl.nuclideo?.status === "nao_catalogado")
      l.push("Esse isótopo não está no nosso catálogo. Pode nunca ter sido observado ou durar frações de segundo.");
    if (cl.avisos.includes("CARGA_RARA")) l.push("Cargas tão extremas só aparecem em condições muito especiais, como no interior de estrelas.");
    // nada novo num elemento conhecido: sugere mudar neutrons ou eletrons
    if (eventos.length === 0 && jaDescoberto) l.push(`Ainda é ${nome.toLowerCase()}! Você já registrou essa combinação. Mude os nêutrons ou os elétrons.`);
    return { tom: eventos.length ? "bom" : "info", linhas: l };
  }

  // progresso do elemento que esta montado agora, para as estrelas do painel
  const progEl = c.valido ? estado.elementos[String(c.z)] : undefined;

  return (
    <main className={`min-h-screen p-3 sm:p-5 ${guia ? "pb-[26rem] sm:pb-[26rem]" : "pb-44 sm:pb-44 lg:pb-5"}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <TopBar titulo="LABORATÓRIO" compacto />

        {/* aviso de missao M2/M3 cumprida */}
        {cumprida && (
          <section role="status" className="pixel-panel anim-pop flex flex-wrap items-center gap-3 border-gold bg-gold p-3">
            <span className="font-display text-[10px]">★ CUMPRIDA</span>
            <p className="flex-1 text-lg">{cumprida}</p>
            <button type="button" className="pixel-btn btn-parchment" onClick={() => setCumprida(null)}>
              PRÓXIMA MISSÃO ▶
            </button>
          </section>
        )}
        {festa && <Confete />}
        {/* missao atual e dicas; a key reinicia as dicas quando a missao muda */}
        {missao && (
          <section className="pixel-panel flex flex-wrap items-center gap-2 p-2 lg:gap-3 lg:p-3" aria-label="Missão">
            <span className="font-display bg-ink px-2 py-1 text-[10px] text-gold">{ROTULO_MISSAO[missao.tipo]}</span>
            <p className="flex-1 text-base lg:text-lg">{missao.enunciado}</p>
            <Dicas key={missao.id} z={missao.z} textos={missao.tipo === "M1" ? undefined : missao.dicas} />
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            {/* palco: cenario e o atomo desenhado. data-tut marca o que o tutorial destaca */}
            <div ref={palco} data-tut="palco" className="relative aspect-[4/3] max-h-[40svh] min-h-[150px] w-full overflow-hidden border-[3px] border-ink lg:max-h-[calc(100svh-24.5rem)] lg:min-h-[180px]" style={{ boxShadow: "var(--drop)" }}>
              <LabScene />
              <div className="absolute inset-[6%] mx-auto aspect-square" style={{ maxHeight: "88%" }}>
                <Atomo p={p} n={n} e={e} status={c.nuclideo?.status ?? null} wobbleKey={wobble} />
              </div>
              <p className="font-display absolute bottom-2 left-2 bg-ink px-2 py-1 text-[8px] text-parchment">
                ARRASTE AS PARTÍCULAS PARA CÁ
              </p>
            </div>

            {/* no celular os controles ficam presos no pe da tela; no tutorial e no
                computador ficam no fluxo normal */}
            <div className={guia ? "flex flex-col gap-3 lg:flex-row lg:items-stretch" : "fixed inset-x-0 bottom-0 z-30 flex flex-col gap-2 border-t-[3px] border-ink bg-night p-2 lg:static lg:z-auto lg:flex-row lg:items-stretch lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0"}>
              <div data-tut="particulas" className="pixel-panel-dark mx-auto grid w-full max-w-2xl grid-cols-3 gap-2 p-2 lg:max-w-none lg:flex-1 lg:gap-6 lg:px-6 lg:py-3">
                {/* uma coluna por particula: botao de arrastar e contador */}
                {(
                  [
                    ["p", p, MAX_P, setP],
                    ["n", n, LIMITE_N, setN],
                    ["e", e, maxEletrons(p), setE],
                  ] as const
                ).map(([t, v, max, set]) => (
                  <div key={t} data-tut={`col-${t}`} className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      className="pixel-btn btn-parchment flex touch-none flex-col items-center gap-0.5 px-2 py-1 text-[9px] lg:flex-row lg:gap-2 lg:text-sm"
                      aria-label={`${NOME_PARTICULA[t]}: arraste para o átomo ou aperte Enter para adicionar`}
                      // so o botao esquerdo comeca a arrastar
                      onPointerDown={(ev) => {
                        if (ev.button !== 0) return;
                        ev.preventDefault();
                        setDrag({ tipo: t, x: ev.clientX, y: ev.clientY });
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          adicionar(t);
                        }
                      }}
                    >
                      <span className="lg:hidden"><ParticleSprite tipo={t} size={28} /></span>
                      <span className="hidden lg:block"><ParticleSprite tipo={t} size={40} /></span>
                      <span>{NOME_PARTICULA[t].toUpperCase()}</span>
                    </button>
                    <Contador tipo={t} valor={v} max={max} onChange={(x) => mudar(t, v, x, set)} />
                  </div>
                ))}
              </div>
              <div className="mx-auto flex w-full max-w-2xl gap-2 lg:w-44 lg:max-w-none lg:flex-col lg:gap-3">
                {/* CONSTRUIR e LIMPAR */}
                <button type="button" data-tut="construir" className="pixel-btn btn-gold flex-1 whitespace-nowrap px-2 py-2 text-xs lg:py-4" onClick={aoConstruir}>
                  <span aria-hidden className="text-base leading-none">★</span> CONSTRUIR
                </button>
                <button
                  type="button"
                  className="pixel-btn btn-dark"
                  onClick={() => {
                    setP(0);
                    setN(0);
                    setE(0);
                    setFeedback(null);
                  }}
                >
                  LIMPAR
                </button>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            {/* painel de leitura: carta do elemento, especie, numeros Z N E A q e status */}
            <section data-tut="painel" className="pixel-panel p-4" aria-live="polite" aria-label="Painel de leitura">
              <div className="flex items-start gap-3">
                <div className="pixel-block block-open flex h-24 w-24 shrink-0 flex-col items-center justify-center" style={{ ["--cat" as string]: elVivo ? `var(--cat-${elVivo.categoria})` : "var(--parchment-shade)" }}>
                  {c.valido ? (
                    <>
                      <span className="font-display text-[9px]">{c.a}</span>
                      <span className="font-display text-2xl">{c.elemento?.simbolo}</span>
                      {/* so a parte da carga da notacao, ex: "²⁺" */}
                      <span className="font-display text-[9px]">{c.carga === 0 ? "" : c.notacao?.replace(c.elemento?.simbolo ?? "", "")}</span>
                    </>
                  ) : (
                    <span className="font-display text-2xl">?</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xs leading-relaxed">{c.elemento?.nome ?? "?"}</p>
                  {elVivo && <p className="text-sm">{NOME_CATEGORIA[elVivo.categoria]}</p>}
                  {c.especie && <p className="mt-1 font-semibold">{ROTULO_ESPECIE[c.especie]}</p>}
                  {c.notacao && <p className="text-sm">Notação: {c.notacao}</p>}
                </div>
              </div>
              <dl className="font-display mt-4 grid grid-cols-5 gap-1 text-center text-[10px]">
                {[
                  ["Z", c.z, "prótons"],
                  ["N", c.n, "nêutrons"],
                  ["E", c.e, "elétrons"],
                  ["A", c.a, "massa"],
                  ["q", c.carga > 0 ? `+${c.carga}` : c.carga, "carga"],
                ].map(([k, v, d]) => (
                  <div key={String(k)} className="border-[3px] border-ink bg-cloud py-2" title={String(d)}>
                    <dt>{k}</dt>
                    <dd className="mt-1 text-xs">{v}</dd>
                  </div>
                ))}
              </dl>
              {c.nuclideo && (
                <p className="mt-3">
                  Nuclídeo {c.nuclideo.rotulo}: <strong>{MSG_STATUS[c.nuclideo.status]}</strong>
                </p>
              )}
              {/* erro so aparece se algo ja foi montado */}
              {!c.valido && (p > 0 || n > 0 || e > 0) && <p className="mt-3">{MSG_ERRO[c.erro ?? ""]}</p>}
              {progEl && (
                <div className="mt-3 flex items-center gap-2">
                  <Stars estrelas={progEl.estrelas} animar={animarEstrelas} />
                  <span className="text-sm">{descoberto(estado, c.z) ? "Descoberto" : "Ainda não descoberto"}</span>
                </div>
              )}
            </section>

            {/* retorno do ultimo CONSTRUIR */}
            {feedback && feedback.linhas.length > 0 && (
              <section role="status" className={`pixel-panel p-4 ${feedback.tom === "aviso" ? "bg-parchment-shade" : ""}`}>
                {feedback.linhas.map((l, i) => (
                  <p key={i} className="mb-1 last:mb-0">
                    {l}
                  </p>
                ))}
                {c.valido && descoberto(estado, c.z) && (
                  <Link to="/elemento/$z" params={{ z: String(c.z) }} className="mt-2 inline-block underline">
                    Abrir ficha d{artigoDoElemento(c.elemento?.nome ?? "")} {c.elemento?.nome}
                  </Link>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* particula seguindo o ponteiro durante o arraste */}
      {drag && (
        <div aria-hidden className="pointer-events-none fixed z-50" style={{ left: drag.x - 24, top: drag.y - 24 }}>
          <ParticleSprite tipo={drag.tipo} size={48} />
        </div>
      )}
      {/* janelas por cima da tela */}
      {cerimonia && <CerimoniaFamilia familia={cerimonia} onFechar={() => setCerimonia(null)} />}
      {celebrar && <Celebracao z={celebrar.z} mensagem={celebrar.msg} onFechar={() => setCelebrar(null)} />}
    </main>
  );
}
