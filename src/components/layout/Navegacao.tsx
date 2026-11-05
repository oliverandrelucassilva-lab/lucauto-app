"use client";
import { BarChart3, Building2, Home, LogOut, Menu, Settings, Workflow, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { sair } from "@/app/login/actions";
import { IconePdf } from "@/components/IconePdf";
import { Selo } from "@/components/ui/Selo";
import { podeAcessar, type Modulo } from "@/lib/auth/permissoes";
import type { Perfil } from "@/lib/auth/tipos";
import { BlocoUsuario } from "./BlocoUsuario";

interface Item {
  rotulo: string;
  href?: string; // sem href = ainda não existe ("Em breve")
  icone: LucideIcon | "pdf";
  modulo?: Modulo; // sem módulo = todo mundo vê
}

const ITENS: Item[] = [
  { rotulo: "Início", href: "/", icone: Home },
  { rotulo: "Gerador de PDFs", href: "/contratos", icone: "pdf", modulo: "contratos" },
  { rotulo: "Imóveis", icone: Building2, modulo: "imoveis" },
  { rotulo: "Painel", icone: BarChart3, modulo: "painel" },
  { rotulo: "Automações", icone: Workflow, modulo: "automacoes" },
  { rotulo: "Configurações", href: "/configuracoes", icone: Settings, modulo: "configuracoes" },
];

const Logo = ({ className = "" }: { className?: string }) => (
  // Logo provisório (azul marinho), recortado do cabeçalho do contrato, até chegar o PNG oficial.
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo-provisorio.png" alt="Lucauto" className={`w-auto ${className}`} />
);

export function Navegacao({ nome, perfil }: { nome: string; perfil: Perfil }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const itens = ITENS.filter((i) => !i.modulo || podeAcessar(perfil, i.modulo));

  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [aberto]);

  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Barra do celular: hambúrguer, logo ao centro */}
      <div className="sticky top-0 z-30 grid h-14 grid-cols-[48px_1fr_48px] items-center border-b border-linha bg-white px-2 lg:hidden">
        <button type="button" onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto} className="grid size-11 place-items-center rounded-[10px] hover:bg-slate-100">
          <Menu size={20} strokeWidth={1.75} />
        </button>
        <Link href="/" className="justify-self-center" aria-label="Início"><Logo className="h-5" /></Link>
      </div>

      {aberto && <button type="button" aria-label="Fechar menu" onClick={() => setAberto(false)} className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" />}

      <aside aria-label="Menu principal" className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-linha bg-white transition-transform duration-150 lg:translate-x-0 ${aberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 pb-4 pt-7">
          <Link href="/" aria-label="Início"><Logo className="h-6" /></Link>
          <button type="button" onClick={() => setAberto(false)} aria-label="Fechar menu" className="grid size-11 place-items-center rounded-[10px] hover:bg-slate-100 lg:hidden"><X size={20} strokeWidth={1.75} /></button>
        </div>

        <div className="px-4"><BlocoUsuario nome={nome} perfil={perfil} /></div>

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-4">
          {itens.map((i) => {
            const Icone = i.icone;
            const icone = Icone === "pdf" ? <IconePdf tamanho={20} /> : <Icone size={20} strokeWidth={1.75} aria-hidden="true" />;
            const base = "relative flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors duration-150";
            if (!i.href)
              return (
                <div key={i.rotulo} aria-disabled="true" className={`${base} cursor-default text-slate-600 opacity-55`}>
                  {icone}<span className="flex-1">{i.rotulo}</span><Selo>Em breve</Selo>
                </div>
              );
            const on = ativo(i.href);
            return (
              <Link key={i.rotulo} href={i.href} onClick={() => setAberto(false)} aria-current={on ? "page" : undefined} className={`${base} ${on ? "bg-dourado/12 font-semibold text-marinho" : "text-slate-700 hover:bg-gray-100"}`}>
                {on && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-dourado" />}
                <span className={i.icone === "pdf" ? "" : on ? "text-marinho" : "text-slate-500"}>{icone}</span>
                {i.rotulo}
              </Link>
            );
          })}
        </nav>

        <form action={sair} className="border-t border-linha p-4">
          <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-gray-100">
            <LogOut size={20} strokeWidth={1.75} aria-hidden="true" className="text-slate-500" />Sair
          </button>
        </form>
      </aside>
    </>
  );
}
