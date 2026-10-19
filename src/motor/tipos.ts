/*******************************************************************************
 * tipos.ts
 * funcao principal: define os tipos que o motor e a interface usam: elemento,
 * classificacao da montagem, eventos, progresso do jogador e missoes. segue
 * os contratos da secao 12 do Documento de Design v2.
 ******************************************************************************/
// este arquivo nao pode importar nada da interface

// quantidade de protons (p), neutrons (n) e eletrons (e) montados
export type Particulas = { p: number; n: number; e: number };

// as familias da tabela, que tambem definem as cores do mapa
export type Categoria =
  | "metal_alcalino"
  | "metal_alcalino_terroso"
  | "metal_transicao"
  | "metal_representativo"
  | "semimetal"
  | "nao_metal"
  | "halogenio"
  | "gas_nobre"
  | "lantanideo"
  | "actinideo";

// um isotopo do catalogo; abundancia null quando nao existe na natureza
export type Isotopo = {
  a: number;
  estabilidade: "estavel" | "radioativo";
  abundancia_pct: number | null;
  meia_vida?: string;
};

export type Dificuldade = "facil" | "media" | "dificil";

/*******************************************************************************
 * Elemento
 * funcao: formato de cada elemento no elements.json: posicao na tabela,
 * massa, camadas, isotopos, ions comuns e os textos da ficha.
 ******************************************************************************/
export type Elemento = {
  z: number;
  simbolo: string;
  nome: string;
  categoria: Categoria;
  grupo: number | null;
  periodo: number;
  posicao: { linha: number; coluna: number };
  fase_ambiente: "solido" | "liquido" | "gasoso" | "desconhecido";
  massa_atomica: { valor: number; tipo: "convencional" | "isotopo_mais_longevo" } | null;
  camadas: number[];
  eletrons_valencia: number | null;
  isotopos: Isotopo[];
  ions_comuns: number[];
  trilha_essencial: boolean;
  // opcional: troca a dificuldade calculada em motor/dicas.ts
  dificuldade?: Dificuldade;
  ficha: {
    nivel: "completa" | "enxuta";
    pista?: string;
    // dicas extras escritas a mao, sem citar o nome nem o simbolo
    dicas?: string[];
    usos?: string[];
    curiosidades?: string[];
    fontes?: string[];
  };
};

// motivos pelos quais uma montagem e recusada
export type CodigoErro =
  | "SEM_PROTONS"
  | "Z_ACIMA_DE_118"
  | "ELETRONS_FORA_DO_LIMITE"
  | "NEUTRONS_FORA_DO_LIMITE";

export type StatusNuclideo = "estavel" | "radioativo" | "nao_catalogado";

/*******************************************************************************
 * Classificacao
 * funcao: resultado de classificar(). quando valido e false, so os numeros
 * basicos e o erro vem preenchidos; elemento, especie, nuclideo e notacao
 * aparecem apenas nas montagens validas.
 ******************************************************************************/
export type Classificacao = {
  valido: boolean;
  erro?: CodigoErro;
  z: number;
  n: number;
  e: number;
  a: number;
  carga: number;
  elemento?: { z: number; simbolo: string; nome: string; categoria: string };
  especie?: "atomo_neutro" | "cation" | "anion";
  nuclideo?: { rotulo: string; status: StatusNuclideo };
  notacao?: string;
  avisos: string[];
};

// o que aconteceu ao construir; a interface usa para tocar som e mostrar avisos
export type Evento =
  | { tipo: "ELEMENTO_DESCOBERTO"; z: number }
  | { tipo: "ISOTOPO_REGISTRADO"; z: number; a: number }
  | { tipo: "ION_REGISTRADO"; z: number; carga: number }
  | { tipo: "ESTRELA_GANHA"; z: number; estrela: 1 | 2 | 3 }
  | { tipo: "CONQUISTA"; id: string };

// estrelas: [descoberto, isotopos, ion]; isotopos guarda os A e ions as cargas
export type ProgressoElemento = {
  estrelas: [boolean, boolean, boolean];
  isotopos: number[];
  ions: number[];
};

/*******************************************************************************
 * Progresso
 * funcao: tudo o que e salvo do jogador: elementos (indexados pelo Z em
 * texto), conquistas, quiz, tutorial e configuracoes.
 ******************************************************************************/
export type Progresso = {
  versao: 1;
  elementos: Record<string, ProgressoElemento>;
  conquistas: string[];
  quiz: { rodadas: number; melhor: number; elementosDesdeUltimoQuiz: number };
  tutorialConcluido: boolean;
  config: { som: boolean; reduzirMovimento: boolean };
};

// uma dica de missao. nivel 1 = pista (muda com a dificuldade), 2 = posicao,
// 3 = faixa de protons, 4 = revelar
export type Dica = { nivel: 1 | 2 | 3 | 4; titulo: string; texto: string };

// o que a montagem precisa ter para a missao contar como cumprida
export type Criterio =
  | { tipo: "DESCOBRIR"; z: number }
  | { tipo: "ISOTOPO"; z: number; a?: number; n?: number; radioativo?: boolean }
  | { tipo: "ION"; z: number; carga?: number };

// M1 = descobrir, M2 = isotopo, M3 = ion
export type Missao = {
  id: string;
  tipo: "M1" | "M2" | "M3";
  z: number;
  enunciado: string;
  dicas: string[];
  criterio: Criterio;
};
