/*******************************************************************************
 * missoes.ts
 * funcao principal: cria as missoes de cada elemento (M1 descobrir, M2
 * isotopo, M3 ion), escolhe a proxima missao sugerida, acha o proximo
 * elemento com missao pendente e confere se uma montagem cumpre a missao,
 * com a mensagem que o jogador ve.
 ******************************************************************************/
import { ELEMENTOS, artigoDoElemento, elementoPorZ } from "./dados";
import { Z_MAX, notacaoIon } from "./classificar";
import { gerarDicas } from "./dicas";
import { descoberto, isotoposNecessarios } from "./progresso";
import type { Classificacao, Missao, Progresso } from "./tipos";

/*******************************************************************************
 * pistaGerada
 * funcao: texto da pista de nivel 1 da missao de descoberta. varia com a
 * dificuldade do elemento (ver dicas.ts).
 * recebe: z (numero atomico).
 * retorna: o texto da pista, ou "" se o Z nao existir.
 ******************************************************************************/
export function pistaGerada(z: number): string {
  return gerarDicas(z)[0]?.texto ?? "";
}

/*******************************************************************************
 * missaoDescoberta
 * funcao: monta a missao M1, de descobrir o elemento montando o atomo neutro.
 * recebe: z (numero atomico).
 * retorna: a Missao, com a pista no enunciado e as 4 dicas.
 ******************************************************************************/
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

// escreve a carga com sinal: +2, -1
const sinal = (q: number) => (q > 0 ? `+${q}` : `${q}`);

/*******************************************************************************
 * missaoIsotopo
 * funcao: monta a missao M2, de montar um isotopo do catalogo que o jogador
 * ainda nao registrou. prefere os mais abundantes. o enunciado diz quantos
 * isotopos ainda faltam para a estrela 2 (a descoberta so conta se o nucleo
 * montado estava no catalogo).
 * recebe: estado (Progresso) e z (numero atomico).
 * retorna: a Missao, ou null se todos os isotopos ja foram feitos.
 ******************************************************************************/
export function missaoIsotopo(estado: Progresso, z: number): Missao | null {
  const el = elementoPorZ(z);
  if (!el) return null;
  const feitos = estado.elementos[String(z)]?.isotopos ?? [];
  // ordena por abundancia (sem abundancia vai para o fim) e pega o primeiro
  const alvo = [...el.isotopos]
    .filter((i) => !feitos.includes(i.a))
    .sort((x, y) => (y.abundancia_pct ?? -1) - (x.abundancia_pct ?? -1))[0];
  if (!alvo) return null;
  // neutrons que o jogador precisa colocar
  const n = alvo.a - z;
  // quantos isotopos registrados ainda faltam para a estrela 2
  const faltam = Math.max(1, isotoposNecessarios(z) - feitos.length);
  return {
    id: `M2-${z}-${alvo.a}`,
    tipo: "M2",
    z,
    enunciado: `Monte o isótopo ${el.nome}-${alvo.a}: o mesmo elemento, mas com número de massa ${alvo.a}. ${faltam === 1 ? "Falta 1 isótopo do catálogo" : `Faltam ${faltam} isótopos do catálogo`} para a estrela 2.`,
    dicas: [
      "Isótopos de um mesmo elemento têm o mesmo número de prótons. O que muda é a quantidade de nêutrons.",
      `Número de massa = prótons + nêutrons. Aqui: ${alvo.a} − ${z} prótons = ? nêutrons.`,
      `Use ${z} ${z === 1 ? "próton" : "prótons"} e ${n} ${n === 1 ? "nêutron" : "nêutrons"}.`,
    ],
    criterio: { tipo: "ISOTOPO", z, a: alvo.a, n },
  };
}

/*******************************************************************************
 * missaoIon
 * funcao: monta a missao M3, de transformar o elemento em ion. pede a
 * primeira carga comum que o jogador ainda nao fez.
 * recebe: estado (Progresso) e z (numero atomico).
 * retorna: a Missao; se nao sobrar carga comum, uma missao que aceita
 * qualquer carga diferente de zero. null se o Z nao existir.
 ******************************************************************************/
export function missaoIon(estado: Progresso, z: number): Missao | null {
  const el = elementoPorZ(z);
  if (!el) return null;
  const feitos = estado.elementos[String(z)]?.ions ?? [];
  const q = el.ions_comuns.find((c) => !feitos.includes(c));
  // sem carga comum pendente: missao generica, sem carga no criterio
  if (q === undefined) {
    return {
      id: `M3-${z}`,
      tipo: "M3",
      z,
      enunciado: `Transforme ${artigoDoElemento(el.nome)} ${el.nome.toLowerCase()} em um íon: mude a quantidade de elétrons para a carga deixar de ser zero.`,
      dicas: [
        "Carga = prótons − elétrons. Um átomo neutro tem a mesma quantidade dos dois.",
        "Tire um elétron (carga +1) ou ponha um a mais (carga −1).",
        `Com ${z} ${z === 1 ? "próton" : "prótons"}, tente ${Math.max(0, z - 1)} ${Math.max(0, z - 1) === 1 ? "elétron" : "elétrons"}.`,
      ],
      criterio: { tipo: "ION", z },
    };
  }
  // carga positiva quer dizer que o atomo perdeu eletrons
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

/*******************************************************************************
 * missaoParaElemento
 * funcao: escolhe a missao do elemento na ordem descobrir (M1), isotopo
 * (M2) e ion (M3), conforme as estrelas que faltam.
 * recebe: estado (Progresso) e z (numero atomico).
 * retorna: a Missao, ou null quando as 3 estrelas ja foram ganhas.
 ******************************************************************************/
export function missaoParaElemento(estado: Progresso, z: number): Missao | null {
  if (!descoberto(estado, z)) return missaoDescoberta(z);
  const est = estado.elementos[String(z)]?.estrelas ?? [false, false, false];
  // se nao sobrar isotopo para pedir, cai para a missao de ion
  if (!est[1]) {
    const m = missaoIsotopo(estado, z);
    if (m) return m;
  }
  if (!est[2]) return missaoIon(estado, z);
  return null;
}

/*******************************************************************************
 * proximoElemento
 * funcao: acha o proximo elemento que ainda tem missao pendente, para o
 * botao PROXIMA MISSAO do laboratorio. procura de zAtual + 1 ate 118 e
 * depois volta do 1 ate zAtual - 1; nunca devolve o proprio zAtual.
 * recebe: estado (Progresso) e zAtual (numero atomico de onde partir).
 * retorna: o Z encontrado, ou null se nenhum outro elemento tiver missao
 * (todos com 3 estrelas, exceto talvez o proprio zAtual).
 ******************************************************************************/
export function proximoElemento(estado: Progresso, zAtual: number): number | null {
  // da a volta na tabela: i = 1 e o vizinho seguinte, i = Z_MAX - 1 e o anterior
  for (let i = 1; i < Z_MAX; i++) {
    const z = ((zAtual - 1 + i) % Z_MAX) + 1;
    if (missaoParaElemento(estado, z) !== null) return z;
  }
  return null;
}

/*******************************************************************************
 * elementoSugerido
 * funcao: elemento para abrir o laboratorio quando a url nao diz qual: o
 * sugerido por gerarMissao (descoberta pendente, Trilha essencial primeiro)
 * ou, se tudo ja foi descoberto, o primeiro com estrela faltando.
 * recebe: estado (Progresso).
 * retorna: o Z, ou null se o jogo estiver completo.
 ******************************************************************************/
export function elementoSugerido(estado: Progresso): number | null {
  const m = gerarMissao(estado, 0);
  if (m) return m.z;
  return ELEMENTOS.find((el) => missaoParaElemento(estado, el.z) !== null)?.z ?? null;
}

/*******************************************************************************
 * gerarMissao
 * funcao: sugere a proxima missao de descoberta: Trilha essencial primeiro,
 * depois o resto, sempre em ordem crescente de Z.
 * recebe: estado (Progresso) e _semente (nao usada hoje).
 * retorna: a Missao M1, ou null se tudo ja foi descoberto.
 ******************************************************************************/
export function gerarMissao(estado: Progresso, _semente: number): Missao | null {
  const pendentes = ELEMENTOS.filter((el) => !descoberto(estado, el.z));
  const alvo = pendentes.find((el) => el.trilha_essencial) ?? pendentes[0];
  return alvo ? missaoDescoberta(alvo.z) : null;
}

/*******************************************************************************
 * avaliarMissao
 * funcao: confere se a montagem cumpre a missao e escreve a resposta para
 * o jogador (acerto ou o que ajustar).
 * recebe: m (Missao) e c (Classificacao da montagem).
 * retorna: { cumprida, mensagem }; mensagem vazia se a montagem for invalida.
 ******************************************************************************/
export function avaliarMissao(m: Missao, c: Classificacao): { cumprida: boolean; mensagem: string } {
  if (!c.valido || !c.elemento) return { cumprida: false, mensagem: "" };
  const el = elementoPorZ(m.z);
  const nome = el?.nome ?? "";
  // "o" ou "a" antes do nome do elemento da missao
  const art = artigoDoElemento(nome);
  // M2: precisa ser o mesmo elemento com o numero de massa pedido
  if (m.criterio.tipo === "ISOTOPO") {
    if (c.z !== m.z) return { cumprida: false, mensagem: `Isso é ${c.elemento.nome}. Este desafio é com ${art} ${nome.toLowerCase()} (${m.z} prótons).` };
    if (c.a === m.criterio.a) return { cumprida: true, mensagem: `Desafio cumprido! Você montou ${art} ${nome}-${c.a}: mesmo elemento, massa diferente.` };
    return { cumprida: false, mensagem: `Isso é ${nome}-${c.a}. O alvo tem número de massa ${m.criterio.a}: confira os nêutrons.` };
  }
  // M3: qualquer carga diferente de zero, ou a carga exata quando a missao pede uma
  if (m.criterio.tipo === "ION") {
    if (c.z !== m.z) return { cumprida: false, mensagem: `Isso é ${c.elemento.nome}. Este desafio é com ${art} ${nome.toLowerCase()} (${m.z} prótons).` };
    const alvoQ = m.criterio.carga;
    if (c.carga !== 0 && (alvoQ === undefined || c.carga === alvoQ)) {
      return { cumprida: true, mensagem: `Desafio cumprido! ${c.notacao ?? "Íon"}: elétrons mudam a carga, não o elemento.` };
    }
    if (c.carga === 0) return { cumprida: false, mensagem: "Átomo neutro, com carga 0. Mude a quantidade de elétrons." };
    return { cumprida: false, mensagem: `A carga agora é ${sinal(c.carga)}, mas o alvo é ${sinal(alvoQ ?? 0)}. Ajuste os elétrons.` };
  }
  // M1: o elemento certo e neutro
  const cumprida = c.z === m.z && c.especie === "atomo_neutro";
  if (cumprida) return { cumprida, mensagem: `Isso! Você descobriu ${art} ${c.elemento.nome}!` };
  if (c.z === m.z) {
    return {
      cumprida,
      mensagem: `Isso é um íon de ${c.elemento.nome.toLowerCase()}. Monte o átomo neutro para descobrir o elemento.`,
    };
  }
  // elemento errado: diz se o alvo tem mais ou menos protons
  const direcao = m.z > c.z ? "mais" : "menos";
  return {
    cumprida,
    mensagem: `Isso é ${c.elemento.nome}, com ${c.z} ${c.z === 1 ? "próton" : "prótons"}. A pista aponta para um elemento com ${direcao} prótons.`,
  };
}
