import type { Metadata } from "next";
import { ModuloCard } from "@/components/contratos/ModuloCard";
import { ListaContratos } from "@/components/contratos/ListaContratos";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { exigirModulo } from "@/lib/auth/sessao";
import { pdfDisponivel } from "@/lib/contratos/converter-pdf";
import { MOLDES } from "@/lib/contratos/moldes";
import { repositorio } from "@/lib/contratos/repositorio";

export const metadata: Metadata = { title: "Gerador de PDFs" };

export default async function GeradorDePdfs() {
  const sessao = await exigirModulo("contratos");
  const historico = await repositorio().listar(sessao);
  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Gerador de PDFs" descricao="Escolha o modelo, preencha os dados e baixe em Word e PDF." />
      <section aria-label="Modelos" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOLDES.map((m) => <ModuloCard key={m.slug} molde={m} />)}
      </section>
      <section aria-label="Contratos gerados" className="space-y-3">
        <h2 className="text-base font-bold">Contratos gerados</h2>
        <ListaContratos contratos={historico} pdf={pdfDisponivel()} />
      </section>
    </div>
  );
}
