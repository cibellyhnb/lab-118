/*******************************************************************************
 * store.tsx
 * funcao principal: guarda o progresso do jogador num contexto do React,
 * carrega e salva no localStorage e oferece as acoes do jogo (construir,
 * ligar o som, concluir tutorial, registrar familia e quiz) para as telas.
 ******************************************************************************/
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CHAVE,
  CHAVE_CORROMPIDO,
  carregar,
  concluirTutorial as concluirTutorialMotor,
  construir as construirMotor,
  progressoInicial,
  registrarFamilia as registrarFamiliaMotor,
  registrarQuiz as registrarQuizMotor,
  salvar,
  type Categoria,
  type Classificacao,
  type Evento,
  type Particulas,
  type IdQuiz,
  type Progresso,
  type Selo,
} from "@/motor";
import { sons } from "./som";

// tudo o que as telas recebem de useProgresso()
type Ctx = {
  estado: Progresso;
  carregado: boolean;
  avisoCorrompido: boolean;
  dispensarAviso: () => void;
  reiniciar: () => void;
  ultimoMontado: Record<number, Particulas>;
  construir: (p: Particulas) => { classificacao: Classificacao; eventos: Evento[] };
  alternarSom: () => void;
  concluirTutorial: (conceder: boolean) => void;
  tocar: (f: () => void) => void;
  registrarFamilia: (id: Categoria) => void;
  registrarQuiz: (quiz: IdQuiz, acertos: number, total: number) => { selo: Selo; novoRecorde: boolean };
};

// ultima montagem valida de cada elemento, salva separada do progresso
const CHAVE_ULTIMO = "construtor-atomico:ultimo-montado";
// marca que o final do jogo ja foi visto (o Mapa so abre o final sozinho uma vez)
export const CHAVE_FINAL = "lab118:final";

const ProgressoCtx = createContext<Ctx | null>(null);

/*******************************************************************************
 * ProgressoProvider
 * funcao: componente que segura o estado do jogo e repassa para as telas
 * pelo contexto.
 * recebe: children (as telas do app).
 * retorna: o provedor do contexto envolvendo children.
 ******************************************************************************/
export function ProgressoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Progresso>(progressoInicial);
  const [carregado, setCarregado] = useState(false);
  const [avisoCorrompido, setAviso] = useState(false);
  const [ultimoMontado, setUltimo] = useState<Record<number, Particulas>>({});
  // as refs guardam o valor mais novo para as funcoes de useCallback, que sao
  // criadas uma vez so e nao enxergariam o estado atualizado
  const ultimoRef = useRef<Record<number, Particulas>>({});
  const ref = useRef(estado);
  ref.current = estado;

  // ao abrir o jogo (so no navegador): le a ultima montagem e o progresso salvos
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE_ULTIMO);
      if (bruto) {
        const obj: unknown = JSON.parse(bruto);
        if (obj && typeof obj === "object") {
          ultimoRef.current = obj as Record<number, Particulas>;
          setUltimo(ultimoRef.current);
        }
      }
    } catch {
      /* sem ultimo atomo salvo: segue vazio */
    }
    // so ler window.localStorage ja pode lancar SecurityError com os dados bloqueados;
    // nesse caso o jogo segue com um progresso novo so em memoria
    let r: ReturnType<typeof carregar>;
    try {
      r = carregar(window.localStorage);
    } catch {
      r = { estado: progressoInicial(), corrompido: false };
    }
    setEstado(r.estado);
    setAviso(r.corrompido);
    setCarregado(true);
  }, []);

  // troca o estado na tela e grava no localStorage
  const persistir = (s: Progresso) => {
    ref.current = s;
    setEstado(s);
    try {
      salvar(window.localStorage, s);
    } catch {
      /* armazenamento indisponivel: segue em memoria */
    }
  };

  // roda a montagem no motor; se for valida, lembra ela como a ultima do elemento
  const construir = useCallback((p: Particulas) => {
    const r = construirMotor(ref.current, p);
    persistir(r.estado); // salva depois de cada construir()
    if (r.classificacao.valido) {
      const z = r.classificacao.z;
      ultimoRef.current = { ...ultimoRef.current, [z]: p };
      setUltimo(ultimoRef.current);
      try {
        window.localStorage.setItem(CHAVE_ULTIMO, JSON.stringify(ultimoRef.current));
      } catch {
        /* armazenamento indisponivel: segue em memoria */
      }
    }
    return { classificacao: r.classificacao, eventos: r.eventos };
  }, []);

  // esconde o aviso de progresso corrompido depois que o jogador leu
  const dispensarAviso = useCallback(() => setAviso(false), []);

  // liga e desliga o som (efeitos e musica)
  const alternarSom = useCallback(() => {
    const s = ref.current;
    persistir({ ...s, config: { ...s.config, som: !s.config.som } });
  }, []);

  const concluirTutorial = useCallback((conceder: boolean) => {
    persistir(concluirTutorialMotor(ref.current, conceder));
  }, []);

  // so toca o efeito se o som estiver ligado
  const tocar = useCallback((f: () => void) => {
    if (ref.current.config.som) f();
  }, []);

  const registrarFamilia = useCallback((id: Categoria) => {
    persistir(registrarFamiliaMotor(ref.current, id));
  }, []);

  const registrarQuiz = useCallback((quiz: IdQuiz, acertos: number, total: number) => {
    const r = registrarQuizMotor(ref.current, quiz, acertos, total);
    persistir(r.estado);
    return { selo: r.selo, novoRecorde: r.novoRecorde };
  }, []);

  // apaga as 4 chaves do jogo no navegador e volta ao progresso inicial. com o
  // armazenamento bloqueado, cada remocao falha em silencio e so a memoria e zerada
  const reiniciar = useCallback(() => {
    for (const chave of [CHAVE, CHAVE_ULTIMO, CHAVE_CORROMPIDO, CHAVE_FINAL]) {
      try {
        window.localStorage.removeItem(chave);
      } catch {
        /* armazenamento indisponivel: segue so com a memoria */
      }
    }
    const novo = progressoInicial();
    ref.current = novo;
    setEstado(novo);
    ultimoRef.current = {};
    setUltimo({});
    setAviso(false);
  }, []);

  // useMemo evita redesenhar quem usa o contexto quando nada mudou
  const valor = useMemo(
    () => ({ estado, carregado, avisoCorrompido, dispensarAviso, reiniciar, ultimoMontado, construir, alternarSom, concluirTutorial, tocar, registrarFamilia, registrarQuiz }),
    [estado, carregado, avisoCorrompido, dispensarAviso, reiniciar, ultimoMontado, construir, alternarSom, concluirTutorial, tocar, registrarFamilia, registrarQuiz],
  );
  return <ProgressoCtx.Provider value={valor}>{children}</ProgressoCtx.Provider>;
}

/*******************************************************************************
 * useProgresso
 * funcao: hook para as telas lerem o progresso e chamarem as acoes.
 * recebe: nada.
 * retorna: o Ctx; lanca erro se usado fora do ProgressoProvider.
 ******************************************************************************/
export function useProgresso(): Ctx {
  const c = useContext(ProgressoCtx);
  if (!c) throw new Error("useProgresso fora do ProgressoProvider");
  return c;
}

// reexporta os sons para as telas importarem tudo daqui
export { sons };
