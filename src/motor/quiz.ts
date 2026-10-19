import type { Categoria, Progresso } from "./tipos";

// Perguntas fáceis de propósito: o quiz serve para o jogador se sentir bem lembrando o que acabou de ver,
// e não para pegá-lo de surpresa. Cada pergunta tem 3 opções e uma explicação curta e gentil.

export type IdQuiz = "geral" | Categoria;

export type Pergunta = {
  id: string;
  quiz: IdQuiz;
  enunciado: string;
  /** A primeira opção é SEMPRE a correta aqui; o jogo embaralha na hora de mostrar. */
  opcoes: [string, string, string];
  explicacao: string;
};

const q = (quiz: IdQuiz, n: number, enunciado: string, opcoes: [string, string, string], explicacao: string): Pergunta => ({
  id: `${quiz}-${n}`,
  quiz,
  enunciado,
  opcoes,
  explicacao,
});

export const PERGUNTAS: Pergunta[] = [
  // ───────── Geral ─────────
  q("geral", 1, "Qual partícula do átomo tem carga elétrica positiva?", ["Próton", "Nêutron", "Elétron"], "O próton é positivo (+1), o elétron é negativo (−1) e o nêutron não tem carga."),
  q("geral", 2, "O que define qual é o elemento químico?", ["O número de prótons", "O número de elétrons", "A cor do átomo"], "É o número de prótons (Z). Mudou os prótons, mudou o elemento."),
  q("geral", 3, "Átomos do mesmo elemento com números diferentes de nêutrons são chamados de…", ["Isótopos", "Íons", "Moléculas"], "Isótopos têm os mesmos prótons e nêutrons diferentes, então massas diferentes."),
  q("geral", 4, "Um átomo que ganha ou perde elétrons vira um…", ["Íon", "Isótopo", "Novo elemento"], "Ganhar ou perder elétrons muda só a carga. O átomo continua sendo o mesmo elemento."),
  q("geral", 5, "Onde ficam os prótons e os nêutrons?", ["No núcleo", "Nas camadas de fora", "Soltos fora do átomo"], "Os dois ficam juntinhos no núcleo, no centro do átomo."),
  q("geral", 6, "Qual é a carga elétrica de um nêutron?", ["Zero: ele é neutro", "Positiva", "Negativa"], "O nome já diz: nêutron é neutro."),
  q("geral", 7, "Um átomo neutro tem 8 prótons. Quantos elétrons ele tem?", ["8", "16", "0"], "No átomo neutro, prótons e elétrons são em número igual, então as cargas se cancelam."),
  q("geral", 8, "O carbono-14 tem 6 prótons. Quantos nêutrons ele tem?", ["8", "6", "14"], "O número de massa é prótons + nêutrons: 14 − 6 = 8 nêutrons."),
  q("geral", 9, "Um cátion é um íon com carga…", ["Positiva", "Negativa", "Zero"], "Cátion perdeu elétrons, então sobraram mais prótons (positivos)."),
  q("geral", 10, "Na tabela periódica, as linhas horizontais são chamadas de…", ["Períodos", "Grupos", "Camadas"], "Linhas são períodos (de 1 a 7). As colunas são os grupos ou famílias."),
  q("geral", 11, "Elementos da mesma coluna da tabela costumam ter…", ["Propriedades parecidas", "A mesma massa", "O mesmo número de prótons"], "Quem está na mesma família se comporta de jeito parecido."),
  q("geral", 12, "Qual elemento tem apenas 1 próton?", ["Hidrogênio", "Hélio", "Carbono"], "Z = 1 é o hidrogênio, o primeiro da tabela."),
  q("geral", 13, "Qual gás faz os balões de festa flutuarem?", ["Hélio", "Oxigênio", "Cloro"], "O hélio é bem mais leve que o ar."),
  q("geral", 14, "Quantos elementos químicos conhecemos hoje?", ["118", "50", "1.000"], "A tabela periódica tem 118 elementos, e você está descobrindo todos."),
  q("geral", 15, "Um átomo tem 11 prótons e 10 elétrons. Ele é um…", ["Cátion", "Ânion", "Átomo neutro"], "Tem mais prótons que elétrons, então a carga é +1: é um cátion."),
  q("geral", 16, "O carbono-12 e o carbono-14 são diferentes em quê?", ["Número de nêutrons", "Número de prótons", "Número de elétrons"], "Os dois são carbono (6 prótons). Só mudam os nêutrons, então são isótopos."),
  q("geral", 17, "Qual destas partículas é a mais leve?", ["Elétron", "Próton", "Nêutron"], "O elétron é cerca de 1.800 vezes mais leve que o próton."),
  q("geral", 18, "No jogo, as 3 estrelas de cada elemento são: átomo neutro, isótopo e…", ["Íon", "Molécula", "Camada"], "Átomo neutro (descobrir), isótopo (muda o nêutron) e íon (muda o elétron)."),

  // ───────── Metais alcalinos ─────────
  q("metal_alcalino", 1, "Qual destes metais está nas baterias de celular?", ["Lítio", "Chumbo", "Cobre"], "O lítio é o queridinho das baterias recarregáveis."),
  q("metal_alcalino", 2, "O sódio, junto com o cloro, forma o quê?", ["Sal de cozinha", "Açúcar", "Vinagre"], "Sal de cozinha é cloreto de sódio (NaCl)."),
  q("metal_alcalino", 3, "Como os metais alcalinos reagem com a água?", ["De forma muito forte", "Não reagem", "Só se ela estiver gelada"], "Por isso o sódio e o potássio são guardados em óleo, longe da água."),
  q("metal_alcalino", 4, "Em qual grupo da tabela ficam os metais alcalinos?", ["Grupo 1", "Grupo 17", "Grupo 18"], "Os alcalinos formam a primeira coluna, na ponta esquerda."),
  q("metal_alcalino", 5, "O sódio é tão mole que dá para cortar com…", ["Uma faca comum", "Uma serra elétrica", "Um maçarico"], "Ele é macio como manteiga fria."),

  // ───────── Alcalino-terrosos ─────────
  q("metal_alcalino_terroso", 1, "Qual elemento ajuda a formar ossos e dentes?", ["Cálcio", "Neônio", "Ouro"], "O cálcio é o mineral mais abundante do corpo."),
  q("metal_alcalino_terroso", 2, "Em qual grupo ficam os alcalino-terrosos?", ["Grupo 2", "Grupo 1", "Grupo 17"], "Eles ficam logo ao lado dos alcalinos, no grupo 2."),
  q("metal_alcalino_terroso", 3, "Qual deles queima com uma luz branca bem forte, usada em flashes antigos?", ["Magnésio", "Cobre", "Cloro"], "O magnésio queima com uma luz brilhante."),
  q("metal_alcalino_terroso", 4, "Qual deles dá cor vermelha aos fogos de artifício?", ["Estrôncio", "Hélio", "Oxigênio"], "Cada elemento dá uma cor ao fogo, e o estrôncio dá o vermelho."),
  q("metal_alcalino_terroso", 5, "Os alcalino-terrosos tendem a formar íons com carga…", ["+2", "+1", "−1"], "Eles perdem 2 elétrons, então ficam com carga +2."),

  // ───────── Metais de transição ─────────
  q("metal_transicao", 1, "Qual metal está no seu sangue e ajuda a levar oxigênio pelo corpo?", ["Ferro", "Sódio", "Cálcio"], "O ferro faz parte da hemoglobina, que carrega oxigênio."),
  q("metal_transicao", 2, "Qual metal é usado nos fios elétricos?", ["Cobre", "Hélio", "Enxofre"], "O cobre conduz muito bem a eletricidade."),
  q("metal_transicao", 3, "Qual metal é líquido na temperatura ambiente?", ["Mercúrio", "Ferro", "Ouro"], "O mercúrio é o único metal líquido por aí, nas condições do dia a dia."),
  q("metal_transicao", 4, "Qual metal não enferruja e é muito usado em joias?", ["Ouro", "Ferro", "Sódio"], "O ouro quase não reage, por isso brilha por milhares de anos."),
  q("metal_transicao", 5, "Onde ficam os metais de transição na tabela?", ["No bloco do meio", "Só na ponta esquerda", "Na última coluna"], "Eles formam o grande bloco central, dos grupos 3 a 12."),

  // ───────── Metais representativos ─────────
  q("metal_representativo", 1, "As latinhas de refrigerante são feitas de qual metal?", ["Alumínio", "Ouro", "Mercúrio"], "O alumínio é leve e fácil de reciclar."),
  q("metal_representativo", 2, "Qual destes metais derrete na palma da mão?", ["Gálio", "Ferro", "Cobre"], "O gálio funde a cerca de 30 °C, quase a temperatura da mão."),
  q("metal_representativo", 3, "O chumbo é conhecido por ser…", ["Muito pesado", "Muito leve", "Um gás"], "O chumbo é bem denso, por isso pesa muito para o tamanho."),
  q("metal_representativo", 4, "O estanho é usado para cobrir as latas de…", ["Conserva", "Tinta", "Perfume"], "Ele protege o aço da ferrugem."),
  q("metal_representativo", 5, "O alumínio pode ser reciclado…", ["Várias vezes", "Só uma vez", "Nunca"], "Reciclar alumínio gasta bem menos energia do que fazê-lo do zero."),

  // ───────── Semimetais ─────────
  q("semimetal", 1, "Qual semimetal é a base dos chips de computador?", ["Silício", "Mercúrio", "Sódio"], "O silício é o coração da eletrônica."),
  q("semimetal", 2, "Os semimetais conduzem eletricidade…", ["Mais ou menos", "Perfeitamente", "Nada"], "Esse meio-termo é justamente o que os torna úteis nos chips."),
  q("semimetal", 3, "A areia da praia é feita principalmente de silício e…", ["Oxigênio", "Cloro", "Ferro"], "Silício com oxigênio forma a sílica, o principal ingrediente da areia."),
  q("semimetal", 4, "Onde os semimetais ficam na tabela?", ["Na fronteira entre metais e não metais", "No último grupo", "No bloco central"], "Eles formam uma escadinha entre os metais e os não metais."),
  q("semimetal", 5, "O silício também é usado em…", ["Painéis solares", "Balões de festa", "Sal de cozinha"], "Os painéis solares transformam luz em eletricidade usando silício."),

  // ───────── Não metais ─────────
  q("nao_metal", 1, "Qual é o elemento mais abundante do universo?", ["Hidrogênio", "Ouro", "Ferro"], "O hidrogênio é o mais simples, e também o mais comum."),
  q("nao_metal", 2, "Qual não metal a gente respira para viver?", ["Oxigênio", "Hélio", "Cloro"], "Respiramos o oxigênio do ar para produzir energia."),
  q("nao_metal", 3, "O diamante e o grafite do lápis são feitos de…", ["Carbono", "Ferro", "Cálcio"], "São o mesmo elemento com os átomos arrumados de jeitos diferentes."),
  q("nao_metal", 4, "Os não metais, em geral, conduzem eletricidade…", ["Mal", "Muito bem", "Só quando molhados"], "Isso é o contrário dos metais, que conduzem muito bem."),
  q("nao_metal", 5, "Quantos prótons tem o carbono?", ["6", "12", "1"], "O carbono é o elemento de número atômico 6."),

  // ───────── Halogênios ─────────
  q("halogenio", 1, "Qual halogênio ajuda a deixar a água segura para beber?", ["Cloro", "Hélio", "Ouro"], "O cloro elimina micróbios da água da torneira e da piscina."),
  q("halogenio", 2, "Qual halogênio é adicionado ao sal de cozinha?", ["Iodo", "Neônio", "Cálcio"], "O iodo no sal ajuda a tireoide a funcionar bem."),
  q("halogenio", 3, "Qual halogênio está em muitas pastas de dente?", ["Flúor", "Ferro", "Hélio"], "O flúor ajuda a proteger o esmalte dos dentes."),
  q("halogenio", 4, "Em qual grupo da tabela ficam os halogênios?", ["Grupo 17", "Grupo 1", "Grupo 18"], "Eles formam a penúltima coluna, ao lado dos gases nobres."),
  q("halogenio", 5, "Os halogênios tendem a ganhar quantos elétrons?", ["1", "3", "0"], "Ganhando 1 elétron, viram ânions com carga −1."),

  // ───────── Gases nobres ─────────
  q("gas_nobre", 1, "Qual gás nobre faz os balões de festa flutuarem?", ["Hélio", "Argônio", "Radônio"], "O hélio é bem mais leve que o ar e não pega fogo."),
  q("gas_nobre", 2, "Qual gás nobre brilha nas placas luminosas?", ["Neônio", "Cloro", "Oxigênio"], "O neônio brilha em vermelho-alaranjado quando passa eletricidade."),
  q("gas_nobre", 3, "Por que se chamam gases “nobres”?", ["Quase não se misturam com nada", "São muito caros", "Brilham o tempo todo"], "Como os nobres de antigamente, ficam na deles."),
  q("gas_nobre", 4, "Em qual grupo ficam os gases nobres?", ["Grupo 18", "Grupo 1", "Grupo 17"], "Eles formam a última coluna da tabela."),
  q("gas_nobre", 5, "O que o gás hélio faz com a sua voz?", ["Deixa fininha", "Deixa mais grossa", "Faz sumir"], "O som viaja mais rápido no hélio, então a voz sai aguda."),

  // ───────── Lantanídeos ─────────
  q("lantanideo", 1, "Onde os lantanídeos aparecem desenhados na tabela?", ["Numa linha separada, embaixo", "No topo", "Dentro do grupo 1"], "Eles ficam numa linha à parte só para a tabela caber na página."),
  q("lantanideo", 2, "Os ímãs mais fortes que existem usam qual lantanídeo?", ["Neodímio", "Sódio", "Cloro"], "Os ímãs de neodímio são pequenininhos e muito fortes."),
  q("lantanideo", 3, "Outro nome dos lantanídeos é…", ["Terras raras", "Gases nobres", "Halogênios"], "O nome engana: eles não são tão raros, só difíceis de separar."),
  q("lantanideo", 4, "Quantos lantanídeos existem?", ["15", "6", "38"], "São 15, do lantânio (57) ao lutécio (71)."),
  q("lantanideo", 5, "Vários lantanídeos dão cor às…", ["Telas de TV e celular", "Panelas", "Nuvens"], "Pequenas quantidades deles criam as cores que você vê nas telas."),

  // ───────── Actinídeos ─────────
  q("actinideo", 1, "Qual actinídeo é usado em usinas nucleares?", ["Urânio", "Cobre", "Neônio"], "O urânio é o combustível mais conhecido das usinas nucleares."),
  q("actinideo", 2, "Os actinídeos são…", ["Radioativos", "Líquidos", "Gases"], "Todos eles são radioativos."),
  q("actinideo", 3, "O amerício está dentro de…", ["Detectores de fumaça", "Panelas", "Balões"], "Uma quantidade minúscula de amerício ajuda a detectar a fumaça."),
  q("actinideo", 4, "Quantos actinídeos existem?", ["15", "6", "38"], "São 15, do actínio (89) ao laurêncio (103)."),
  q("actinideo", 5, "Muitos actinídeos só existem porque…", ["Cientistas os criam em laboratório", "Crescem nas plantas", "Vêm do fundo do mar"], "Os mais pesados são feitos em aceleradores de partículas."),
];

export const TAMANHO_GERAL = 8;

export function perguntasDoQuiz(quiz: IdQuiz): Pergunta[] {
  return PERGUNTAS.filter((p) => p.quiz === quiz);
}

/** Gerador pseudoaleatório simples (para os testes poderem fixar a semente). */
export function rng(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function embaralhar<T>(lista: readonly T[], r: () => number = Math.random): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Pergunta pronta para mostrar: opções embaralhadas e o índice da certa. */
export type PerguntaPronta = { id: string; enunciado: string; opcoes: string[]; correta: number; explicacao: string };

export function prepararPergunta(p: Pergunta, r: () => number = Math.random): PerguntaPronta {
  const certa = p.opcoes[0];
  const opcoes = embaralhar(p.opcoes, r);
  return { id: p.id, enunciado: p.enunciado, opcoes, correta: opcoes.indexOf(certa), explicacao: p.explicacao };
}

/** Monta uma rodada: o quiz da família (todas as perguntas, em ordem aleatória) ou 8 do geral. */
export function montarRodada(quiz: IdQuiz, r: () => number = Math.random): PerguntaPronta[] {
  const base = embaralhar(perguntasDoQuiz(quiz), r);
  const escolhidas = quiz === "geral" ? base.slice(0, TAMANHO_GERAL) : base;
  return escolhidas.map((p) => prepararPergunta(p, r));
}

/** Selo de 1 a 3 estrelas: terminar já vale 1; 60% ou mais vale 2; acertar tudo vale 3. */
export type Selo = 1 | 2 | 3;

export function seloDoResultado(acertos: number, total: number): Selo {
  if (total > 0 && acertos === total) return 3;
  if (total > 0 && acertos / total >= 0.6) return 2;
  return 1;
}

const marcaSelo = (quiz: IdQuiz, s: Selo) => `quiz:${quiz}:${s}`;

/** Melhor selo já conquistado em um quiz (0 se nunca fez). */
export function seloConquistado(estado: Progresso, quiz: IdQuiz): 0 | Selo {
  for (const s of [3, 2, 1] as const) if (estado.conquistas.includes(marcaSelo(quiz, s))) return s;
  return 0;
}

export function registrarQuiz(estado: Progresso, quiz: IdQuiz, acertos: number, total: number): { estado: Progresso; selo: Selo; novoRecorde: boolean } {
  const selo = seloDoResultado(acertos, total);
  const antes = seloConquistado(estado, quiz);
  const conquistas = selo > antes ? [...estado.conquistas.filter((c) => !c.startsWith(`quiz:${quiz}:`)), marcaSelo(quiz, selo)] : estado.conquistas;
  const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
  return {
    estado: { ...estado, conquistas, quiz: { ...estado.quiz, rodadas: estado.quiz.rodadas + 1, melhor: Math.max(estado.quiz.melhor, pct) } },
    selo,
    novoRecorde: selo > antes,
  };
}
