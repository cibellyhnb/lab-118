import { ELEMENTOS, elementoPorZ } from "./dados";
import { notacaoIon } from "./classificar";
import { gerarDicas } from "./dicas";
import { descoberto } from "./progresso";
import type { Classificacao, Missao, Progresso } from "./tipos";

/** Pista de nível 1 da missão: autoral nos fáceis, descritiva nos médios e direta nos difíceis (ver dicas.ts). */
export function pistaGerada(z: number): string {
  return gerarDicas(z)[0]?.texto ?? "";
}

/** Missão M1 (descoberta). Nesta entrega só M1 está implementada. */
export function missaoDescoberta(z: number): Missao {
  const dicas = gerarDicas(z);
  const pista = dicas[0]?.texto ?? "";
  return {
    id: `M1-${z}`,
    tipo: "M1",
    z,
    enunciado: `Descubra o elemento: ${pista}`,
    dicas: dicas.map((d) => d.texto),
    criterio: { tipo: "DESCOBRIR", z },
  };
}

const sinal = (q: number) => (q > 0 ? `+${q}` : `${q}`);

/** M2: monte um isótopo do catálogo que o jogador ainda não registrou (prefere os mais abundantes). */
export function missaoIsotopo(estado: Progresso, z: number): Missao | null {
  const el = elementoPorZ(z);
  if (!el) return null;
  const feitos = estado.elementos[String(z)]?.isotopos ?? [];
  const alvo = [...el.isotopos]
    .filter((i) => !feitos.includes(i.a))
    .sort((x, y) => (y.abundancia_pct ?? -1) - (x.abundancia_pct ?? -1))[0];
  if (!alvo) return null;
  const n = alvo.a - z;
  return {
    id: `M2-${z}-${alvo.a}`,
    tipo: "M2",
    z,
    enunciado: `Monte o isótopo ${el.nome}-${alvo.a}: o mesmo elemento, mas com número de massa ${alvo.a}.`,
    dicas: [
      "Isótopos de um mesmo elemento têm o mesmo número de prótons. O que muda é a quantidade de nêutrons.",
      `Número de massa = prótons + nêutrons. Aqui: ${alvo.a} − ${z} prótons = ? nêutrons.`,
      `Use ${z} ${z === 1 ? "próton" : "prótons"} e ${n} ${n === 1 ? "nêutron" : "nêutrons"}.`,
    ],
    criterio: { tipo: "ISOTOPO", z, a: alvo.a, n },
  };
}

/** M3: transforme o elemento em um íon (carga comum do elemento, se houver). */
export function missaoIon(estado: Progresso, z: number): Missao | null {
  const el = elementoPorZ(z);
  if (!el) return null;
  const feitos = estado.elementos[String(z)]?.ions ?? [];
  const q = el.ions_comuns.find((c) => !feitos.includes(c));
  if (q === undefined) {
    return {
      id: `M3-${z}`,
      tipo: "M3",
      z,
      enunciado: `Transforme o ${el.nome.toLowerCase()} em um íon: mude a quantidade de elétrons para a carga deixar de ser zero.`,
      dicas: [
        "Carga = prótons − elétrons. Um átomo neutro tem a mesma quantidade dos dois.",
        "Tire um elétron (carga +1) ou ponha um a mais (carga −1).",
        `Com ${z} ${z === 1 ? "próton" : "prótons"}, tente ${Math.max(0, z - 1)} elétrons.`,
      ],
      criterio: { tipo: "ION", z },
    };
  }
  const perdeu = q > 0;
  const mod = Math.abs(q);
  return {
    id: `M3-${z}-${q}`,
    tipo: "M3",
    z,
    enunciado: `Monte o íon ${notacaoIon(el.simbolo, q)}: um átomo de ${el.nome.toLowerCase()} com carga ${sinal(q)}.`,
    dicas: [
      "Carga = prótons − elétrons. Íons positivos (cátions) têm menos elétrons que prótons; negativos (ânions), mais.",
      `Carga ${sinal(q)}: o átomo precisa ter ${mod} ${mod === 1 ? "elétron" : "elétrons"} a ${perdeu ? "menos" : "mais"} que prótons.`,
      `Use ${z} ${z === 1 ? "próton" : "prótons"} e ${z - q} ${z - q === 1 ? "elétron" : "elétrons"}.`,
    ],
    criterio: { tipo: "ION", z, carga: q },
  };
}

/** Missão do elemento z: descobrir (M1), depois isótopo (M2), depois íon (M3). Nula quando as 3 estrelas já foram ganhas. */
export function missaoParaElemento(estado: Progresso, z: number): Missao | null {
  if (!descoberto(estado, z)) return missaoDescoberta(z);
  const est = estado.elementos[String(z)]?.estrelas ?? [false, false, false];
  if (!est[1]) {
    const m = missaoIsotopo(estado, z);
    if (m) return m;
  }
  if (!est[2]) return missaoIon(estado, z);
  return null;
}

/** Sugere a próxima missão: Trilha essencial primeiro, em ordem crescente de Z. */
export function gerarMissao(estado: Progresso, _semente: number): Missao | null {
  const pendentes = ELEMENTOS.filter((el) => !descoberto(estado, el.z));
  const alvo = pendentes.find((el) => el.trilha_essencial) ?? pendentes[0];
  return alvo ? missaoDescoberta(alvo.z) : null;
}

export function avaliarMissao(m: Missao, c: Classificacao): { cumprida: boolean; mensagem: string } {
  if (!c.valido || !c.elemento) return { cumprida: false, mensagem: "" };
  const el = elementoPorZ(m.z);
  const nome = el?.nome ?? "";
  if (m.criterio.tipo === "ISOTOPO") {
    if (c.z !== m.z) return { cumprida: false, mensagem: `Isso é ${c.elemento.nome}. Esta missão é com o ${nome.toLowerCase()} (${m.z} prótons).` };
    if (c.a === m.criterio.a) return { cumprida: true, mensagem: `Missão cumprida! Você montou o ${nome}-${c.a}: mesmo elemento, massa diferente.` };
    return { cumprida: false, mensagem: `Isso é ${nome}-${c.a}. O alvo tem número de massa ${m.criterio.a}: confira os nêutrons.` };
  }
  if (m.criterio.tipo === "ION") {
    if (c.z !== m.z) return { cumprida: false, mensagem: `Isso é ${c.elemento.nome}. Esta missão é com o ${nome.toLowerCase()} (${m.z} prótons).` };
    const alvoQ = m.criterio.carga;
    if (c.carga !== 0 && (alvoQ === undefined || c.carga === alvoQ)) {
      return { cumprida: true, mensagem: `Missão cumprida! ${c.notacao ?? "Íon"}: elétrons mudam a carga, não o elemento.` };
    }
    if (c.carga === 0) return { cumprida: false, mensagem: "Átomo neutro, com carga 0. Mude a quantidade de elétrons." };
    return { cumprida: false, mensagem: `A carga agora é ${sinal(c.carga)}, mas o alvo é ${sinal(alvoQ ?? 0)}. Ajuste os elétrons.` };
  }
  const cumprida = c.z === m.z && c.especie === "atomo_neutro";
  if (cumprida) return { cumprida, mensagem: `Isso! Você descobriu o ${c.elemento.nome}!` };
  if (c.z === m.z) {
    return {
      cumprida,
      mensagem: `Isso é um íon de ${c.elemento.nome.toLowerCase()}. Monte o átomo neutro para descobrir o elemento.`,
    };
  }
  const direcao = m.z > c.z ? "mais" : "menos";
  return {
    cumprida,
    mensagem: `Isso é ${c.elemento.nome}, com ${c.z} ${c.z === 1 ? "próton" : "prótons"}. A pista aponta para um elemento com ${direcao} prótons.`,
  };
}
