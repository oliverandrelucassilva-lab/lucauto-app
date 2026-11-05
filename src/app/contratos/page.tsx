import type { Metadata } from "next";
import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirModulo } from "@/lib/auth/sessao";
import { MOLDES, moldePorSlug } from "@/lib/contratos/moldes";
import { formatarBRL } from "@/lib/contratos/extenso";
import { dataCurta } from "@/lib/contratos/regras";
import { repositorio } from "@/lib/contratos/repositorio";

export const metadata: Metadata = { title: "Contratos" };

export default async function Contratos() {
  const sessao = await exigirModulo("contratos");
  const historico = await repositorio().listar(sessao);
  return (
    <>
      <Cabecalho sessao={sessao} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-2 text-sm"><Link href="/" className="underline">Início</Link></nav>
        <h1 className="font-display text-3xl font-bold">Contratos</h1>
        <p className="mt-1 text-marinho/70">Escolha o molde, preencha os dados e baixe o contrato em Word e PDF.</p>

        <h2 className="mt-8 font-display text-xl font-bold">Moldes</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOLDES.map((m) => (
            <li key={m.slug} className={`flex flex-col rounded-2xl border-2 bg-white p-4 ${m.ativo ? "border-dourado" : "border-marinho/10 text-marinho/60"}`}>
              <span className="text-xs font-bold text-marinho/50">Molde {m.numero}</span>
              <span className="font-display text-lg font-bold">{m.titulo}</span>
              <span className="mt-1 flex-1 text-sm">{m.descricao}</span>
              {m.ativo ? (
                <Link href={`/contratos/novo/${m.slug}`} className="btn-principal mt-4 w-full">Criar contrato</Link>
              ) : (
                <span className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-marinho/10 text-sm font-bold">Em breve</span>
              )}
            </li>
          ))}
        </ul>

        <h2 className="mt-10 font-display text-xl font-bold">Contratos gerados</h2>
        {historico.length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-marinho/70">Nenhum contrato gerado ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-marinho/10 overflow-hidden rounded-2xl bg-white">
            {historico.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="truncate font-bold">{c.titulo}</p>
                  <p className="text-sm text-marinho/70">
                    {moldePorSlug(c.molde)?.titulo} · {c.tipoImovel === "rural" ? "Rural" : "Urbano"} · {formatarBRL(c.valorCentavos)} · assinatura {dataCurta(c.dataAssinatura)} · por {c.criadoPorNome}
                  </p>
                  {c.pendenciasEmpresa.length > 0 && <p className="mt-1 text-xs text-amber-800">Saiu com [A CONFIRMAR]: {c.pendenciasEmpresa.join(", ")}.</p>}
                </div>
                <div className="flex gap-2">
                  <a className="btn-secundario" href={`/api/contratos/${c.id}/docx`}>Word</a>
                  <a className="btn-secundario" href={`/api/contratos/${c.id}/pdf`}>PDF</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
