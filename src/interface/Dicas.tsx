import { useState } from "react";
import { ELEMENTOS, elementoPorZ, gerarDicas } from "@/motor";

/** Tabela minúscula que destaca o período e o grupo do elemento da missão (dica de nível 2). */
function MiniTabela({ z }: { z: number }) {
  const alvo = elementoPorZ(z);
  if (!alvo) return null;
  return (
    <div aria-hidden className="grid gap-px" style={{ gridTemplateColumns: "repeat(18, 1fr)", maxWidth: 360 }}>
      {ELEMENTOS.map((el) => {
        const linha = el.periodo === alvo.periodo && el.posicao.linha <= 7;
        const coluna = alvo.grupo !== null && el.grupo === alvo.grupo;
        return (
          <span
            key={el.z}
            className="aspect-square border border-ink"
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

/** Dicas da missão. O nível 1 já está no enunciado; aqui o jogador pede os níveis 2 a 4, um por vez. Sem custo de estrelas. */
export function Dicas({ z, textos }: { z: number; textos?: string[] | undefined }) {
  const [aberto, setAberto] = useState(0);
  const TITULOS = ["Lembrete", "Conta", "Resposta"];
  // Missões M2/M3 trazem os próprios textos; a M1 usa as dicas de localização do motor
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
