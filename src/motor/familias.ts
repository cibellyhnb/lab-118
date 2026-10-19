/*******************************************************************************
 * familias.ts
 * funcao principal: textos de cada familia da tabela para a cerimonia que
 * acontece quando o jogador descobre todos os membros dela, e as contas de
 * progresso que dizem quando essa cerimonia deve aparecer.
 ******************************************************************************/
import { ELEMENTOS, NOME_CATEGORIA } from "./dados";
import { descoberto } from "./progresso";
import type { Categoria, Elemento, Progresso } from "./tipos";

// uma "familia" do jogo e uma categoria da tabela (as mesmas cores do mapa)
export type FamiliaInfo = {
  id: Categoria;
  // plural com artigo, para frases: "os halogenios"
  nome: string;
  // titulo de RPG da cerimonia
  titulo: string;
  // onde fica na tabela, ja com a preposicao ("no grupo 17, ...")
  onde: string;
  // tres curiosidades que o Zula conta na cerimonia (e que o quiz da familia retoma)
  fatos: [string, string, string];
};

/*******************************************************************************
 * FAMILIAS
 * funcao: textos da cerimonia de cada uma das 10 familias, na ordem em que
 * sao conferidas por familiaPendente.
 ******************************************************************************/
export const FAMILIAS: FamiliaInfo[] = [
  {
    id: "metal_alcalino",
    nome: "metais alcalinos",
    titulo: "Os Faiscantes",
    onde: "no grupo 1, na ponta esquerda da tabela",
    fatos: [
      "O sódio é tão mole que dá para cortá-lo com uma faca comum.",
      "Eles reagem com a água com tanta força que o sódio e o potássio são guardados mergulhados em óleo.",
      "O lítio está dentro da bateria do seu celular.",
    ],
  },
  {
    id: "metal_alcalino_terroso",
    nome: "metais alcalino-terrosos",
    titulo: "Os Guardiões dos Ossos",
    onde: "no grupo 2, ao lado dos alcalinos",
    fatos: [
      "O cálcio é o mineral mais abundante do seu corpo: ele forma os seus ossos e os seus dentes.",
      "O magnésio queima com uma luz branca tão forte que já foi usado em flashes de câmeras antigas.",
      "O estrôncio dá a cor vermelha dos fogos de artifício.",
    ],
  },
  {
    id: "metal_transicao",
    nome: "metais de transição",
    titulo: "Os Ferreiros",
    onde: "no grande bloco do meio da tabela, dos grupos 3 a 12",
    fatos: [
      "O ferro está no seu sangue: ele ajuda a levar o oxigênio para o corpo todo.",
      "O ouro não enferruja, por isso é usado em joias e moedas há milhares de anos.",
      "O cobre conduz tão bem a eletricidade que quase todos os fios da sua casa são feitos dele.",
    ],
  },
  {
    id: "metal_representativo",
    nome: "metais representativos",
    titulo: "Os Construtores",
    onde: "à direita do bloco do meio, nos grupos 13 a 16",
    fatos: [
      "O alumínio das latinhas de refrigerante pode ser reciclado várias vezes.",
      "O gálio derrete na palma da mão: ele funde a cerca de 30 °C.",
      "O estanho cobre o aço das latas de conserva para que elas não enferrujem.",
    ],
  },
  {
    id: "semimetal",
    nome: "semimetais",
    titulo: "Os Mestres do Meio-termo",
    onde: "numa escadinha diagonal entre os metais e os não metais",
    fatos: [
      "O silício é a base dos chips de computadores e celulares.",
      "A areia da praia é feita principalmente de silício e oxigênio.",
      "Os semimetais conduzem eletricidade mais ou menos, nem tanto quanto um metal, nem tão pouco quanto um isolante. É isso que os torna tão úteis na eletrônica.",
    ],
  },
  {
    id: "nao_metal",
    nome: "não metais",
    titulo: "Os Fundadores da Vida",
    onde: "no canto superior direito da tabela, mais o hidrogênio",
    fatos: [
      "O hidrogênio é o elemento mais abundante do universo.",
      "O diamante e o grafite do lápis são feitos só de carbono, apenas com os átomos arrumados de outro jeito.",
      "Carbono, hidrogênio, oxigênio e nitrogênio formam mais de 90% do seu corpo.",
    ],
  },
  {
    id: "halogenio",
    nome: "halogênios",
    titulo: "Os Purificadores",
    onde: "no grupo 17, ao lado dos gases nobres",
    fatos: [
      "O cloro ajuda a deixar a água da piscina e da torneira segura.",
      "O iodo é adicionado ao sal de cozinha para a sua tireoide funcionar bem.",
      "O flúor está em muitas pastas de dente para proteger o esmalte.",
    ],
  },
  {
    id: "gas_nobre",
    nome: "gases nobres",
    titulo: "Os Nobres Solitários",
    onde: "no grupo 18, a última coluna da tabela",
    fatos: [
      "O hélio faz os balões flutuarem e deixa a voz fininha.",
      "O neônio brilha em vermelho-alaranjado nas placas luminosas.",
      "Eles se chamam “nobres” porque quase nunca se misturam com outros elementos.",
    ],
  },
  {
    id: "lantanideo",
    nome: "lantanídeos",
    titulo: "Os Tesouros Escondidos",
    onde: "numa linha separada, logo abaixo da tabela",
    fatos: [
      "Os ímãs mais fortes que existem usam neodímio.",
      "Vários lantanídeos dão as cores das telas de TV e de celular.",
      "Eles também são chamados de “terras raras”, mas não são tão raros assim: o difícil é separar um do outro.",
    ],
  },
  {
    id: "actinideo",
    nome: "actinídeos",
    titulo: "Os Guardiões do Poder",
    onde: "na última linha, embaixo da tabela",
    fatos: [
      "O urânio e o plutônio são usados para gerar energia nas usinas nucleares.",
      "O amerício está dentro de muitos detectores de fumaça.",
      "Todos os actinídeos são radioativos, e muitos só existem porque os cientistas os criam em laboratório.",
    ],
  },
];

/*******************************************************************************
 * familiaPorId
 * funcao: acha os textos de uma familia.
 * recebe: id (Categoria).
 * retorna: o FamiliaInfo; lanca erro se a categoria nao estiver em FAMILIAS.
 ******************************************************************************/
export function familiaPorId(id: Categoria): FamiliaInfo {
  const f = FAMILIAS.find((x) => x.id === id);
  if (!f) throw new Error(`Família desconhecida: ${id}`);
  return f;
}

/*******************************************************************************
 * nomeFamilia
 * funcao: nome da familia no singular, ex: "Halogenio".
 * recebe: id (Categoria). retorna: string.
 ******************************************************************************/
export function nomeFamilia(id: Categoria): string {
  return NOME_CATEGORIA[id];
}

/*******************************************************************************
 * membros
 * funcao: todos os elementos de uma familia.
 * recebe: id (Categoria). retorna: lista de Elemento, em ordem de Z.
 ******************************************************************************/
export function membros(id: Categoria): Elemento[] {
  return ELEMENTOS.filter((e) => e.categoria === id);
}

/*******************************************************************************
 * progressoFamilia
 * funcao: conta quantos membros da familia o jogador ja descobriu.
 * recebe: estado (Progresso) e id (Categoria).
 * retorna: { descobertos, total, completa }; completa so e true quando
 * todos os membros foram descobertos.
 ******************************************************************************/
export function progressoFamilia(estado: Progresso, id: Categoria): { descobertos: number; total: number; completa: boolean } {
  const lista = membros(id);
  const descobertos = lista.filter((e) => descoberto(estado, e.z)).length;
  // lista.length > 0 evita dar uma familia vazia como completa
  return { descobertos, total: lista.length, completa: lista.length > 0 && descobertos === lista.length };
}

// texto guardado em conquistas para lembrar que a cerimonia ja aconteceu
const marca = (id: Categoria) => `familia:${id}`;

/*******************************************************************************
 * familiaJaCelebrada
 * funcao: diz se a cerimonia da familia ja foi mostrada.
 * recebe: estado (Progresso) e id (Categoria). retorna: boolean.
 ******************************************************************************/
export function familiaJaCelebrada(estado: Progresso, id: Categoria): boolean {
  return estado.conquistas.includes(marca(id));
}

/*******************************************************************************
 * familiaPendente
 * funcao: procura a primeira familia completa que ainda nao teve cerimonia.
 * recebe: estado (Progresso).
 * retorna: a Categoria dessa familia, ou null se nao houver nenhuma.
 ******************************************************************************/
export function familiaPendente(estado: Progresso): Categoria | null {
  for (const f of FAMILIAS) {
    if (progressoFamilia(estado, f.id).completa && !familiaJaCelebrada(estado, f.id)) return f.id;
  }
  return null;
}

/*******************************************************************************
 * registrarFamilia
 * funcao: marca a cerimonia da familia como vista.
 * recebe: estado (Progresso) e id (Categoria).
 * retorna: um novo Progresso com a marca em conquistas; se ja estava
 * marcada, devolve o mesmo estado.
 ******************************************************************************/
export function registrarFamilia(estado: Progresso, id: Categoria): Progresso {
  if (familiaJaCelebrada(estado, id)) return estado;
  return { ...estado, conquistas: [...estado.conquistas, marca(id)] };
}
