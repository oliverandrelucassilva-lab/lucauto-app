// Porteiro do app: quem não está logado vai para /login.
// (No Next 16 o antigo "middleware" se chama "proxy".)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_MOCK = "lucauto_sessao";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const aberta = pathname === "/login";
  const modoSupabase = process.env.AUTH_MODE === "supabase";

  let resposta = NextResponse.next({ request: req });
  let logado: boolean;

  if (modoSupabase) {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (lista) => {
          lista.forEach(({ name, value }) => req.cookies.set(name, value));
          resposta = NextResponse.next({ request: req });
          lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
        },
      },
    });
    logado = !!(await supabase.auth.getUser()).data.user; // também renova a sessão
  } else {
    // Só confere se há cookie; quem confere a assinatura é obterSessao() no servidor.
    logado = !!req.cookies.get(COOKIE_MOCK)?.value;
  }

  if (!logado && !aberta) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ erro: "Entre no sistema para continuar." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (logado && aberta) return NextResponse.redirect(new URL("/", req.url));
  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|manifest.webmanifest|sw.js|icons/|logo-provisorio.png|favicon.ico).*)"],
};
