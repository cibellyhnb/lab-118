import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
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

type Ctx = {
  estado: Progresso;
  carregado: boolean;
  avisoCorrompido: boolean;
  ultimoMontado: Record<number, Particulas>;
  construir: (p: Particulas) => { classificacao: Classificacao; eventos: Evento[] };
  alternarSom: () => void;
  concluirTutorial: (conceder: boolean) => void;
  tocar: (f: () => void) => void;
  registrarFamilia: (id: Categoria) => void;
  registrarQuiz: (quiz: IdQuiz, acertos: number, total: number) => { selo: Selo; novoRecorde: boolean };
};

const CHAVE_ULTIMO = "construtor-atomico:ultimo-montado";

const ProgressoCtx = createContext<Ctx | null>(null);

export function ProgressoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Progresso>(progressoInicial);
  const [carregado, setCarregado] = useState(false);
  const [avisoCorrompido, setAviso] = useState(false);
  const [ultimoMontado, setUltimo] = useState<Record<number, Particulas>>({});
  const ultimoRef = useRef<Record<number, Particulas>>({});
  const ref = useRef(estado);
  ref.current = estado;

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
      /* sem último átomo salvo: segue vazio */
    }
    const r = carregar(window.localStorage);
    setEstado(r.estado);
    setAviso(r.corrompido);
    setCarregado(true);
  }, []);

  const persistir = (s: Progresso) => {
    ref.current = s;
    setEstado(s);
    try {
      salvar(window.localStorage, s);
    } catch {
      /* armazenamento indisponível: segue em memória */
    }
  };

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
        /* armazenamento indisponível: segue em memória */
      }
    }
    return { classificacao: r.classificacao, eventos: r.eventos };
  }, []);

  const alternarSom = useCallback(() => {
    const s = ref.current;
    persistir({ ...s, config: { ...s.config, som: !s.config.som } });
  }, []);

  const concluirTutorial = useCallback((conceder: boolean) => {
    persistir(concluirTutorialMotor(ref.current, conceder));
  }, []);

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

  const valor = useMemo(
    () => ({ estado, carregado, avisoCorrompido, ultimoMontado, construir, alternarSom, concluirTutorial, tocar, registrarFamilia, registrarQuiz }),
    [estado, carregado, avisoCorrompido, ultimoMontado, construir, alternarSom, concluirTutorial, tocar, registrarFamilia, registrarQuiz],
  );
  return <ProgressoCtx.Provider value={valor}>{children}</ProgressoCtx.Provider>;
}

export function useProgresso(): Ctx {
  const c = useContext(ProgressoCtx);
  if (!c) throw new Error("useProgresso fora do ProgressoProvider");
  return c;
}

export { sons };
