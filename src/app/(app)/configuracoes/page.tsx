import type { Metadata } from "next";
import { Cartao } from "@/components/ui/Cartao";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { configEmpresa } from "@/config/empresa";
import { exigirModulo } from "@/lib/auth/sessao";

export const metadata: Metadata = { title: "Configurações" };

export default async function Configuracoes() {
  await exigirModulo("configuracoes");
  const c = configEmpresa();
  const linhas: [string, string | null][] = [
    ["CNPJ da Lucauto", c.cnpj],
    ["CRECI jurídico da Lucauto", c.creciJuridico],
    ["Corretora responsável", c.corretoraNome],
    ["CRECI da corretora responsável", c.corretoraCreci],
  ];
  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo="Configurações" descricao="Dados da empresa usados nos contratos." />
      <Cartao semPadding>
        <dl className="divide-y divide-linha">
          {linhas.map(([nome, valor]) => (
            <div key={nome} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
              <dt className="text-sm text-suave">{nome}</dt>
              <dd className={`text-sm font-semibold ${valor ? "text-tinta" : "text-amber-700"}`}>{valor ?? "[A CONFIRMAR]"}</dd>
            </div>
          ))}
        </dl>
      </Cartao>
      <p className="text-sm text-suave">Enquanto estiverem como [A CONFIRMAR], esses dados saem assim nos contratos. Por enquanto a equipe técnica preenche; a edição por esta tela vem depois.</p>
    </div>
  );
}
