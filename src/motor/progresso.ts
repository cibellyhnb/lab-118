/*******************************************************************************
 * progresso.ts
 * funcao principal: regras de progresso do jogador. ao construir uma
 * montagem, registra isotopos e ions, marca a descoberta, da as estrelas e
 * devolve os eventos que aconteceram.
 ******************************************************************************/
import { classificar } from "./classificar";
import { elementoPorZ } from "./dados";
import type { Classificacao, Evento, Particulas, Progresso, ProgressoElemento } from "./tipos";

/*******************************************************************************
 * progressoInicial
 * funcao: progresso vazio de quem acabou de comecar o jogo.
 * recebe: nada. retorna: um Progresso novo.
 ******************************************************************************/
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

/*******************************************************************************
 * isotoposNecessarios
 * funcao: quantos isotopos registrados a estrela 2 pede.
 * recebe: z (numero atomico).
 * retorna: 2, ou 1 se o catalogo do elemento tiver um isotopo so.
 ******************************************************************************/
export function isotoposNecessarios(z: number): number {
  const total = elementoPorZ(z)?.isotopos.length ?? 0;
  return Math.max(1, Math.min(2, total));
}

/*******************************************************************************
 * construir
 * funcao: aplica uma montagem ao progresso: classifica, registra isotopo e
 * ion, descobre o elemento e da estrelas.
 * recebe: estado (Progresso atual) e p (Particulas montadas).
 * retorna: { estado, classificacao, eventos }; se nada mudou, o estado e o
 * mesmo objeto de antes.
 ******************************************************************************/
export function construir(
  estado: Progresso,
  p: Particulas,
): { estado: Progresso; classificacao: Classificacao; eventos: Evento[] } {
  const classificacao = classificar(p);
  const eventos: Evento[] = [];
  // montagem invalida nao mexe no progresso
  if (!classificacao.valido || !classificacao.elemento) return { estado, classificacao, eventos };

  const { z, a, carga } = classificacao;
  const chave = String(z);
  const anterior = estado.elementos[chave];
  // copia o registro do elemento para nao alterar o estado antigo
  const atual: ProgressoElemento = anterior
    ? { estrelas: [...anterior.estrelas], isotopos: [...anterior.isotopos], ions: [...anterior.ions] }
    : { estrelas: [false, false, false], isotopos: [], ions: [] };

  // REG-08: registro de variantes (RF-02: vale mesmo antes da descoberta).
  // isotopo so conta se estiver no catalogo
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

  // RF-01: descoberta so com atomo neutro
  if (classificacao.especie === "atomo_neutro" && !atual.estrelas[0]) {
    atual.estrelas[0] = true;
    eventos.push({ tipo: "ELEMENTO_DESCOBERTO", z });
    eventos.push({ tipo: "ESTRELA_GANHA", z, estrela: 1 });
  }
  // estrelas 2 (isotopos) e 3 (ion) so depois de descobrir o elemento
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

  // nada novo: devolve o mesmo estado para a tela nao salvar a toa
  if (eventos.length === 0) return { estado, classificacao, eventos };
  return {
    estado: { ...estado, elementos: { ...estado.elementos, [chave]: atual } },
    classificacao,
    eventos,
  };
}

/*******************************************************************************
 * descoberto
 * funcao: diz se o elemento ja foi descoberto (estrela 1).
 * recebe: estado (Progresso) e z (numero atomico). retorna: boolean.
 ******************************************************************************/
export function descoberto(estado: Progresso, z: number): boolean {
  return estado.elementos[String(z)]?.estrelas[0] === true;
}

/*******************************************************************************
 * dominado
 * funcao: diz se o elemento ja tem as 3 estrelas.
 * recebe: estado (Progresso) e z (numero atomico). retorna: boolean.
 ******************************************************************************/
export function dominado(estado: Progresso, z: number): boolean {
  const e = estado.elementos[String(z)];
  return !!e && e.estrelas.every(Boolean);
}

/*******************************************************************************
 * contarTotais
 * funcao: conta elementos descobertos e estrelas ganhas no jogo todo.
 * recebe: estado (Progresso).
 * retorna: { elementos, estrelas }. so entram elementos descobertos.
 ******************************************************************************/
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
