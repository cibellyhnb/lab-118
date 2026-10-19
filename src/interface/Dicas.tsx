/*******************************************************************************
 * Dicas.tsx
 * funcao principal: painel de dicas da missao, que o jogador abre uma de
 * cada vez, com uma mini tabela periodica na dica de posicao.
 ******************************************************************************/
import { useState } from "react";
import { ELEMENTOS, elementoPorZ, gerarDicas } from "@/motor";

/*******************************************************************************
 * MiniTabela
 * funcao: tabela periodica minuscula que destaca o periodo e o grupo do
 * elemento da missao (dica de nivel 2).
 * recebe: z (elemento da missao).
 * retorna: a grade com 118 quadradinhos, ou nada se o z nao existir.
 ******************************************************************************/
function MiniTabela({ z }: { z: number }) {
  const alvo = elementoPorZ(z);
  if (!alvo) return null;
  return (
    <div aria-hidden className="grid gap-px" style={{ gridTemplateColumns: "repeat(18, 1fr)", maxWidth: 360 }}>
      {ELEMENTOS.map((el) => {
        // mesmo periodo, sem contar as linhas separadas de lantanideos e actinideos
        const linha = el.periodo === alvo.periodo && el.posicao.linha <= 7;
        const coluna = alvo.grupo !== null && el.grupo === alvo.grupo;
        return (
          <span
            key={el.z}
            className="aspect-square border border-ink"
            // alvo em vermelho, periodo e grupo em dourado, o resto apagado
            style={{
              gridRow: el.posicao.linha,
              gridColumn: el.posicao.coluna,
              background: el.z === z ? "var(--proton)" : linha || coluna ? "var(--gold)" : "var(--parchment-shade)",
              opacity: el.z === z || linha || coluna ? 1 : 0.55,
              outline: el.z === z ? "2px solid var(--ink)" : undefined,
              zIndex: el.z === z ? 1 : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

/*******************************************************************************
 * Dicas
 * funcao: dicas da missao. o nivel 1 ja esta no enunciado; aqui o jogador
 * pede os niveis 2 a 4, um por vez, sem custo de estrelas.
 * recebe: z (elemento da missao) e textos (dicas proprias das missoes M2 e
 * M3; sem eles, usa as do motor).
 * retorna: as dicas abertas e o botao de pedir a proxima.
 ******************************************************************************/
export function Dicas({ z, textos }: { z: number; textos?: string[] | undefined }) {
  // quantas dicas ja foram abertas
  const [aberto, setAberto] = useState(0);
  const TITULOS = ["Lembrete", "Conta", "Resposta"];
  // missoes M2/M3 trazem os proprios textos; a M1 usa as dicas de localizacao do motor
  const todas = textos
    ? textos.map((texto, i) => ({ nivel: (i + 2) as 2 | 3 | 4, titulo: TITULOS[i] ?? "Dica", texto }))
    : gerarDicas(z).filter((d) => d.nivel > 1);
  const mostradas = todas.slice(0, aberto);
  const restam = todas.length - aberto;

  return (
    <div className="flex w-full flex-col gap-2">
      {mostradas.map((d) => (
        <div key={d.nivel} className="anim-slide-up border-l-[6px] border-gold bg-parchment-shade p-2">
          <p className="font-display text-[9px] text-wood-dark">DICA {d.nivel - 1}: {d.titulo.toUpperCase()}</p>
          <p>{d.texto}</p>
          {/* mini tabela so na dica de posicao da M1 */}
          {d.nivel === 2 && !textos && <div className="mt-2"><MiniTabela z={z} /></div>}
        </div>
      ))}
      {restam > 0 ? (
        <button type="button" className="pixel-btn btn-sky self-start" onClick={() => setAberto((a) => a + 1)}>
          💡 PEDIR DICA ({restam})
        </button>
      ) : (
        <p className="text-sm">Sem mais dicas. Dica de cientista: tente variar os prótons até o painel mostrar o nome certo.</p>
      )}
    </div>
  );
}
