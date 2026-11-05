"use client";
import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./actions";

interface Props {
  mock: boolean;
  demo?: boolean;
  pessoas: { perfil: string; nome: string; papel: string }[];
}

export function FormularioLogin({ mock, demo, pessoas }: Props) {
  const [estado, acao, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});
  return (
    <form action={acao} className="space-y-4">
      {mock ? (
        <fieldset>
          <legend className="mb-2 rounded-lg bg-amber-50 text-amber-900 px-3 py-2 text-sm">{demo ? "Modo de demonstração: escolha uma pessoa fictícia. Use só dados de teste; nada é guardado." : "Modo de teste: escolha uma pessoa fictícia. Não há senha."}</legend>
          <div className="space-y-2">
            {pessoas.map((p, i) => (
              <label key={p.perfil} className="flex h-11 cursor-pointer items-center gap-3 rounded-[10px] border border-slate-300 px-3 text-sm has-[:checked]:border-dourado has-[:checked]:bg-dourado/10">
                <input type="radio" name="perfil" value={p.perfil} defaultChecked={i === 0} className="accent-dourado" />
                <span className="font-semibold">{p.nome}</span>
                <span className="ml-auto text-xs text-suave">{p.papel}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <>
          <label className="block text-sm font-medium">E-mail<input name="email" type="email" autoComplete="username" required className="campo mt-1" /></label>
          <label className="block text-sm font-medium">Senha<input name="senha" type="password" autoComplete="current-password" required className="campo mt-1" /></label>
        </>
      )}
      {estado.erro && <p role="alert" className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700">{estado.erro}</p>}
      <button type="submit" disabled={pendente} className="btn btn-primario w-full">{pendente ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
