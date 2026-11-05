import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { configEmpresa } from "@/config/empresa";
import { exigirModulo } from "@/lib/auth/sessao";
import { valoresIniciais } from "@/lib/contratos/dados";
import { pdfDisponivel } from "@/lib/contratos/converter-pdf";
import { definicaoPorSlug } from "@/lib/contratos/definicoes";
import { paragrafosDoModelo } from "@/lib/contratos/modelo";
import { moldePorSlug } from "@/lib/contratos/moldes";
import { hojeISO } from "@/lib/contratos/regras";
import { FormularioContrato } from "./FormularioContrato";

export const metadata: Metadata = { title: "Novo contrato" };

export default async function NovoContrato(props: PageProps<"/contratos/novo/[molde]">) {
  await exigirModulo("contratos");
  const { molde: slug } = await props.params;
  const molde = moldePorSlug(slug);
  const def = definicaoPorSlug(slug);
  if (!molde?.ativo || !def) notFound();
  return (
    <div className="space-y-6" data-largo>
      <Link href="/contratos" className="inline-flex h-11 items-center gap-1 text-sm font-medium text-suave hover:text-tinta"><ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />Gerador de PDFs</Link>
      <CabecalhoPagina titulo={molde.titulo} descricao="Preencha em etapas curtas e acompanhe o contrato ficando pronto na prévia." />
      <FormularioContrato slug={molde.slug} etapas={def.etapas} pdf={pdfDisponivel()} temFundo={def.temFundo} linhas={def.linhasPorPagina} paragrafos={paragrafosDoModelo(molde.slug)} inicial={valoresIniciais(molde.slug, hojeISO())} empresa={configEmpresa()} />
    </div>
  );
}
