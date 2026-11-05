import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho } from "@/components/Cabecalho";
import { configEmpresa } from "@/config/empresa";
import { exigirModulo } from "@/lib/auth/sessao";
import { valoresIniciais } from "@/lib/contratos/dados";
import { paragrafosDoModelo } from "@/lib/contratos/modelo";
import { moldePorSlug } from "@/lib/contratos/moldes";
import { hojeISO } from "@/lib/contratos/regras";
import { FormularioContrato } from "./FormularioContrato";

export const metadata: Metadata = { title: "Novo contrato" };

export default async function NovoContrato(props: PageProps<"/contratos/novo/[molde]">) {
  const sessao = await exigirModulo("contratos");
  const { molde: slug } = await props.params;
  const molde = moldePorSlug(slug);
  if (!molde?.ativo) notFound();
  return (
    <>
      <Cabecalho sessao={sessao} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-2 text-sm"><Link href="/contratos" className="underline">← Contratos</Link></nav>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{molde.titulo}</h1>
        <FormularioContrato slug={molde.slug} paragrafos={paragrafosDoModelo(molde.slug)} inicial={valoresIniciais(hojeISO())} empresa={configEmpresa()} />
      </main>
    </>
  );
}
