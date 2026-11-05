import { modoDemo } from "@/lib/auth/mock";
import type { Sessao } from "@/lib/auth/tipos";
import { Navegacao } from "./Navegacao";

/** Moldura do app: menu lateral + área principal (máx. 1200px, margem de 32px). */
export function AppShell({ sessao, children }: { sessao: Sessao; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Navegacao nome={sessao.nome} perfil={sessao.perfil} />
      <div className="lg:pl-[264px]">
        {modoDemo() && <p className="bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">Modo de demonstração: pessoas e dados fictícios. Nada é guardado.</p>}
        <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
