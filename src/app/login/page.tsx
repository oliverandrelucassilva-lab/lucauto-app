import type { Metadata } from "next";
import { modoAuth, modoDemo, USUARIOS_MOCK } from "@/lib/auth/mock";
import { NOME_PERFIL } from "@/lib/auth/tipos";
import { FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function Login() {
  const mock = modoAuth() === "mock";
  // Em produção o login de teste é proibido: sem o Supabase configurado, ninguém entra ainda.
  const emConfiguracao = mock && process.env.NODE_ENV === "production" && !modoDemo();
  return (
    <main className="grid min-h-dvh place-items-center bg-marinho px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-provisorio.png" alt="Lucauto Empreendimentos Imobiliários" className="mx-auto mb-5 h-10 w-auto" />
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">Entrar no sistema</h1>
        <p className="mb-6 text-center text-sm text-marinho/70">Sistema interno da Lucauto.</p>
        {emConfiguracao ? (
          <p role="status" className="rounded-lg bg-aviso/70 px-4 py-3 text-center text-sm">Sistema em configuração. O acesso será liberado em breve.</p>
        ) : (
        <FormularioLogin
          mock={mock}
          demo={modoDemo()}
          pessoas={mock ? (Object.keys(USUARIOS_MOCK) as (keyof typeof USUARIOS_MOCK)[]).map((p) => ({ perfil: p, nome: USUARIOS_MOCK[p].nome, papel: NOME_PERFIL[p] })) : []}
        />
        )}
      </div>
    </main>
  );
}
