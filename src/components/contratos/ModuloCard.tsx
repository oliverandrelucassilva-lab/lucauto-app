import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { IconePdf } from "@/components/IconePdf";
import { Selo } from "@/components/ui/Selo";
import type { Molde } from "@/lib/contratos/moldes";

/** Card de um molde de contrato: ícone PDF vermelho, nome e quando usar. */
export function ModuloCard({ molde }: { molde: Molde }) {
  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="grid size-10 place-items-center rounded-[10px] bg-red-50"><IconePdf tamanho={22} /></span>
        {!molde.ativo && <Selo>Em breve</Selo>}
      </div>
      <h3 className="mt-4 text-base font-bold text-tinta">{molde.titulo}</h3>
      <p className="mt-1 flex-1 text-sm text-suave">{molde.descricao}</p>
      {molde.ativo && <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-marinho">Criar contrato <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></span>}
    </>
  );
  const base = "flex h-full flex-col rounded-[14px] border border-linha bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors duration-150";
  return molde.ativo ? (
    <Link href={`/contratos/novo/${molde.slug}`} className={`${base} hover:border-dourado`}>{conteudo}</Link>
  ) : (
    <div aria-disabled="true" className={`${base} opacity-70`}>{conteudo}</div>
  );
}
