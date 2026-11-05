import { NOME_PERFIL, type Perfil } from "@/lib/auth/tipos";

const iniciais = (nome: string) => {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
};

export function BlocoUsuario({ nome, perfil }: { nome: string; perfil: Perfil }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-fundo px-3 py-3">
      <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-marinho text-sm font-bold text-white">{iniciais(nome)}</span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-tinta">Olá, {nome.split(" ")[0]}</p>
        <p className="text-xs text-suave">{NOME_PERFIL[perfil]}</p>
      </div>
    </div>
  );
}
