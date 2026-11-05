import Link from "next/link";
import { Cabecalho } from "@/components/Cabecalho";
import { exigirSessao } from "@/lib/auth/sessao";
import { podeAcessar, type Modulo } from "@/lib/auth/permissoes";

const MODULOS: { id: Modulo; titulo: string; texto: string; href?: string }[] = [
  { id: "contratos", titulo: "Contratos", texto: "Crie o contrato em Word e PDF a partir dos moldes da Lucauto.", href: "/contratos" },
  { id: "imoveis", titulo: "Imóveis", texto: "Cadastro dos imóveis e das fotos." },
  { id: "painel", titulo: "Painel", texto: "Imóveis por situação, contratos do mês e comissões previstas." },
  { id: "automacoes", titulo: "Automações", texto: "Envio automático de fotos e mensagens." },
];

export default async function Inicio(props: PageProps<"/">) {
  const sessao = await exigirSessao();
  const { aviso } = await props.searchParams;
  return (
    <>
      <Cabecalho sessao={sessao} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Olá, {sessao.nome.split(" ")[0]}</h1>
        <p className="mt-1 text-marinho/70">O que você quer fazer hoje?</p>
        {aviso === "sem-acesso" && <p role="alert" className="mt-4 rounded-lg bg-aviso/70 px-4 py-3 text-sm">Seu perfil não tem acesso a essa área.</p>}
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {MODULOS.map((m) => {
            const ativo = !!m.href && podeAcessar(sessao.perfil, m.id);
            const conteudo = (
              <>
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display text-xl font-bold">{m.titulo}</span>
                  {!m.href && <span className="rounded-full bg-marinho/10 px-3 py-1 text-xs font-bold">Em breve</span>}
                </span>
                <span className="mt-2 block text-sm text-marinho/70">{m.texto}</span>
                {ativo && <span className="mt-4 block font-bold text-marinho">Abrir →</span>}
              </>
            );
            const base = "block h-full rounded-2xl border-2 p-5 ";
            return (
              <li key={m.id}>
                {ativo ? (
                  <Link href={m.href!} className={base + "border-dourado bg-white shadow-sm transition hover:shadow-md focus-visible:outline-3 focus-visible:outline-marinho"}>{conteudo}</Link>
                ) : (
                  <div aria-disabled="true" className={base + "border-marinho/10 bg-white/60 text-marinho/60"}>{conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
