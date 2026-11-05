import Link from "next/link";
import { sair } from "@/app/login/actions";
import { NOME_PERFIL, type Sessao } from "@/lib/auth/tipos";

export function Cabecalho({ sessao }: { sessao: Sessao }) {
  return (
    <header className="border-b-2 border-dourado bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" aria-label="Início" className="shrink-0">
          {/* Logo provisório, tirado do cabeçalho do contrato, até chegar o PNG oficial. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-provisorio.png" alt="Lucauto Empreendimentos Imobiliários" className="h-7 w-auto sm:h-9" />
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block font-semibold">{sessao.nome}</span>
            <span className="text-marinho/60">{NOME_PERFIL[sessao.perfil]}</span>
          </span>
          <form action={sair}>
            <button type="submit" className="min-h-11 rounded-lg border border-marinho/30 px-4 font-semibold hover:bg-papel">Sair</button>
          </form>
        </div>
      </div>
    </header>
  );
}
