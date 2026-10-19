/*******************************************************************************
 * persistencia.ts
 * funcao principal: salva e carrega o progresso do jogador num armazenamento
 * do tipo localStorage, guardando a parte se o dado salvo estiver
 * corrompido.
 ******************************************************************************/
import { progressoInicial } from "./progresso";
import type { Progresso } from "./tipos";

// chave usada no armazenamento
export const CHAVE = "construtor-atomico:progresso";
// onde fica a copia do progresso que nao deu para ler
export const CHAVE_CORROMPIDO = `${CHAVE}:corrompido`;

// so o que o codigo usa do Storage; nos testes da para passar um objeto simples
type Armazenamento = Pick<Storage, "getItem" | "setItem">;

/*******************************************************************************
 * valido
 * funcao: confere por cima se o objeto lido tem cara de Progresso
 * (versao numerica e elementos como objeto).
 * recebe: x (qualquer valor vindo do JSON).
 * retorna: true se parece um Progresso.
 ******************************************************************************/
function valido(x: unknown): x is Progresso {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o["versao"] === "number" && !!o["elementos"] && typeof o["elementos"] === "object";
}

/*******************************************************************************
 * carregar
 * funcao: le o progresso salvo. se o dado estiver estragado, copia ele para
 * CHAVE_CORROMPIDO e comeca do zero. se o armazenamento lancar erro
 * (bloqueado, modo privado), comeca do zero sem acusar corrupcao.
 * recebe: arm (armazenamento com getItem e setItem).
 * retorna: { estado, corrompido }, com o progresso e se houve corrupcao.
 * nunca lanca erro.
 ******************************************************************************/
export function carregar(arm: Armazenamento): { estado: Progresso; corrompido: boolean } {
  let bruto: string | null;
  try {
    bruto = arm.getItem(CHAVE);
  } catch {
    // armazenamento bloqueado: segue com um jogo novo so em memoria
    return { estado: progressoInicial(), corrompido: false };
  }
  // nada salvo ainda: jogo novo
  if (!bruto) return { estado: progressoInicial(), corrompido: false };
  try {
    const obj: unknown = JSON.parse(bruto);
    if (!valido(obj)) throw new Error("formato");
    // migracao: so existe a versao 1; campos que faltam recebem o valor padrao
    const base = progressoInicial();
    return {
      estado: { ...base, ...obj, versao: 1, config: { ...base.config, ...obj.config }, quiz: { ...base.quiz, ...obj.quiz } },
      corrompido: false,
    };
  } catch {
    // JSON quebrado ou formato errado: guarda o texto original e recomeca
    try {
      arm.setItem(CHAVE_CORROMPIDO, bruto);
    } catch {
      /* sem como guardar a copia: recomeca do mesmo jeito */
    }
    return { estado: progressoInicial(), corrompido: true };
  }
}

/*******************************************************************************
 * salvar
 * funcao: grava o progresso em JSON na CHAVE.
 * recebe: arm (armazenamento) e estado (Progresso). retorna: nada.
 ******************************************************************************/
export function salvar(arm: Armazenamento, estado: Progresso): void {
  arm.setItem(CHAVE, JSON.stringify(estado));
}
