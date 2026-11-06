import type { Metadata } from "next";
import { modoAuth, modoDemo, USUARIOS_MOCK } from "@/lib/auth/mock";
import { NOME_PERFIL } from "@/lib/auth/tipos";
import { Logo } from "@/components/Logo";
import { SeletorTema } from "@/components/SeletorTema";
import { FormularioLogin } from "./FormularioLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function Login() {
  const mock = modoAuth() === "mock";
  // Em produção o login de teste é proibido: sem o Supabase configurado, ninguém entra ainda.
  const emConfiguracao = mock && process.env.NODE_ENV === "production" && !modoDemo();
  return (
    <main className="relative grid min-h-dvh place-items-center bg-fundo px-4 py-10">
      <div className="absolute right-4 top-4"><SeletorTema /></div>
      <div className="w-full max-w-md rounded-[14px] border border-linha bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="mb-5 flex justify-center"><Logo claro="h-10" escuro="h-16" /></div>
        <h1 className="mb-1 text-center text-[28px] font-bold leading-tight tracking-tight">Entrar no sistema</h1>
        <p className="mb-6 text-center text-sm text-suave">Sistema interno da Lucauto.</p>
        {emConfiguracao ? (
          <p role="status" className="rounded-lg bg-amber-50 text-amber-900 px-4 py-3 text-center text-sm">Sistema em configuração. O acesso será liberado em breve.</p>
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
