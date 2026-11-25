import "@testing-library/jest-dom/vitest";

// o Node 25 traz um localStorage proprio no escopo global, que fica no lugar do
// localStorage do jsdom e nao funciona sem a opcao --localstorage-file (vira
// undefined ou um objeto sem os metodos). aqui o teste volta a usar o
// armazenamento do jsdom, como no navegador; nas versoes antigas do Node nada muda
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (dom) {
  for (const nome of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, nome, {
      configurable: true,
      enumerable: true,
      get: () => dom.window[nome],
    });
  }
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
