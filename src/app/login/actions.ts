"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_MOCK, criarCookieMock, modoAuth } from "@/lib/auth/mock";
import type { Perfil } from "@/lib/auth/tipos";
import { clienteSupabase } from "@/lib/supabase/servidor";

export interface EstadoLogin {
  erro?: string;
}

export async function entrar(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  if (modoAuth() === "mock") {
    const perfil = String(form.get("perfil")) as Perfil;
    if (!["gerente", "corretor", "marketing"].includes(perfil)) return { erro: "Escolha uma pessoa para entrar." };
    (await cookies()).set(COOKIE_MOCK, criarCookieMock(perfil), { httpOnly: true, sameSite: "lax", path: "/", secure: false });
    redirect("/");
  }
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Digite o e-mail e a senha." };
  const supabase = await clienteSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos." };
  redirect("/");
}

export async function sair() {
  if (modoAuth() === "mock") (await cookies()).delete(COOKIE_MOCK);
  else await (await clienteSupabase()).auth.signOut();
  redirect("/login");
}
