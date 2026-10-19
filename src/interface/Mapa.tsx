/*******************************************************************************
 * Mapa.tsx
 * funcao principal: tela do mapa, a tabela periodica com o progresso do
 * jogador: blocos trancados ou abertos, estrelas, brasoes das familias,
 * proxima missao e o final do jogo quando a tabela fica completa.
 ******************************************************************************/
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ELEMENTOS,
  FAMILIAS,
  NOME_CATEGORIA,
  SIGLA_CATEGORIA,
  contarTotais,
  dominado,
  gerarMissao,
  progressoFamilia,
  seloConquistado,
  type Categoria,
  type Elemento,
} from "@/motor";
import { C, LOCK, PixelArt, Star } from "./PixelArt";
import { BotaoAjuda } from "./Ajuda";
import { Emblema } from "./Emblema";
import { Final } from "./Final";
import { TituloLab } from "./Titulo";
import { SoundToggle, Stars, catStyle } from "./comuns";
import { CHAVE_FINAL, useProgresso } from "./store";

/*******************************************************************************
 * Bloco
 * funcao: um bloco da tabela. trancado, mostra cadeado e leva para a
 * missao; aberto, mostra numero, simbolo e estrelas e leva para a ficha.
 * recebe: el (Elemento).
 * retorna: o bloco como link.
 ******************************************************************************/
function Bloco({ el }: { el: Elemento }) {
  const { estado } = useProgresso();
  const prog = estado.elementos[String(el.z)];
  const aberto = !!prog?.estrelas[0];
  // com as 3 estrelas o bloco fica dourado
  const ouro = dominado(estado, el.z);
  // coluna + 1 porque a primeira coluna da grade e a dos rotulos "Mundo"
  const estilo = { ...catStyle(el.categoria), gridRow: el.posicao.linha, gridColumn: el.posicao.coluna + 1 };
  const classe = `pixel-block aspect-square flex flex-col items-center justify-center ${aberto ? "block-open" : "block-locked"} ${ouro ? "block-gold" : ""} hover:brightness-110 focus-visible:z-10`;
  // quadradinho claro no canto marca os elementos da Trilha essencial
  const trilha = el.trilha_essencial && (
    <span aria-hidden className="absolute left-0 top-0 h-1.5 w-1.5 bg-parchment" style={{ boxShadow: "1px 1px 0 var(--ink)" }} />
  );

  // trancado: o nome fica escondido, so periodo e grupo no aria-label
  if (!aberto) {
    return (
      <Link
        to="/laboratorio"
        search={{ z: el.z }}
        className={classe}
        style={estilo}
        aria-label={`Bloqueado: período ${el.periodo}${el.grupo ? `, grupo ${el.grupo}` : ""}. Abrir missão.`}
      >
        {trilha}
        <PixelArt rows={LOCK} scale={2} palette={{ k: C.ink, g: "color-mix(in oklab, var(--cat) 60%, var(--parchment))" }} />
      </Link>
    );
  }
  return (
    <Link
      to="/elemento/$z"
      params={{ z: String(el.z) }}
      className={classe}
      style={estilo}
      aria-label={`${el.nome}, número atômico ${el.z}, ${prog.estrelas.filter(Boolean).length} estrelas`}
    >
      {trilha}
      <span className="absolute left-0.5 top-0 text-[9px] leading-none sm:text-[11px]">{el.z}</span>
      <span className="font-display text-[10px] sm:text-sm">{el.simbolo}</span>
      <span className="absolute bottom-0.5 right-0.5 flex gap-px">
        {prog.estrelas.map((s, i) => (
          <Star key={i} filled={s} scale={1} />
        ))}
      </span>
    </Link>
  );
}

/*******************************************************************************
 * Familias
 * funcao: faixa com o brasao de cada familia: apagado ate completar;
 * depois vira atalho para o quiz e mostra o selo.
 * recebe: nada.
 * retorna: a lista de brasoes com a contagem ou o selo de cada um.
 ******************************************************************************/
function Familias() {
  const { estado } = useProgresso();
  return (
    <section className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t-[3px] border-dashed border-wood/50 pt-2" aria-label="Famílias da tabela">
      <p className="font-display text-[11px]">Famílias</p>
      <ul className="flex flex-1 flex-wrap gap-2">
        {FAMILIAS.map((f) => {
          const pr = progressoFamilia(estado, f.id);
          const selo = seloConquistado(estado, f.id);
          // embaixo do brasao: contagem, "QUIZ" ou as estrelas do selo
          const corpo = (
            <>
              <Emblema familia={f.id} scale={2} apagado={!pr.completa} />
              <span className="font-display text-[8px] leading-none">
                {pr.completa ? (selo > 0 ? <Stars estrelas={[selo >= 1, selo >= 2, selo >= 3]} scale={1} /> : "QUIZ") : `${pr.descobertos}/${pr.total}`}
              </span>
            </>
          );
          return (
            <li key={f.id}>
              {pr.completa ? (
                <Link to="/quiz" search={{ familia: f.id }} className="flex flex-col items-center gap-1 hover:brightness-110" title={`${f.nome}: fazer o quiz`}>
                  {corpo}
                </Link>
              ) : (
                <span className="flex flex-col items-center gap-1" title={`${f.nome}: ${pr.descobertos} de ${pr.total} descobertos`}>
                  {corpo}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// rotulo de cada linha da grade; a 8a e o espaco antes de lantanideos e actinideos
const ROTULOS_LINHA = ["Mundo 1", "Mundo 2", "Mundo 3", "Mundo 4", "Mundo 5", "Mundo 6", "Mundo 7", "", "Lant.", "Actin."];

/*******************************************************************************
 * Mapa
 * funcao: tela do mapa. manda para o tutorial quem ainda nao fez, e abre
 * o final do jogo na primeira vez que a tabela fica completa.
 * recebe: nada.
 * retorna: cabecalho com progresso e familias, a tabela e a legenda.
 ******************************************************************************/
export function Mapa() {
  const { estado, avisoCorrompido, carregado } = useProgresso();
  const navegar = useNavigate();
  // quem ainda nao fez o tutorial vai para ele
  useEffect(() => {
    if (carregado && !estado.tutorialConcluido) void navegar({ to: "/tutorial" });
  }, [carregado, estado.tutorialConcluido, navegar]);
  const tot = contarTotais(estado);
  const [final, setFinal] = useState(false);
  // abre o final sozinho na primeira vez que a tabela fica completa (e guarda que ja viu)
  useEffect(() => {
    if (!carregado || tot.elementos < ELEMENTOS.length) return;
    try {
      if (!localStorage.getItem(CHAVE_FINAL)) setFinal(true);
    } catch {
      /* sem armazenamento: nao abre sozinho */
    }
  }, [carregado, tot.elementos]);
  // atalho para a apresentacao do trabalho: abrir /mapa?final=1 mostra o final mesmo
  // sem a tabela completa
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("final") === "1") setFinal(true);
  }, []);
  // ao fechar o final, marca que ja foi visto
  const fecharFinal = () => {
    setFinal(false);
    try {
      localStorage.setItem(CHAVE_FINAL, "1");
    } catch {
      /* ignora */
    }
  };
  const proxima = gerarMissao(estado, 0);
  // porcentagem da barra de progresso
  const pct = Math.round((tot.elementos / 118) * 100);

  return (
    <main className="flex min-h-screen flex-col justify-center">
      {/* em telas baixas, cabecalho e tabela encolhem juntos para a tabela caber inteira
          sem rolar (a grade tem ~1,9 de largura para 1 de altura). @container deixa o
          botao PROXIMA MISSAO escolher o lugar pela largura que sobrou */}
      <div className="@container mx-auto w-full" style={{ maxWidth: "min(84rem, max(672px, calc((100svh - 300px) * 1.9 + 2rem)))" }}>
      <header className="flex flex-col gap-3 px-4 pb-2 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="pixel-btn btn-parchment px-3 text-base" aria-label="Voltar para a tela inicial" title="Voltar ao início">
              ◀
            </Link>
            <div>
            <h1 className="leading-none">
              <Link to="/" title="Tela inicial" className="block hover:brightness-110">
                <TituloLab className="w-[150px] sm:w-[210px]" />
              </Link>
            </h1>
            <p className="font-display mt-2 text-[8px] tracking-widest text-parchment-shade sm:text-[10px]">CONSTRUTOR ATÔMICO</p>
            </div>
          </div>
          {/* atalhos; o botao FINAL so aparece com a tabela completa. em areas estreitas
              (menos de 52rem) a PROXIMA MISSAO vem para ca, para nao espremer a barra */}
          <div className="flex gap-2">
            {proxima && (
              <Link to="/laboratorio" search={{ z: proxima.z }} className="pixel-btn btn-gold hidden @max-[52rem]:inline">
                ▶ PRÓXIMA MISSÃO
              </Link>
            )}
            <Link to="/quiz" className="pixel-btn btn-parchment">
              QUIZ
            </Link>
            <Link to="/glossario" className="pixel-btn btn-parchment">
              GLOSSÁRIO
            </Link>
            {tot.elementos >= ELEMENTOS.length && (
              <button type="button" className="pixel-btn btn-gold" onClick={() => setFinal(true)}>
                ★ FINAL
              </button>
            )}
            <SoundToggle />
            <BotaoAjuda />
          </div>
        </div>
        {/* painel de progresso: contagens, barra, proxima missao e familias */}
        <div className="pixel-panel flex flex-col gap-2 p-3">
          {/* uma linha so, sem quebrar: textos fixos, barra com o espaco que sobra e o
              botao compacto no fim. a largura do mapa depende da altura da janela, entao
              em janelas baixas a linha fica estreita e antes o botao caia para baixo */}
          <div className="flex items-center gap-x-4">
            <p className="font-display shrink-0 whitespace-nowrap text-[11px]">Elementos {tot.elementos}/118</p>
            <p className="font-display flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px]">
              <Star filled scale={2} /> Estrelas {tot.estrelas}/354
            </p>
            <div className="h-5 min-w-0 flex-1 border-[3px] border-ink bg-panel" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da tabela">
              <div className="h-full bg-gold" style={{ width: `${pct}%`, boxShadow: "inset 0 -3px 0 var(--wood)" }} />
            </div>
            {proxima && (
              // compacto: 29 px de altura, e a margem negativa faz ele ocupar menos que os
              // 20 px da barra, para o painel nao ficar mais alto por causa dele. some em
              // areas estreitas, onde o botao do cabecalho toma o lugar
              <Link to="/laboratorio" search={{ z: proxima.z }} className="pixel-btn btn-gold -my-[5px] shrink-0 whitespace-nowrap px-[10px] py-[6px] @max-[52rem]:hidden">
                ▶ PRÓXIMA MISSÃO
              </Link>
            )}
          </div>
          <Familias />
        </div>
      </header>

      {/* aviso quando o progresso salvo estava estragado */}
      {avisoCorrompido && (
        <p role="alert" className="pixel-panel mx-auto mt-4 max-w-3xl p-3">
          Não conseguimos ler o progresso salvo, então começamos um novo. Uma cópia do arquivo antigo foi guardada.
        </p>
      )}

      <section className="px-2 py-3 sm:px-4" aria-label="Tabela periódica">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "minmax(36px,auto) repeat(18, minmax(0,1fr))", gridTemplateRows: "repeat(7, auto) 12px auto auto" }}
        >
          {/* rotulos das linhas */}
          {ROTULOS_LINHA.map((r, i) =>
            r ? (
              <span key={i} className="font-display flex items-center pr-1 text-[7px] text-parchment-shade sm:text-[9px]" style={{ gridRow: i + 1, gridColumn: 1 }}>
                {r}
              </span>
            ) : null,
          )}
          {/* casas tracejadas que indicam onde entram lantanideos e actinideos */}
          {[6, 7].map((linha) => (
            <span
              key={linha}
              aria-hidden
              className="font-display flex aspect-square items-center justify-center border-2 border-dashed border-parchment-shade text-[7px] text-parchment-shade"
              style={{ gridRow: linha, gridColumn: 4 }}
            >
              {linha === 6 ? "57-71" : "89-103"}
            </span>
          ))}
          {ELEMENTOS.map((el) => (
            <Bloco key={el.z} el={el} />
          ))}
        </div>

        {/* legenda das cores */}
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Legenda das famílias">
          {(Object.keys(NOME_CATEGORIA) as Categoria[]).map((c) => (
            <li key={c} className="pixel-block block-open flex items-center gap-1.5 px-1.5 py-0.5 text-xs" style={catStyle(c)}>
              <span className="font-display text-[8px]">{SIGLA_CATEGORIA[c]}</span>
              {NOME_CATEGORIA[c]}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-parchment-shade">
          Clique num bloco com cadeado para abrir a missão dele. O quadradinho claro no canto marca a Trilha essencial.
        </p>
      </section>
      </div>
      {final && <Final onFechar={fecharFinal} />}
    </main>
  );
}
