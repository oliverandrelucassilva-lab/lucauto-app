import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clienteSupabase } from "@/lib/supabase/servidor";
import { COOKIE_MOCK, lerCookieMock, modoAuth } from "./mock";
import { podeAcessar, type Modulo } from "./permissoes";
import type { Perfil, Sessao } from "./tipos";

/** Quem está logado agora (ou null). */
export async function obterSessao(): Promise<Sessao | null> {
  if (modoAuth() === "mock") return lerCookieMock((await cookies()).get(COOKIE_MOCK)?.value);

  const supabase = await clienteSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await supabase.from("profiles").select("nome, perfil, workspace_id").eq("id", data.user.id).single();
  if (!perfil) return null;
  return { id: data.user.id, nome: perfil.nome, email: data.user.email ?? "", perfil: perfil.perfil as Perfil, workspaceId: perfil.workspace_id };
}

/** Exige login; sem login, vai para a tela de entrada. */
export async function exigirSessao(): Promise<Sessao> {
  const s = await obterSessao();
  if (!s) redirect("/login");
  return s;
}

/** Exige login e acesso ao módulo; sem acesso, volta para o início. */
export async function exigirModulo(modulo: Modulo): Promise<Sessao> {
  const s = await exigirSessao();
  if (!podeAcessar(s.perfil, modulo)) redirect("/?aviso=sem-acesso");
  return s;
}
