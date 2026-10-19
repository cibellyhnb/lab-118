import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: "::",
    port: 8081,
  },
  css: { transformer: "lightningcss" },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  plugins: [
    tailwindcss(),
    // src/server.ts: entrada do servidor com pagina de erro propria (usada no dev e
    // no prerender do shell).
    // modo SPA: o build gera um site estatico em dist/client. o shell da aplicacao
    // vira dist/client/index.html e o roteador desenha cada tela no navegador.
    // autoStaticPathsDiscovery desligado para nao gerar HTML de cada rota
    tanstackStart({
      server: { entry: "server" },
      spa: { enabled: true, prerender: { outputPath: "/index" } },
      prerender: { autoStaticPathsDiscovery: false },
    }),
    viteReact(),
  ],
});
