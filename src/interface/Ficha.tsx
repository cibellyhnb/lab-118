import { Link } from "@tanstack/react-router";
import { APLICACOES, CURIOSIDADES, NOME_CATEGORIA, classificar, descoberto, elementoPorZ, isotoposNecessarios } from "@/motor";
import { Stars, TopBar, catStyle } from "./comuns";
import { notacaoIon } from "@/motor";
import { useProgresso } from "./store";
import { PixelArt } from "./PixelArt";
import { PALETA_ILUS, ilustracaoDe } from "./ilus";

const FASE = { solido: "Sólido", liquido: "Líquido", gasoso: "Gasoso", desconhecido: "Desconhecido" } as const;
const fmt = (x: number) => x.toLocaleString("pt-BR", { maximumFractionDigits: 6 });

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="pixel-panel p-4">
      <h2 className="font-display mb-3 text-[11px]">{titulo}</h2>
      {children}
    </section>
  );
}

const ESTRELA_BTN = [
  "....k....",
  "....k....",
  "...kkk...",
  "kkkkkkkkk",
  ".kkkkkkk.",
  "..kkkkk..",
  "..kkkkk..",
  ".kkk.kkk.",
  ".kk...kk.",
];

export function Ficha({ z }: { z: number }) {
  const { estado, ultimoMontado } = useProgresso();
  const el = elementoPorZ(z);
  if (!el) return <p className="p-6">Elemento não encontrado.</p>;
  const prog = estado.elementos[String(z)];
  const aberto = descoberto(estado, z);

  if (!aberto) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-4">
        <TopBar titulo="FICHA" />
        <div className="pixel-panel p-6 text-center">
          <p className="font-display mb-4 text-sm">ELEMENTO BLOQUEADO</p>
          <p className="mb-4">Monte o átomo neutro deste elemento no laboratório para abrir a ficha.</p>
          <Link to="/laboratorio" search={{ z }} className="pixel-btn btn-gold">
            IR PARA A MISSÃO
          </Link>
        </div>
      </main>
    );
  }

  const montado = ultimoMontado[z];
  const cMontado = montado ? classificar(montado) : null;
  const maisLongevo = el.massa_atomica?.tipo === "isotopo_mais_longevo";
  const f = el.ficha;
  const ilus = ilustracaoDe(z);
  const aplicacoes = APLICACOES[z] ?? f.usos ?? [];
  const curiosidades = f.curiosidades?.length ? f.curiosidades : CURIOSIDADES[z] ? [CURIOSIDADES[z]!] : [];
  const principal = el.grupo !== null && (el.grupo <= 2 || el.grupo >= 13);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-3 sm:p-5">
      <TopBar titulo="FICHA" />

      <header className="anim-flip pixel-block block-open flex flex-wrap items-center gap-5 p-5" style={catStyle(el.categoria)}>
        {ilus ? (
          <div className="pixel-block flex w-40 flex-col items-center gap-1 bg-parchment p-2 sm:w-44">
            <div className="flex w-full items-baseline justify-between">
              <span className="font-display text-sm leading-none">{el.simbolo}</span>
              <span className="font-display text-[10px] leading-none">{el.z}</span>
            </div>
            <PixelArt rows={ilus.rows} palette={PALETA_ILUS} scale={7} title={ilus.rotulo} />
            <span className="text-center text-sm leading-tight">{ilus.rotulo}</span>
          </div>
        ) : (
          <div className="pixel-block flex h-28 w-28 flex-col items-center justify-center bg-parchment">
            <span className="font-display text-[10px]">{el.z}</span>
            <span className="font-display text-4xl">{el.simbolo}</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-xl">{el.nome}</h1>
          <p className="text-lg">
            {NOME_CATEGORIA[el.categoria]} · Período {el.periodo}
            {el.grupo ? ` · Grupo ${el.grupo}` : ""}
          </p>
          <p>Estado físico à temperatura ambiente: {el.z >= 104 && el.fase_ambiente !== "desconhecido" ? `${FASE[el.fase_ambiente]} (previsto)` : FASE[el.fase_ambiente]}</p>
          <Stars estrelas={prog?.estrelas ?? [false, false, false]} scale={4} />
        </div>
      </header>

      {f.pista && (
        <Secao titulo="PISTA">
          <p className="text-lg">“{f.pista}”</p>
        </Secao>
      )}

      {prog && !prog.estrelas.every(Boolean) && (
        <Link
          to="/laboratorio"
          search={{ z }}
          className="pixel-btn btn-gold inline-flex items-center gap-3 self-start px-5 py-4 text-sm leading-none"
        >
          <PixelArt rows={ESTRELA_BTN} palette={{ k: "var(--ink)" }} scale={3} />
          <span>BUSCAR AS ESTRELAS QUE FALTAM</span>
        </Link>
      )}

      {aplicacoes.length > 0 && (
        <Secao titulo="ONDE É USADO E ENCONTRADO">
          <ul className="grid gap-3 sm:grid-cols-2">
            {aplicacoes.map((linha, k) => {
              const n = linha.indexOf(": ");
              const tema = n > 0 ? linha.slice(0, n) : "Uso";
              const resto = n > 0 ? linha.slice(n + 2) : linha;
              const texto = resto.charAt(0).toUpperCase() + resto.slice(1);
              const sozinho = aplicacoes.length % 2 === 1 && k === aplicacoes.length - 1;
              return (
                <li key={linha} className={`flex flex-col border-[3px] border-ink bg-parchment-shade ${sozinho ? "sm:col-span-2" : ""}`}>
                  <span className="h-2" style={{ background: `var(--cat-${el.categoria})` }} />
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <span className="font-display self-start bg-ink px-2 py-1 text-[9px] leading-none text-gold">{tema.toUpperCase()}</span>
                    <p className="text-lg leading-snug">{texto}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Secao>
      )}

      <Secao titulo="SEU ÁTOMO × TABELA">
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <div className="border-[3px] border-ink bg-cloud p-3">
            <p className="font-display text-[9px]">NÚMERO DE MASSA (SEU ÁTOMO)</p>
            <p className="font-display mt-2 text-xl">{cMontado ? cMontado.a : "-"}</p>
            {!cMontado && <p className="text-sm">Construa um átomo deste elemento para comparar.</p>}
          </div>
          <div className="border-[3px] border-ink bg-cloud p-3">
            <p className="font-display text-[9px]">{maisLongevo ? "NÚMERO DE MASSA DO ISÓTOPO MAIS LONGEVO" : "MASSA ATÔMICA (TABELA)"}</p>
            <p className="font-display mt-2 text-xl">{el.massa_atomica ? fmt(el.massa_atomica.valor) : "sem dado"}</p>
          </div>
        </div>
        <p>
          Número de massa é a soma de prótons e nêutrons de um átomo específico, e por isso é sempre um número inteiro. Massa
          atômica é a média ponderada das massas dos isótopos naturais de um elemento, e por isso costuma ser decimal.
          {maisLongevo && " Este elemento não tem isótopo estável, então não existe uma massa atômica padrão: a tabela mostra o número de massa do isótopo que dura mais tempo."}
        </p>
        {cMontado && el.massa_atomica && !maisLongevo && (
          <p className="mt-2">
            Você montou o {el.nome.toLowerCase()}-{cMontado.a}, com número de massa {cMontado.a}. Na tabela, a massa atômica do{" "}
            {el.nome.toLowerCase()} é {fmt(el.massa_atomica.valor)}, a média dos isótopos naturais.
          </p>
        )}
        {cMontado && el.massa_atomica && maisLongevo && (
          <p className="mt-2">
            Você montou o {el.nome.toLowerCase()}-{cMontado.a}. O isótopo que dura mais tempo é o {el.nome.toLowerCase()}-{fmt(el.massa_atomica.valor)}.
          </p>
        )}
      </Secao>

      {principal && el.eletrons_valencia !== null && (
        <Secao titulo="ELÉTRONS DE VALÊNCIA">
          <p>
            {el.eletrons_valencia} na última camada (camadas: {el.camadas.join(", ")}).
          </p>
        </Secao>
      )}
      {!principal && (
        <Secao titulo="ELÉTRONS DE VALÊNCIA">
          <p>Varia: para este tipo de elemento o jogo não usa um número fixo.</p>
        </Secao>
      )}

      {el.isotopos.length > 0 && (
        <Secao titulo="ISÓTOPOS CATALOGADOS">
          <ul className="grid gap-2 sm:grid-cols-2">
            {el.isotopos.map((i) => {
              const reg = prog?.isotopos.includes(i.a);
              return (
                <li key={i.a} className={`border-[3px] border-ink p-2 ${reg ? "bg-gold" : "bg-cloud"}`}>
                  <span className="font-display text-[10px]">
                    {el.simbolo}-{i.a}
                  </span>{" "}
                  · {i.estabilidade === "estavel" ? "estável" : "radioativo"}
                  {i.meia_vida ? ` · meia-vida ${i.meia_vida}` : ""}
                  {i.abundancia_pct !== null ? ` · ${fmt(i.abundancia_pct)}% na natureza` : ""}
                  {reg ? " ✓ registrado" : ""}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm">
            Estrela 2: registre {isotoposNecessarios(z)} {isotoposNecessarios(z) === 1 ? "isótopo" : "isótopos"} do catálogo.
          </p>
        </Secao>
      )}

      <Secao titulo="SUAS VARIANTES">
        <p>Isótopos: {prog?.isotopos.length ? prog.isotopos.map((a) => `${el.simbolo}-${a}`).join(", ") : "nenhum ainda"}</p>
        <p>Íons: {prog?.ions.length ? prog.ions.map((q) => notacaoIon(el.simbolo, q)).join(", ") : "nenhum ainda"}</p>
        {el.ions_comuns.length > 0 && (
          <p className="mt-2 text-sm">
            Comuns em compostos: {el.ions_comuns.map((q) => notacaoIon(el.simbolo, q)).join(", ")}. Íons isolados não são o mesmo que íons em compostos.
          </p>
        )}
        {el.ions_comuns.length === 0 && (
          <p className="mt-2 text-sm">
            Este elemento não costuma formar íons simples em compostos. Mesmo assim, dá para montar íons dele no laboratório.
          </p>
        )}
      </Secao>

      {curiosidades.length > 0 && (
        <Secao titulo="CURIOSIDADES">
          <ul className="list-inside list-[square]">
            {curiosidades.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </Secao>
      )}
      {f.fontes && f.fontes.length > 0 && (
        <Secao titulo="FONTES">
          <ul className="text-sm">
            {f.fontes.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </Secao>
      )}
      <p className="pb-6 text-sm text-parchment-shade">
        Sobre este modelo: o átomo é desenhado com camadas. É uma metáfora visual; elétrons não orbitam como planetas.
      </p>
    </main>
  );
}
