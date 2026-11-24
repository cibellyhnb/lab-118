/*******************************************************************************
 * NaoEncontrada.tsx
 * funcao principal: tela de pagina nao encontrada (404), usada pela rota
 * curinga (routes/$.tsx) e, de reserva, pela rota raiz.
 ******************************************************************************/
import { Link } from "@tanstack/react-router";

/*******************************************************************************
 * NaoEncontrada
 * funcao: tela de pagina nao encontrada (404).
 * recebe: nada.
 * retorna: aviso centralizado com um link para voltar ao inicio.
 ******************************************************************************/
export function NaoEncontrada() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página não existe ou mudou de endereço.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
