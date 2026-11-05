// Login de mentira, SÓ para desenvolvimento. Os usuários abaixo são fictícios.
// Em produção (NODE_ENV=production) este modo é recusado.
import crypto from "node:crypto";
import type { Perfil, Sessao } from "./tipos";

export const COOKIE_MOCK = "lucauto_sessao";
export const WORKSPACE_DEV = "00000000-0000-0000-0000-000000000001";

export const USUARIOS_MOCK: Record<Perfil, Sessao> = {
  gerente: { id: "00000000-0000-0000-0000-0000000000a1", nome: "Gerente de Teste", email: "gerente@exemplo.test", perfil: "gerente", workspaceId: WORKSPACE_DEV },
  corretor: { id: "00000000-0000-0000-0000-0000000000a2", nome: "Corretor de Teste", email: "corretor@exemplo.test", perfil: "corretor", workspaceId: WORKSPACE_DEV },
  marketing: { id: "00000000-0000-0000-0000-0000000000a3", nome: "Marketing de Teste", email: "marketing@exemplo.test", perfil: "marketing", workspaceId: WORKSPACE_DEV },
};

function segredo(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Defina SESSION_SECRET (16+ caracteres).");
  return "somente-para-desenvolvimento";
}

const assinar = (valor: string) => crypto.createHmac("sha256", segredo()).update(valor).digest("hex");

export function criarCookieMock(perfil: Perfil): string {
  if (process.env.NODE_ENV === "production") throw new Error("O login de teste não funciona em produção.");
  return `${perfil}.${assinar(perfil)}`;
}

export function lerCookieMock(valor: string | undefined): Sessao | null {
  if (!valor || process.env.NODE_ENV === "production") return null;
  const [perfil, assinatura] = valor.split(".");
  if (!assinatura || !(perfil in USUARIOS_MOCK)) return null;
  const esperado = assinar(perfil);
  const a = Buffer.from(assinatura), b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return USUARIOS_MOCK[perfil as Perfil];
}

export const modoAuth = (): "mock" | "supabase" => (process.env.AUTH_MODE === "supabase" ? "supabase" : "mock");
