/*******************************************************************************
 * abas.test.tsx
 * funcao principal: testa se o progresso salvo por outra aba do jogo chega a
 * esta aba (evento "storage"), para uma aba nao apagar o que a outra registrou.
 ******************************************************************************/
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CHAVE, construir, progressoInicial, salvar } from "@/motor";
import { ProgressoProvider, useProgresso } from "@/interface/store";

// avisa o React que o teste usa act()
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// guarda o contexto mais novo para o teste ler e chamar as acoes
let ctx: ReturnType<typeof useProgresso> | null = null;
function Espiao() {
  ctx = useProgresso();
  return null;
}

// simula a outra aba: grava direto no armazenamento e dispara o evento "storage"
function outraAbaSalva(chave: string, valor: string | null) {
  if (valor === null) window.localStorage.removeItem(chave);
  else window.localStorage.setItem(chave, valor);
  window.dispatchEvent(
    new StorageEvent("storage", { key: chave, newValue: valor, storageArea: window.localStorage }),
  );
}

describe("Duas abas abertas", () => {
  let raiz: Root;
  let div: HTMLDivElement;

  beforeEach(async () => {
    window.localStorage.clear();
    div = document.createElement("div");
    document.body.appendChild(div);
    raiz = createRoot(div);
    await act(async () => {
      raiz.render(
        <ProgressoProvider>
          <Espiao />
        </ProgressoProvider>,
      );
    });
  });

  afterEach(async () => {
    await act(async () => raiz.unmount());
    div.remove();
    window.localStorage.clear();
  });

  it("o que a outra aba salva aparece aqui, e o próximo construir soma em cima", async () => {
    expect(ctx?.carregado).toBe(true);
    // a outra aba descobre o litio
    const daOutra = construir(progressoInicial(), { p: 3, n: 4, e: 3 }).estado;
    await act(async () => outraAbaSalva(CHAVE, JSON.stringify(daOutra)));
    expect(ctx?.estado.elementos["3"]?.estrelas[0]).toBe(true);
    // esta aba descobre o hidrogenio: o litio da outra aba continua salvo
    await act(async () => {
      ctx?.construir({ p: 1, n: 0, e: 1 });
    });
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE) ?? "{}");
    expect(Object.keys(salvo.elementos).sort()).toEqual(["1", "3"]);
  });

  it("reiniciar na outra aba zera esta também", async () => {
    await act(async () => {
      ctx?.construir({ p: 1, n: 0, e: 1 });
    });
    expect(ctx?.estado.elementos["1"]).toBeDefined();
    await act(async () => outraAbaSalva(CHAVE, null));
    expect(ctx?.estado.elementos).toEqual({});
  });

  it("salvo corrompido na outra aba não apaga o progresso desta", async () => {
    await act(async () => {
      ctx?.construir({ p: 1, n: 0, e: 1 });
    });
    await act(async () => outraAbaSalva(CHAVE, "{isso nao e json"));
    expect(ctx?.estado.elementos["1"]).toBeDefined();
    // devolve um salvo valido para o afterEach nao depender do lixo
    salvar(window.localStorage, ctx!.estado);
  });
});
