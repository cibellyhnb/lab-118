// Contratos da seção 12 do Documento de Design v2. Não importar nada de interface aqui.

export type Particulas = { p: number; n: number; e: number };

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

export type Isotopo = {
  a: number;
  estabilidade: "estavel" | "radioativo";
  abundancia_pct: number | null;
  meia_vida?: string;
};

export type Dificuldade = "facil" | "media" | "dificil";

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
  /** Opcional: sobrescreve a dificuldade calculada (ver motor/dicas.ts). */
  dificuldade?: Dificuldade;
  ficha: {
    nivel: "completa" | "enxuta";
    pista?: string;
    /** Dicas autorais extras (sem citar o nome nem o símbolo). */
    dicas?: string[];
    usos?: string[];
    curiosidades?: string[];
    fontes?: string[];
  };
};

export type CodigoErro =
  | "SEM_PROTONS"
  | "Z_ACIMA_DE_118"
  | "ELETRONS_FORA_DO_LIMITE"
  | "NEUTRONS_FORA_DO_LIMITE";

export type StatusNuclideo = "estavel" | "radioativo" | "nao_catalogado";

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

export type Evento =
  | { tipo: "ELEMENTO_DESCOBERTO"; z: number }
  | { tipo: "ISOTOPO_REGISTRADO"; z: number; a: number }
  | { tipo: "ION_REGISTRADO"; z: number; carga: number }
  | { tipo: "ESTRELA_GANHA"; z: number; estrela: 1 | 2 | 3 }
  | { tipo: "CONQUISTA"; id: string };

export type ProgressoElemento = {
  estrelas: [boolean, boolean, boolean];
  isotopos: number[];
  ions: number[];
};

export type Progresso = {
  versao: 1;
  elementos: Record<string, ProgressoElemento>;
  conquistas: string[];
  quiz: { rodadas: number; melhor: number; elementosDesdeUltimoQuiz: number };
  tutorialConcluido: boolean;
  config: { som: boolean; reduzirMovimento: boolean };
};

/** Uma dica de missão. Nível 1 = pista (muda com a dificuldade), 2 = posição, 3 = faixa de prótons, 4 = revelar. */
export type Dica = { nivel: 1 | 2 | 3 | 4; titulo: string; texto: string };

export type Criterio =
  | { tipo: "DESCOBRIR"; z: number }
  | { tipo: "ISOTOPO"; z: number; a?: number; n?: number; radioativo?: boolean }
  | { tipo: "ION"; z: number; carga?: number };

export type Missao = {
  id: string;
  tipo: "M1" | "M2" | "M3";
  z: number;
  enunciado: string;
  dicas: string[];
  criterio: Criterio;
};
