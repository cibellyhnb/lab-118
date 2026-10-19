import { classificar } from "./classificar";
import { elementoPorZ } from "./dados";
import type { Classificacao, Evento, Particulas, Progresso, ProgressoElemento } from "./tipos";

export function progressoInicial(): Progresso {
  return {
    versao: 1,
    elementos: {},
    conquistas: [],
    quiz: { rodadas: 0, melhor: 0, elementosDesdeUltimoQuiz: 0 },
    tutorialConcluido: false,
    config: { som: false, reduzirMovimento: false },
  };
}

/** Quantos isótopos registrados a estrela 2 exige: 2, ou 1 se o catálogo tiver só 1. */
export function isotoposNecessarios(z: number): number {
  const total = elementoPorZ(z)?.isotopos.length ?? 0;
  return Math.max(1, Math.min(2, total));
}

export function construir(
  estado: Progresso,
  p: Particulas,
): { estado: Progresso; classificacao: Classificacao; eventos: Evento[] } {
  const classificacao = classificar(p);
  const eventos: Evento[] = [];
  if (!classificacao.valido || !classificacao.elemento) return { estado, classificacao, eventos };

  const { z, a, carga } = classificacao;
  const chave = String(z);
  const anterior = estado.elementos[chave];
  const atual: ProgressoElemento = anterior
    ? { estrelas: [...anterior.estrelas], isotopos: [...anterior.isotopos], ions: [...anterior.ions] }
    : { estrelas: [false, false, false], isotopos: [], ions: [] };

  // REG-08: registro de variantes (RF-02: vale mesmo antes da descoberta)
  if (classificacao.nuclideo?.status !== "nao_catalogado" && !atual.isotopos.includes(a)) {
    atual.isotopos.push(a);
    atual.isotopos.sort((x, y) => x - y);
    eventos.push({ tipo: "ISOTOPO_REGISTRADO", z, a });
  }
  if (carga !== 0 && !atual.ions.includes(carga)) {
    atual.ions.push(carga);
    atual.ions.sort((x, y) => x - y);
    eventos.push({ tipo: "ION_REGISTRADO", z, carga });
  }

  // RF-01: descoberta só com átomo neutro
  if (classificacao.especie === "atomo_neutro" && !atual.estrelas[0]) {
    atual.estrelas[0] = true;
    eventos.push({ tipo: "ELEMENTO_DESCOBERTO", z });
    eventos.push({ tipo: "ESTRELA_GANHA", z, estrela: 1 });
  }
  if (atual.estrelas[0]) {
    if (!atual.estrelas[1] && atual.isotopos.length >= isotoposNecessarios(z)) {
      atual.estrelas[1] = true;
      eventos.push({ tipo: "ESTRELA_GANHA", z, estrela: 2 });
    }
    if (!atual.estrelas[2] && atual.ions.length >= 1) {
      atual.estrelas[2] = true;
      eventos.push({ tipo: "ESTRELA_GANHA", z, estrela: 3 });
    }
  }

  if (eventos.length === 0) return { estado, classificacao, eventos };
  return {
    estado: { ...estado, elementos: { ...estado.elementos, [chave]: atual } },
    classificacao,
    eventos,
  };
}

export function descoberto(estado: Progresso, z: number): boolean {
  return estado.elementos[String(z)]?.estrelas[0] === true;
}

export function dominado(estado: Progresso, z: number): boolean {
  const e = estado.elementos[String(z)];
  return !!e && e.estrelas.every(Boolean);
}

export function contarTotais(estado: Progresso): { elementos: number; estrelas: number } {
  let elementos = 0;
  let estrelas = 0;
  for (const el of Object.values(estado.elementos)) {
    if (el.estrelas[0]) {
      elementos++;
      estrelas += el.estrelas.filter(Boolean).length;
    }
  }
  return { elementos, estrelas };
}
