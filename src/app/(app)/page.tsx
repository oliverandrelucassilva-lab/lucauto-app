import { Building2, FilePlus2 } from "lucide-react";
import { ListaContratos } from "@/components/contratos/ListaContratos";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { CabecalhoPagina } from "@/components/ui/CabecalhoPagina";
import { Selo } from "@/components/ui/Selo";
import { podeAcessar } from "@/lib/auth/permissoes";
import { exigirSessao } from "@/lib/auth/sessao";
import { pdfDisponivel } from "@/lib/contratos/converter-pdf";
import { hojeISO } from "@/lib/contratos/regras";
import { repositorio } from "@/lib/contratos/repositorio";

const dataPorExtensoHoje = () => new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bahia" }).format(new Date());
const diaBahia = (iso: string) => hojeISO(new Date(iso));

export default async function Inicio(props: PageProps<"/">) {
  const sessao = await exigirSessao();
  const { aviso } = await props.searchParams;
  const ve = podeAcessar(sessao.perfil, "contratos");
  const contratos = ve ? await repositorio().listar(sessao) : [];
  const hoje = hojeISO();
  const doMes = contratos.filter((c) => diaBahia(c.criadoEm).slice(0, 7) === hoje.slice(0, 7)).length;
  const deHoje = contratos.filter((c) => diaBahia(c.criadoEm) === hoje).length;
  const data = dataPorExtensoHoje();

  return (
    <div className="space-y-6">
      <CabecalhoPagina titulo={`Olá, ${sessao.nome.split(" ")[0]}`} descricao={data.charAt(0).toUpperCase() + data.slice(1)} />

      {aviso === "sem-acesso" && <p role="alert" className="rounded-[10px] bg-amber-50 px-4 py-3 text-sm text-amber-900">Seu perfil não tem acesso a essa área.</p>}

      <section aria-label="Atalhos rápidos" className="grid gap-4 sm:grid-cols-2">
        {ve && (
          <Cartao className="flex items-center gap-4 border-dourado/50 bg-dourado/10">
            <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-dourado text-marinho"><FilePlus2 size={20} strokeWidth={1.75} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold">Novo contrato</p>
              <p className="text-sm text-suave">Escolha o modelo e preencha os dados.</p>
            </div>
            <Botao href="/contratos">Começar</Botao>
          </Cartao>
        )}
        <Cartao className="flex items-center gap-4 opacity-70" aria-disabled="true">
          <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-slate-100 text-slate-500"><Building2 size={20} strokeWidth={1.75} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">Cadastrar imóvel</p>
            <p className="text-sm text-suave">Cadastro com fotos e planilha.</p>
          </div>
          <Selo>Em breve</Selo>
        </Cartao>
      </section>

      {ve && (
        <>
          <section aria-label="Resumo" className="grid gap-4 sm:grid-cols-2">
            <Cartao>
              <p className="text-sm text-suave">Contratos do mês</p>
              <p className="mt-1 text-[28px] font-bold leading-none">{doMes}</p>
              <p className="mt-2 text-xs text-suave">{doMes === 0 ? "Nenhum contrato neste mês ainda." : "Gerados neste mês."}</p>
            </Cartao>
            <Cartao>
              <p className="text-sm text-suave">Gerados hoje</p>
              <p className="mt-1 text-[28px] font-bold leading-none">{deHoje}</p>
              <p className="mt-2 text-xs text-suave">{deHoje === 0 ? "Nada gerado hoje ainda." : "Gerados hoje."}</p>
            </Cartao>
          </section>

          <section aria-label="Últimos contratos gerados" className="space-y-3">
            <h2 className="text-base font-bold">Últimos contratos gerados</h2>
            <ListaContratos contratos={contratos.slice(0, 5)} pdf={pdfDisponivel()} />
          </section>
        </>
      )}
    </div>
  );
}
