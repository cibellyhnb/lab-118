import { useEffect, useMemo, useState } from "react";
import {
  GLOSSARIO,
  NOME_CATEGORIA_GLOSSARIO,
  buscarGlossario,
  termoPorId,
  type CategoriaGlossario,
  type TermoGlossario,
} from "@/motor";
import { TopBar } from "./comuns";

const CATEGORIAS = Object.keys(NOME_CATEGORIA_GLOSSARIO) as CategoriaGlossario[];

function Cartao({ t, destaque, onVer }: { t: TermoGlossario; destaque: boolean; onVer: (id: string) => void }) {
  const relacionados = (t.ver ?? []).flatMap((id) => {
    const r = termoPorId(id);
    return r ? [r] : [];
  });
  return (
    <article
      id={`t-${t.id}`}
      className={`pixel-panel scroll-mt-24 p-4 ${destaque ? "anim-pop border-gold" : ""}`}
      style={destaque ? { outline: "4px solid var(--gold)" } : undefined}
    >
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xs leading-relaxed sm:text-sm">{t.termo.toUpperCase()}</h2>
        {t.sigla && <span className="font-display bg-ink px-2 py-1 text-[10px] text-gold">{t.sigla}</span>}
        <span className="ml-auto text-sm text-wood-dark">{NOME_CATEGORIA_GLOSSARIO[t.categoria]}</span>
      </header>
      <p className="text-lg">{t.definicao}</p>
      {t.exemplo && (
        <p className="mt-2 text-lg">
          <strong className="font-display text-[10px] text-wood-dark">EXEMPLO </strong>
          {t.exemplo}
        </p>
      )}
      {t.duvida && (
        <p className="mt-3 border-l-[6px] border-gold bg-parchment-shade p-2 text-lg">
          <strong className="font-display text-[10px] text-wood-dark">DÚVIDA COMUM </strong>
          {t.duvida}
        </p>
      )}
      {relacionados.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-display text-[10px] text-wood-dark">VEJA TAMBÉM</span>
          {relacionados.map((r) => (
            <button key={r.id} type="button" className="pixel-btn btn-sky px-2 text-xs" onClick={() => onVer(r.id)}>
              {r.termo}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

export function Glossario({ termoInicial }: { termoInicial?: string | undefined }) {
  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState<CategoriaGlossario | null>(null);
  const [destaque, setDestaque] = useState<string | null>(termoPorId(termoInicial ?? "") ? (termoInicial ?? null) : null);

  const lista = useMemo(() => buscarGlossario(consulta, categoria), [consulta, categoria]);

  // vai até o termo destacado (vindo de "Veja também" ou de um link com ?termo=)
  useEffect(() => {
    if (!destaque) return;
    const id = window.setTimeout(() => document.getElementById(`t-${destaque}`)?.scrollIntoView({ block: "center", behavior: "smooth" }), 60);
    return () => window.clearTimeout(id);
  }, [destaque]);

  const ver = (id: string) => {
    setConsulta("");
    setCategoria(null);
    setDestaque(id);
  };

  return (
    <main className="min-h-screen p-3 sm:p-5">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <TopBar titulo="GLOSSÁRIO" />

        <section className="pixel-panel flex flex-col gap-3 p-3" aria-label="Busca">
          <label className="flex flex-col gap-1">
            <span className="font-display text-[10px] text-wood-dark">BUSCAR UM TERMO</span>
            <input
              type="search"
              value={consulta}
              onChange={(ev) => {
                setConsulta(ev.target.value);
                setDestaque(null);
              }}
              placeholder="Ex.: isótopo, íon, número de massa, Z..."
              className="w-full border-[3px] border-ink bg-cloud px-3 py-2 text-lg text-ink"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por assunto">
            <button type="button" aria-pressed={categoria === null} className={`pixel-btn px-2 text-[9px] sm:px-3 sm:text-xs ${categoria === null ? "btn-gold" : "btn-parchment"}`} onClick={() => setCategoria(null)}>
              TUDO ({GLOSSARIO.length})
            </button>
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={categoria === c}
                className={`pixel-btn px-2 text-[9px] sm:px-3 sm:text-xs ${categoria === c ? "btn-gold" : "btn-parchment"}`}
                onClick={() => setCategoria(categoria === c ? null : c)}
              >
                {NOME_CATEGORIA_GLOSSARIO[c].toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        <p className="text-lg text-parchment" aria-live="polite">
          {lista.length === 1 ? "1 termo" : `${lista.length} termos`}
          {consulta ? ` para “${consulta}”` : ""}
        </p>

        <div className="flex flex-col gap-3">
          {lista.map((t) => (
            <Cartao key={t.id} t={t} destaque={destaque === t.id} onVer={ver} />
          ))}
          {lista.length === 0 && (
            <p className="pixel-panel p-4 text-lg">
              Nenhum termo encontrado. Tente outra palavra, ou veja a lista inteira em “TUDO”.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
