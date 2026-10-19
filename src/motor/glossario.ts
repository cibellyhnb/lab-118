// Glossário do jogo: termos que aparecem nas missões, no painel, nas fichas e na tabela.
// Texto pensado para estudantes do ensino médio: curto, direto e com a dúvida mais comum de cada termo.

export type CategoriaGlossario = "particulas" | "numeros" | "variantes" | "tabela" | "jogo";

export const NOME_CATEGORIA_GLOSSARIO: Record<CategoriaGlossario, string> = {
  particulas: "Partículas e átomo",
  numeros: "Números do painel",
  variantes: "Isótopos e íons",
  tabela: "Tabela periódica",
  jogo: "No jogo",
};

export type TermoGlossario = {
  id: string;
  termo: string;
  /** Sigla ou símbolo usado no painel, se houver (Z, N, A, q...). */
  sigla?: string;
  categoria: CategoriaGlossario;
  definicao: string;
  exemplo?: string;
  /** A confusão mais comum sobre o termo, já respondida. */
  duvida?: string;
  /** ids de termos relacionados. */
  ver?: string[];
  /** outras palavras que o jogador pode procurar (sem acento não precisa: a busca ignora acentos). */
  sinonimos?: string[];
};

export const GLOSSARIO: TermoGlossario[] = [
  // ───────── Partículas e átomo ─────────
  {
    id: "atomo",
    termo: "Átomo",
    categoria: "particulas",
    definicao: "A menor parte de um elemento que ainda mantém as propriedades dele. É feito de um núcleo (prótons e nêutrons) com elétrons ao redor.",
    exemplo: "Um átomo de hidrogênio tem 1 próton no núcleo e 1 elétron em volta.",
    duvida: "O átomo é quase todo espaço vazio: o núcleo é minúsculo perto da região dos elétrons. Nos desenhos do jogo, os tamanhos estão exagerados para dar para ver.",
    ver: ["nucleo", "eletrosfera", "elemento"],
  },
  {
    id: "proton",
    termo: "Próton",
    categoria: "particulas",
    definicao: "Partícula do núcleo com carga elétrica positiva (+1). A quantidade de prótons é o que define qual é o elemento.",
    exemplo: "Todo átomo com 6 prótons é carbono. Com 7 prótons, nunca é carbono: é nitrogênio.",
    duvida: "Mudar a quantidade de prótons troca o elemento. Por isso, no jogo, os prótons são a primeira coisa que você escolhe.",
    ver: ["numero-atomico", "elemento", "nucleo"],
  },
  {
    id: "neutron",
    termo: "Nêutron",
    categoria: "particulas",
    definicao: "Partícula do núcleo sem carga elétrica. Pesa quase o mesmo que um próton, então mexer nos nêutrons muda a massa do átomo, mas não o elemento.",
    exemplo: "Carbono com 6 nêutrons é o carbono-12. Com 8 nêutrons é o carbono-14.",
    duvida: "Sem prótons para segurá-los, nêutrons soltos não formam átomo. Um nêutron sozinho dura só alguns minutos antes de se transformar em outras partículas.",
    ver: ["isotopo", "numero-massa", "nucleo"],
  },
  {
    id: "eletron",
    termo: "Elétron",
    categoria: "particulas",
    definicao: "Partícula muito leve, com carga elétrica negativa (−1), que fica ao redor do núcleo. Ganhar ou perder elétrons muda a carga do átomo, mas não o elemento.",
    exemplo: "O sódio perde 1 elétron e vira Na⁺. Continua sendo sódio.",
    duvida: "A massa de um elétron é cerca de 1/1836 da de um próton. Por isso a massa do átomo vem quase toda do núcleo.",
    ver: ["ion", "carga", "eletrosfera"],
  },
  {
    id: "nucleo",
    termo: "Núcleo",
    categoria: "particulas",
    definicao: "O centro do átomo, onde ficam os prótons e os nêutrons. Concentra quase toda a massa do átomo e tem carga positiva.",
    ver: ["proton", "neutron", "atomo"],
  },
  {
    id: "eletrosfera",
    termo: "Eletrosfera",
    categoria: "particulas",
    definicao: "A região ao redor do núcleo onde os elétrons se movem. Costuma ser desenhada em camadas (órbitas), como no laboratório do jogo.",
    duvida: "Os círculos são um modelo simples. Na realidade os elétrons não andam em trilhos como planetas: ficam em regiões de probabilidade.",
    ver: ["camada", "eletron"],
    sinonimos: ["orbita", "orbital"],
  },
  {
    id: "camada",
    termo: "Camada eletrônica",
    categoria: "particulas",
    definicao: "Cada anel da eletrosfera, com um limite de elétrons. A primeira camada comporta no máximo 2, a segunda 8, a terceira 18 e assim por diante (2n²).",
    exemplo: "O neônio tem 10 elétrons: 2 na primeira camada e 8 na segunda, todas cheias.",
    duvida: "Em geral, o número de camadas de um átomo neutro é igual ao período do elemento na tabela. A última camada é a que participa das ligações.",
    ver: ["periodo", "eletrosfera"],
    sinonimos: ["nivel de energia", "camada de valencia"],
  },
  {
    id: "carga-eletrica",
    termo: "Carga elétrica",
    categoria: "particulas",
    definicao: "Propriedade que faz as partículas se atraírem ou se repelirem. Prótons são positivos, elétrons são negativos e nêutrons não têm carga. Cargas iguais se repelem; opostas se atraem.",
    ver: ["carga", "proton", "eletron"],
  },

  // ───────── Números do painel ─────────
  {
    id: "numero-atomico",
    termo: "Número atômico",
    sigla: "Z",
    categoria: "numeros",
    definicao: "Quantidade de prótons do átomo. É a “identidade” do elemento: cada Z corresponde a um único elemento, e é a ordem em que eles aparecem na tabela.",
    exemplo: "Z = 8 é o oxigênio. Z = 79 é o ouro.",
    duvida: "Z não muda quando o átomo ganha ou perde elétrons, nem quando muda de isótopo.",
    ver: ["proton", "elemento"],
  },
  {
    id: "numero-neutrons",
    termo: "Número de nêutrons",
    sigla: "N",
    categoria: "numeros",
    definicao: "Quantidade de nêutrons no núcleo. Átomos do mesmo elemento podem ter N diferentes: são os isótopos.",
    exemplo: "Carbono-12: N = 6. Carbono-14: N = 8.",
    ver: ["neutron", "isotopo", "numero-massa"],
  },
  {
    id: "numero-eletrons",
    termo: "Número de elétrons",
    sigla: "E",
    categoria: "numeros",
    definicao: "Quantidade de elétrons do átomo. Quando é igual ao número de prótons, o átomo está neutro. Se for diferente, ele é um íon.",
    ver: ["eletron", "atomo-neutro", "ion"],
  },
  {
    id: "numero-massa",
    termo: "Número de massa",
    sigla: "A",
    categoria: "numeros",
    definicao: "Soma de prótons e nêutrons: A = Z + N. É sempre um número inteiro e aparece no nome do isótopo.",
    exemplo: "O carbono-13 tem A = 13: 6 prótons + 7 nêutrons.",
    duvida: "Não confunda com massa atômica. O número de massa é de um átomo específico (inteiro). A massa atômica da tabela é uma média de todos os isótopos naturais (com vírgula).",
    ver: ["massa-atomica", "isotopo"],
  },
  {
    id: "massa-atomica",
    termo: "Massa atômica",
    sigla: "u",
    categoria: "numeros",
    definicao: "Massa média do elemento na natureza, em unidades de massa atômica (u), considerando todos os isótopos e quanto cada um aparece. É o número com vírgula que você vê na tabela periódica.",
    exemplo: "O cloro tem massa atômica ≈ 35,45 u porque na natureza há cerca de 3 átomos de Cl-35 para cada Cl-37.",
    duvida: "Por isso nenhum átomo de cloro “pesa” 35,45: ele é a média ponderada entre os isótopos 35 e 37.",
    ver: ["numero-massa", "abundancia", "unidade-massa"],
    sinonimos: ["peso atomico"],
  },
  {
    id: "unidade-massa",
    termo: "Unidade de massa atômica",
    sigla: "u",
    categoria: "numeros",
    definicao: "A unidade usada para pesar átomos. Vale 1/12 da massa de um átomo de carbono-12, quase a massa de um próton ou de um nêutron.",
    ver: ["massa-atomica"],
    sinonimos: ["uma", "dalton"],
  },
  {
    id: "carga",
    termo: "Carga do átomo",
    sigla: "q",
    categoria: "numeros",
    definicao: "Diferença entre prótons e elétrons: q = prótons − elétrons. Zero significa átomo neutro; positivo, cátion; negativo, ânion.",
    exemplo: "Oxigênio com 8 prótons e 10 elétrons: q = −2 (O²⁻).",
    ver: ["atomo-neutro", "cation", "anion"],
  },
  {
    id: "notacao",
    termo: "Notação",
    categoria: "numeros",
    definicao: "A forma abreviada de escrever um átomo: o símbolo do elemento, com o número de massa à esquerda e a carga à direita. Ex.: ¹³C é o carbono-13, Na⁺ é o íon sódio.",
    exemplo: "No painel do laboratório, “Notação: ¹⁶O²⁻” lê-se: oxigênio-16 com carga −2.",
    ver: ["numero-massa", "carga", "nuclideo"],
    sinonimos: ["simbolo"],
  },

  // ───────── Isótopos e íons ─────────
  {
    id: "elemento",
    termo: "Elemento químico",
    categoria: "variantes",
    definicao: "Conjunto de átomos com o mesmo número de prótons. Hoje são 118 elementos conhecidos, e cada um tem nome, símbolo e posição própria na tabela.",
    exemplo: "Todo átomo com 1 próton é hidrogênio, tenha ou não nêutrons e elétrons.",
    duvida: "“Elemento” e “átomo” não são a mesma coisa: elemento é o tipo (carbono); átomo é uma unidade individual daquele tipo.",
    ver: ["numero-atomico", "atomo"],
  },
  {
    id: "atomo-neutro",
    termo: "Átomo neutro",
    categoria: "variantes",
    definicao: "Átomo com o mesmo número de prótons e de elétrons, então a carga total é zero. É a primeira estrela de cada elemento.",
    exemplo: "6 prótons e 6 elétrons: carbono neutro.",
    ver: ["carga", "ion"],
  },
  {
    id: "isotopo",
    termo: "Isótopo",
    categoria: "variantes",
    definicao: "Átomos do mesmo elemento (mesmo Z) com quantidade diferente de nêutrons, portanto com massas diferentes. É a segunda estrela de cada elemento.",
    exemplo: "O hidrogênio-1, o deutério (H-2) e o trítio (H-3) são isótopos: todos têm 1 próton.",
    duvida: "Isótopos do mesmo elemento têm quase o mesmo comportamento químico. O que muda é a massa e, às vezes, a estabilidade.",
    ver: ["neutron", "nuclideo", "estavel"],
  },
  {
    id: "nuclideo",
    termo: "Nuclídeo",
    categoria: "variantes",
    definicao: "Um tipo específico de núcleo, definido pelo número de prótons e de nêutrons. É escrito como elemento-A (ou ᴬX). O painel do laboratório mostra o status de cada nuclídeo que você monta.",
    exemplo: "Carbono-14 é um nuclídeo; carbono-12 é outro.",
    ver: ["isotopo", "notacao", "nao-catalogado"],
    sinonimos: ["nuclido"],
  },
  {
    id: "ion",
    termo: "Íon",
    categoria: "variantes",
    definicao: "Átomo com carga elétrica, porque tem mais ou menos elétrons do que prótons. É a terceira estrela de cada elemento.",
    exemplo: "Cl⁻ (cloreto) tem 17 prótons e 18 elétrons.",
    duvida: "Para formar um íon, só os elétrons mudam. Se mudassem os prótons, o elemento seria outro.",
    ver: ["cation", "anion", "carga"],
  },
  {
    id: "cation",
    termo: "Cátion",
    categoria: "variantes",
    definicao: "Íon positivo: perdeu elétrons, então ficou com mais prótons do que elétrons. Os metais costumam formar cátions.",
    exemplo: "Mg²⁺ perdeu 2 elétrons.",
    duvida: "Dica para lembrar: cátion tem a letra “t” de um sinal de mais (+).",
    ver: ["ion", "anion"],
  },
  {
    id: "anion",
    termo: "Ânion",
    categoria: "variantes",
    definicao: "Íon negativo: ganhou elétrons, então ficou com mais elétrons do que prótons. Os não metais costumam formar ânions.",
    exemplo: "O²⁻ ganhou 2 elétrons; F⁻ ganhou 1.",
    ver: ["ion", "cation"],
  },
  {
    id: "estavel",
    termo: "Estável",
    categoria: "variantes",
    definicao: "Núcleo que não se desfaz sozinho: pode durar para sempre. É o status de isótopos como o carbono-12 e o carbono-13.",
    ver: ["radioativo", "isotopo"],
  },
  {
    id: "radioativo",
    termo: "Radioativo",
    categoria: "variantes",
    definicao: "Núcleo instável que, depois de um tempo, se transforma em outro emitindo radiação. Esse processo se chama decaimento.",
    exemplo: "O carbono-14 é radioativo e é usado para datar fósseis e objetos antigos.",
    duvida: "Radioativo não quer dizer perigoso o tempo todo: depende de quanto tempo ele dura e de quanta radiação emite. Alguns elementos, como o tecnécio (Z = 43), o promécio (Z = 61) e todos depois do bismuto (Z > 83), não têm nenhum isótopo estável.",
    ver: ["meia-vida", "estavel"],
    sinonimos: ["instavel", "decaimento"],
  },
  {
    id: "meia-vida",
    termo: "Meia-vida",
    categoria: "variantes",
    definicao: "O tempo necessário para metade dos átomos de uma amostra radioativa se transformar. Quanto menor, mais “efêmero” é o isótopo.",
    exemplo: "A meia-vida do carbono-14 é de cerca de 5.730 anos. Depois desse tempo, sobra metade; depois de outro tanto, um quarto.",
    ver: ["radioativo"],
  },
  {
    id: "abundancia",
    termo: "Abundância natural",
    categoria: "variantes",
    definicao: "A porcentagem com que cada isótopo aparece na natureza. É ela que determina a massa atômica do elemento.",
    exemplo: "No carbono natural, cerca de 99% é C-12 e 1% é C-13.",
    ver: ["massa-atomica", "isotopo"],
  },
  {
    id: "nao-catalogado",
    termo: "Não catalogado",
    categoria: "variantes",
    definicao: "Quando você monta uma combinação de prótons e nêutrons que não está na nossa lista de isótopos. Pode nunca ter sido observada, ou durar frações de segundo.",
    duvida: "Não é erro seu: o jogo deixa você experimentar combinações incomuns, e só avisa que elas não estão no catálogo.",
    ver: ["nuclideo"],
  },

  // ───────── Tabela periódica ─────────
  {
    id: "tabela",
    termo: "Tabela periódica",
    categoria: "tabela",
    definicao: "Organização dos 118 elementos em ordem crescente de número atômico, em linhas (períodos) e colunas (grupos). Elementos da mesma coluna têm comportamento parecido.",
    ver: ["periodo", "grupo"],
  },
  {
    id: "periodo",
    termo: "Período",
    categoria: "tabela",
    definicao: "Cada linha horizontal da tabela, numerada de 1 a 7. O número do período indica, em geral, quantas camadas eletrônicas o átomo neutro tem.",
    exemplo: "O sódio está no período 3: tem 3 camadas de elétrons.",
    ver: ["grupo", "camada"],
  },
  {
    id: "grupo",
    termo: "Grupo (ou família)",
    categoria: "tabela",
    definicao: "Cada coluna vertical da tabela, numerada de 1 a 18. Elementos do mesmo grupo têm propriedades químicas parecidas, porque têm o mesmo número de elétrons na última camada.",
    exemplo: "O grupo 17 reúne os halogênios; o grupo 18, os gases nobres.",
    ver: ["periodo", "tabela"],
    sinonimos: ["familia", "coluna"],
  },
  {
    id: "metal",
    termo: "Metal",
    categoria: "tabela",
    definicao: "Elemento que, em geral, conduz bem calor e eletricidade, tem brilho e tende a perder elétrons formando cátions. A maior parte da tabela é de metais.",
    duvida: "O mercúrio é um metal e é líquido à temperatura ambiente. O hidrogênio está no grupo 1, mas não é metal.",
    ver: ["nao-metal", "semimetal"],
  },
  {
    id: "nao-metal",
    termo: "Não metal",
    categoria: "tabela",
    definicao: "Elemento que, em geral, conduz mal o calor e a eletricidade e tende a ganhar elétrons formando ânions. Ex.: carbono, oxigênio, nitrogênio, enxofre.",
    ver: ["metal", "halogenio"],
  },
  {
    id: "semimetal",
    termo: "Semimetal",
    categoria: "tabela",
    definicao: "Elemento com propriedades intermediárias entre metais e não metais. O silício, usado em chips de computador, é um exemplo.",
    ver: ["metal", "nao-metal"],
    sinonimos: ["metaloide"],
  },
  {
    id: "metal-alcalino",
    termo: "Metal alcalino",
    categoria: "tabela",
    definicao: "Elementos do grupo 1, sem contar o hidrogênio: lítio, sódio, potássio, rubídio, césio e frâncio. São muito reativos e formam cátions de carga +1.",
    exemplo: "O lítio das baterias e o sódio do sal de cozinha.",
    ver: ["grupo", "metal-alcalino-terroso"],
  },
  {
    id: "metal-alcalino-terroso",
    termo: "Metal alcalino-terroso",
    categoria: "tabela",
    definicao: "Elementos do grupo 2: berílio, magnésio, cálcio, estrôncio, bário e rádio. Formam cátions de carga +2.",
    exemplo: "O cálcio dos ossos e dos dentes.",
    ver: ["grupo", "metal-alcalino"],
  },
  {
    id: "metal-transicao",
    termo: "Metal de transição",
    categoria: "tabela",
    definicao: "Os metais do bloco central da tabela (grupos 3 a 12), como ferro, cobre, ouro e prata. Muitos formam íons de mais de uma carga.",
    exemplo: "O ferro pode ser Fe²⁺ ou Fe³⁺.",
    ver: ["metal", "grupo"],
  },
  {
    id: "metal-representativo",
    termo: "Metal representativo",
    categoria: "tabela",
    definicao: "Metais que ficam fora do bloco central e dos grupos 1 e 2, como o alumínio, o estanho e o chumbo.",
    ver: ["metal"],
    sinonimos: ["pos-transicao"],
  },
  {
    id: "halogenio",
    termo: "Halogênio",
    categoria: "tabela",
    definicao: "Elementos do grupo 17: flúor, cloro, bromo, iodo, astato e tenesso. Tendem a ganhar 1 elétron, formando ânions de carga −1.",
    exemplo: "O cloro da água sanitária e o iodo do sal iodado.",
    ver: ["grupo", "anion"],
  },
  {
    id: "gas-nobre",
    termo: "Gás nobre",
    categoria: "tabela",
    definicao: "Elementos do grupo 18: hélio, neônio, argônio, criptônio, xenônio, radônio e oganessônio. Têm a última camada completa, por isso quase não reagem com outros elementos.",
    exemplo: "O neônio das placas luminosas e o hélio dos balões.",
    duvida: "O hélio só tem 2 elétrons, e já está completo: a primeira camada comporta no máximo 2.",
    ver: ["camada", "grupo"],
  },
  {
    id: "lantanideo",
    termo: "Lantanídeo",
    categoria: "tabela",
    definicao: "Os 15 elementos de lantânio (Z = 57) a lutécio (Z = 71). Ficam numa linha separada embaixo da tabela só para ela caber na página.",
    ver: ["actinideo", "tabela"],
    sinonimos: ["terras raras"],
  },
  {
    id: "actinideo",
    termo: "Actinídeo",
    categoria: "tabela",
    definicao: "Os 15 elementos de actínio (Z = 89) a laurêncio (Z = 103). Todos são radioativos, e vários só existem feitos em laboratório. Ficam numa linha separada embaixo da tabela.",
    exemplo: "O urânio e o plutônio.",
    ver: ["lantanideo", "radioativo"],
  },
  {
    id: "sintetico",
    termo: "Elemento sintético",
    categoria: "tabela",
    definicao: "Elemento que quase não existe na natureza e foi produzido em laboratório, colidindo núcleos em aceleradores. Os mais pesados duram frações de segundo.",
    exemplo: "O oganessônio (Z = 118) foi criado em laboratório, e só alguns átomos dele foram observados.",
    ver: ["radioativo", "meia-vida"],
    sinonimos: ["superpesado", "artificial"],
  },

  // ───────── No jogo ─────────
  {
    id: "estrela",
    termo: "Estrelas",
    categoria: "jogo",
    definicao: "Cada elemento vale 3 estrelas: 1) átomo neutro (descobrir o elemento); 2) isótopo; 3) íon. São 118 × 3 = 354 estrelas no total.",
    ver: ["missao", "atomo-neutro", "isotopo", "ion"],
  },
  {
    id: "missao",
    termo: "Missão",
    categoria: "jogo",
    definicao: "O desafio que aparece no topo do laboratório. A primeira missão de cada elemento é descobri-lo; depois vêm as de isótopo e de íon.",
    duvida: "Se você montar outro elemento por acaso, ele também é descoberto, e a missão continua valendo.",
    ver: ["estrela", "dica"],
  },
  {
    id: "descobrir",
    termo: "Descobrir um elemento",
    categoria: "jogo",
    definicao: "Montar um átomo neutro com o número certo de prótons e apertar CONSTRUIR. O bloco dele se abre na tabela do mapa e a ficha é liberada.",
    ver: ["atomo-neutro", "estrela"],
  },
  {
    id: "dica",
    termo: "Dica",
    categoria: "jogo",
    definicao: "Ajuda extra para uma missão. São pedidas uma por vez, das pistas gerais (família, período) até a resposta, e não custam estrelas.",
    ver: ["missao", "periodo", "grupo"],
  },
  {
    id: "laboratorio",
    termo: "Laboratório",
    categoria: "jogo",
    definicao: "Onde você monta os átomos: arraste prótons, nêutrons e elétrons (ou use + e −) para o átomo e aperte CONSTRUIR para registrar.",
    ver: ["missao"],
  },
  {
    id: "ficha",
    termo: "Ficha do elemento",
    categoria: "jogo",
    definicao: "A página de cada elemento descoberto, com dados, isótopos, curiosidades e onde ele é usado e encontrado.",
    ver: ["descobrir"],
  },
];

/** Tira acentos e deixa tudo em minúsculas, para a busca achar "eletron" ao digitar "elétron". */
export function normalizar(t: string): string {
  return t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function termoPorId(id: string): TermoGlossario | undefined {
  return GLOSSARIO.find((t) => t.id === id);
}

/** Busca por termo, sigla, sinônimo ou trecho da definição. Termo e sinônimos pesam mais. */
export function buscarGlossario(consulta: string, categoria?: CategoriaGlossario | null): TermoGlossario[] {
  const q = normalizar(consulta);
  const base = categoria ? GLOSSARIO.filter((t) => t.categoria === categoria) : GLOSSARIO;
  if (!q) return base;
  const pontos = (t: TermoGlossario): number => {
    if (normalizar(t.termo).includes(q)) return 3;
    if (t.sigla && normalizar(t.sigla) === q) return 3;
    if (t.sinonimos?.some((s) => normalizar(s).includes(q))) return 2;
    if (normalizar(t.definicao).includes(q)) return 1;
    return 0;
  };
  return base
    .map((t) => ({ t, p: pontos(t) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .map((x) => x.t);
}
