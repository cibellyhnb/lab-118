/*******************************************************************************
 * Quiz.tsx
 * funcao principal: tela do quiz: menu com o quiz geral e os das familias,
 * a rodada de perguntas com explicacao a cada resposta e o resultado com o
 * selo de estrelas.
 ******************************************************************************/
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  FAMILIAS,
  familiaPorId,
  montarRodada,
  progressoFamilia,
  seloConquistado,
  type IdQuiz,
  type PerguntaPronta,
  type Selo,
} from "@/motor";
import { Emblema } from "./Emblema";
import { Stars, TopBar } from "./comuns";
import { sons, useProgresso } from "./store";

// frases curtas de reacao, escolhidas em rodizio
const ACERTOS = ["Isso mesmo!", "Boa!", "Acertou!", "Mandou bem!", "Exato!"];
const ERROS = ["Quase!", "Sem problema!", "Foi por pouco!", "Boa tentativa!"];
const LETRAS = ["A", "B", "C"];

// rodada em andamento: pergunta atual (i), opcao escolhida e acertos ate agora
type Jogo = { quiz: IdQuiz; perguntas: PerguntaPronta[]; i: number; escolha: number | null; acertos: number };
// resultado da rodada que acabou
type Fim = { quiz: IdQuiz; acertos: number; total: number; selo: Selo; novoRecorde: boolean };

// selo 2 vira [true, true, false], para o componente Stars
const estrelasDoSelo = (s: number): boolean[] => [s >= 1, s >= 2, s >= 3];

/*******************************************************************************
 * tituloDoQuiz
 * funcao: titulo do quiz para o topo da tela.
 * recebe: quiz (IdQuiz).
 * retorna: "QUIZ GERAL" ou "QUIZ: " + nome da familia.
 ******************************************************************************/
function tituloDoQuiz(quiz: IdQuiz): string {
  return quiz === "geral" ? "QUIZ GERAL" : `QUIZ: ${familiaPorId(quiz).nome.toUpperCase()}`;
}

/*******************************************************************************
 * mensagemFinal
 * funcao: frase do resultado, de acordo com o selo.
 * recebe: selo (1 a 3) e quiz (IdQuiz).
 * retorna: a frase de parabens ou de incentivo.
 ******************************************************************************/
function mensagemFinal(selo: Selo, quiz: IdQuiz): string {
  const alvo = quiz === "geral" ? "o básico dos átomos" : `os ${familiaPorId(quiz).nome}`;
  if (selo === 3) return `Perfeito! Você domina ${alvo}.`;
  if (selo === 2) return `Muito bem! Você já sabe bastante sobre ${alvo}. Dá para chegar nas 3 estrelas.`;
  return "Você terminou! Releia a ficha dos elementos e tente de novo para ganhar mais estrelas.";
}

/*******************************************************************************
 * Quiz
 * funcao: tela do quiz, que alterna entre menu, rodada e resultado.
 * recebe: familiaInicial (id da familia vindo da url, opcional).
 * retorna: a tela do estado atual (jogando, resultado ou menu).
 ******************************************************************************/
export function Quiz({ familiaInicial }: { familiaInicial?: string | undefined }) {
  const { estado, carregado, tocar, registrarQuiz } = useProgresso();
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [fim, setFim] = useState<Fim | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // evita iniciar sozinho mais de uma vez quando o estado muda
  const iniciouAuto = useRef(false);
  const proximo = useRef<HTMLButtonElement>(null);

  // comeca uma rodada nova do quiz escolhido
  const iniciar = (quiz: IdQuiz) => {
    setFim(null);
    setAviso(null);
    setJogo({ quiz, perguntas: montarRodada(quiz), i: 0, escolha: null, acertos: 0 });
  };

  // link direto /quiz?familia=...: comeca sozinho, mas so se a familia ja estiver completa;
  // familia que nao existe e ignorada
  useEffect(() => {
    if (!carregado || iniciouAuto.current || !familiaInicial) return;
    iniciouAuto.current = true;
    const fam = FAMILIAS.find((f) => f.id === familiaInicial);
    if (!fam) return;
    if (progressoFamilia(estado, fam.id).completa) iniciar(fam.id);
    else setAviso(`Descubra todos os ${fam.nome} para liberar este quiz.`);
  }, [carregado, familiaInicial, estado]);

  // depois de responder, foca o botao de proxima para o Enter avancar
  useEffect(() => {
    if (jogo?.escolha !== null) proximo.current?.focus({ preventScroll: true });
  }, [jogo?.escolha]);

  // escolhe uma opcao; depois de responder, as outras nao valem mais
  const responder = (k: number) => {
    if (!jogo || jogo.escolha !== null) return;
    const certa = k === jogo.perguntas[jogo.i]!.correta;
    tocar(certa ? sons.acerto : sons.erro);
    setJogo({ ...jogo, escolha: k, acertos: jogo.acertos + (certa ? 1 : 0) });
  };

  // proxima pergunta ou, na ultima, registra o resultado e mostra o fim
  const avancar = () => {
    if (!jogo || jogo.escolha === null) return;
    if (jogo.i + 1 < jogo.perguntas.length) {
      setJogo({ ...jogo, i: jogo.i + 1, escolha: null });
      return;
    }
    const total = jogo.perguntas.length;
    const r = registrarQuiz(jogo.quiz, jogo.acertos, total);
    tocar(r.selo === 3 ? sons.fanfarra : sons.descoberta);
    setFim({ quiz: jogo.quiz, acertos: jogo.acertos, total, selo: r.selo, novoRecorde: r.novoRecorde });
    setJogo(null);
  };

  // ----- jogando -----
  if (jogo) {
    const p = jogo.perguntas[jogo.i]!;
    const respondida = jogo.escolha !== null;
    const acertou = respondida && jogo.escolha === p.correta;
    const ultima = jogo.i + 1 === jogo.perguntas.length;
    // escolhe a frase de reacao sem sorteio, variando com a pergunta e os acertos
    const sorte = (lista: string[]) => lista[(jogo.i + jogo.acertos) % lista.length]!;
    return (
      <main className="flex min-h-screen flex-col justify-center p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <TopBar titulo="QUIZ" compacto />
          {/* cabecalho: brasao, titulo, barra de progresso e contador */}
          <div className="flex items-center gap-3">
            {jogo.quiz !== "geral" && <Emblema familia={jogo.quiz} scale={2} />}
            <div className="flex-1">
              <p className="font-display mb-1 text-[10px] text-parchment">{tituloDoQuiz(jogo.quiz)}</p>
              <div className="h-4 border-[3px] border-ink bg-panel" role="progressbar" aria-valuemin={0} aria-valuemax={jogo.perguntas.length} aria-valuenow={jogo.i + (respondida ? 1 : 0)} aria-label="Progresso do quiz">
                <div className="h-full bg-gold" style={{ width: `${((jogo.i + (respondida ? 1 : 0)) / jogo.perguntas.length) * 100}%`, boxShadow: "inset 0 -3px 0 var(--wood)" }} />
              </div>
            </div>
            <p className="font-display text-[10px] text-parchment">
              {jogo.i + 1}/{jogo.perguntas.length}
            </p>
          </div>

          <section className="pixel-panel anim-fade p-4" aria-live="polite">
            <p className="font-display mb-1 text-[10px] text-wood-dark">PERGUNTA {jogo.i + 1}</p>
            <h2 className="text-xl leading-snug sm:text-2xl">{p.enunciado}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {p.opcoes.map((o, k) => {
                const certa = k === p.correta;
                const escolhida = k === jogo.escolha;
                // depois de responder: certa em dourado, escolhida errada escura, o resto apagado
                const cls = !respondida ? "btn-parchment" : certa ? "btn-gold" : escolhida ? "btn-dark" : "btn-parchment opacity-60";
                return (
                  <button
                    key={k}
                    type="button"
                    className={`pixel-btn ${cls} flex items-center justify-start gap-3 text-left text-sm normal-case`}
                    aria-disabled={respondida}
                    onClick={() => responder(k)}
                  >
                    <span className="font-display text-xs">{LETRAS[k]}</span>
                    <span className="flex-1 text-lg">{o}</span>
                    {respondida && certa && <span className="font-display text-[9px]">CERTA</span>}
                  </button>
                );
              })}
            </div>

            {/* reacao e explicacao depois de responder */}
            {respondida && (
              <div className={`anim-slide-up mt-4 border-l-[6px] p-3 ${acertou ? "border-gold bg-parchment-shade" : "border-sky bg-parchment-shade"}`}>
                <p className="font-display mb-1 text-[10px] text-wood-dark">{acertou ? sorte(ACERTOS).toUpperCase() : sorte(ERROS).toUpperCase()}</p>
                <p className="text-lg">{p.explicacao}</p>
              </div>
            )}
            {respondida && (
              <div className="mt-4 flex justify-end">
                <button ref={proximo} type="button" className="pixel-btn btn-gold" onClick={avancar}>
                  {ultima ? "VER RESULTADO ★" : "PRÓXIMA ▶"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  // ----- resultado -----
  if (fim) {
    return (
      <main className="flex min-h-screen flex-col justify-center p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <TopBar titulo="QUIZ" compacto />
          <section className="pixel-panel anim-pop flex flex-col items-center gap-4 p-6 text-center">
            <p className="font-display text-[10px] text-wood-dark">{tituloDoQuiz(fim.quiz)}</p>
            {fim.quiz !== "geral" && <Emblema familia={fim.quiz} scale={6} className="anim-brilho" />}
            <h2 className="font-display text-sm leading-relaxed sm:text-lg">
              VOCÊ ACERTOU {fim.acertos} DE {fim.total}!
            </h2>
            {/* anima so as estrelas ganhas */}
            <Stars estrelas={estrelasDoSelo(fim.selo)} scale={5} animar={[1, 2, 3].slice(0, fim.selo)} />
            <p className="text-xl">{mensagemFinal(fim.selo, fim.quiz)}</p>
            {fim.novoRecorde && <p className="font-display text-[10px] text-wood-dark">NOVO SELO CONQUISTADO!</p>}
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" className="pixel-btn btn-gold" onClick={() => iniciar(fim.quiz)}>
                TENTAR DE NOVO
              </button>
              <button type="button" className="pixel-btn btn-sky" onClick={() => setFim(null)}>
                OUTROS QUIZZES
              </button>
              <Link to="/mapa" className="pixel-btn btn-parchment">
                VOLTAR AO MAPA
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // ----- menu -----
  const seloGeral = seloConquistado(estado, "geral");
  return (
    <main className="flex min-h-screen flex-col justify-center p-3 sm:p-5">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <TopBar titulo="QUIZ" />
        {aviso && (
          <p role="status" className="pixel-panel p-3 text-lg">
            {aviso}
          </p>
        )}

        {/* quiz geral, sempre liberado */}
        <section className="pixel-panel flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xs sm:text-sm">QUIZ GERAL</h2>
            <p className="text-lg">8 perguntas sobre átomos, isótopos, íons e a tabela. Dá para jogar sempre, e as perguntas mudam a cada rodada.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            {seloGeral > 0 && <Stars estrelas={estrelasDoSelo(seloGeral)} scale={3} />}
            <button type="button" className="pixel-btn btn-gold" onClick={() => iniciar("geral")}>
              COMEÇAR ▶
            </button>
          </div>
        </section>

        <h2 className="font-display text-[10px] text-parchment">QUIZ DAS FAMÍLIAS</h2>
        <p className="-mt-2 text-lg text-parchment">Descubra todos os elementos de uma família para liberar o quiz dela.</p>
        {/* um cartao por familia: liberado so com a familia completa */}
        <div className="grid gap-3 sm:grid-cols-2">
          {FAMILIAS.map((f) => {
            const pr = progressoFamilia(estado, f.id);
            const selo = seloConquistado(estado, f.id);
            return (
              <article key={f.id} className="pixel-panel flex items-center gap-3 p-3">
                <Emblema familia={f.id} scale={3} apagado={!pr.completa} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[10px] leading-relaxed">{f.nome.toUpperCase()}</h3>
                  {pr.completa ? (
                    <>
                      {selo > 0 ? <Stars estrelas={estrelasDoSelo(selo)} scale={2} /> : <p className="text-lg">Quiz liberado!</p>}
                      <div className="mt-2">
                        <button type="button" className="pixel-btn btn-gold px-3 text-xs" onClick={() => iniciar(f.id)}>
                          {selo === 0 ? "JOGAR ▶" : "JOGAR DE NOVO"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-lg">
                      {pr.descobertos}/{pr.total} elementos descobertos
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

